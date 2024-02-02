import * as Promptre from "promptre";
import OpenAI from "openai";
import Fastify from "fastify";
import { Story } from "./prompts/story";

const fastify = Fastify({ logger: true });
const openai = new OpenAI();

const model = "gpt-3.5-turbo";

fastify.get<{ Querystring: { protagonist?: string } }>(
  "/story",
  async function handler(request, reply) {
    const { protagonist } = request.query;

    if (!protagonist) {
      return reply.status(400).send("Missing protagonist query");
    }

    const prompt = Promptre.render(Story({ protagonist }), { model });

    const messages =
      prompt.type === "string"
        ? [
            {
              role: "system" as const,
              content: prompt.content,
            },
          ]
        : prompt.messages;

    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    reply.hijack();
    reply.raw.writeHead(200, { "Content-Type": "text/event-stream" });

    for await (const part of stream) {
      reply.raw.write(part.choices[0]?.delta?.content ?? "");
    }

    return reply.raw.end();
  },
);

async function main() {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

void main();
