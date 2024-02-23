import * as Promptre from "promptre";
import urlData from "@fastify/url-data";
import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import OpenAI from "openai";

const openai = new OpenAI();

const model = "gpt-3.5-turbo";
const tokenizer = new Promptre.Tokenizer(model);

const fastify = Fastify({ logger: true });
fastify.register(urlData);

fastify.get<{ Querystring: { stream?: boolean } }>(
  "/*",
  {
    schema: {
      querystring: {
        type: "object",
        properties: { stream: { type: "boolean" } },
      },
    },
  },
  async function handler(request, reply) {
    const path = request.urlData().path;

    if (!path) {
      reply.status(500).send("Failed to get prompt from query");
      return;
    }

    executeRoute(`./${path}`, request, reply);

    return reply;
  },
);

async function executeRoute(
  importURL: string,
  request: FastifyRequest<{ Querystring: { stream?: boolean } }>,
  reply: FastifyReply,
) {
  try {
    const module = await import(importURL);
    const { stream, ...props } = request.query;
    const prompt = Promptre.render(module.default(props), { tokenizer });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      prompt.type === "string"
        ? [
            {
              role: "system",
              content: prompt.content,
            },
          ]
        : prompt.messages;

    if (stream) {
      const chatStream = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      reply.hijack();
      reply.raw.writeHead(200, { "Content-Type": "text/event-stream" });

      for await (const chunk of chatStream) {
        const content = chunk.choices[0]?.delta?.content;

        if (content === undefined || content === null) {
          continue;
        }

        const transformed =
          "onStream" in module ? await module.onStream(content) : null;

        reply.raw.write(transformed ?? content);
      }

      reply.raw.end();
    } else {
      const chat = await openai.chat.completions.create({
        model,
        messages,
        stream: false,
      });

      const content = chat.choices[0]?.message?.content;

      if (content === undefined || content === null) {
        reply.status(500).send("Completion is invalid");
        return;
      }

      const transformed =
        "onOutput" in module ? await module.onOutput(content) : null;

      reply.send(transformed ?? content);
    }
  } catch (err) {
    console.error(err);
    reply.status(404).send("Prompt not found");
  }
}

async function main() {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

void main();
