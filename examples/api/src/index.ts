import * as Promptre from "promptre";
import OpenAI from "openai";
import Fastify from "fastify";
import * as Story from "./prompts/story";

const fastify = Fastify({ logger: true });
const openai = new OpenAI();

const model = "gpt-3.5-turbo";
const tokenizer = new Promptre.Tokenizer(model);

fastify.get<{ Querystring: { protagonist: string; stream?: boolean } }>(
  "/story",
  {
    schema: {
      querystring: {
        type: "object",
        properties: {
          protagonist: { type: "string" },
          stream: { type: "boolean" },
        },
        required: ["protagonist"],
      },
    },
  },
  async function handler(request, reply) {
    const { protagonist, stream } = request.query;

    const prompt = Promptre.render(Story.default({ protagonist }), {
      tokenizer,
    });

    const messages =
      prompt.type === "string"
        ? [
            {
              role: "system" as const,
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

        const transformed = await Story.onStream(content);

        reply.raw.write(transformed);
      }

      return reply.raw.end();
    } else {
      const chat = await openai.chat.completions.create({
        model,
        messages,
        stream: false,
      });

      const content = chat.choices[0]?.message?.content;

      if (content === undefined || content === null) {
        return reply.status(500).send("Completion is invalid");
      }

      const transformed = await Story.onOutput(content);

      return reply.send(transformed);
    }
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
