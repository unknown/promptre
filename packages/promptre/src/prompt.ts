export type StringPrompt = {
  type: "string";
  content: string;
};

export type AssistantMessage = {
  role: "assistant";
  content: string;
};

export type SystemMessage = {
  role: "system";
  content: string;
};

export type UserMessage = {
  role: "user";
  content: string;
};

export type Message = AssistantMessage | SystemMessage | UserMessage;

export type MessagePrompt = {
  type: "message";
  messages: Message[];
};

export function joinPrompts(prompts: RenderedPrompt[]): RenderedPrompt {
  let result: RenderedPrompt | undefined = prompts[0];

  if (result === undefined) {
    throw new Error("Cannot join an empty list of prompts");
  }

  for (let i = 1; i < prompts.length; ++i) {
    const currPrompt = prompts[i];

    if (currPrompt === undefined) {
      continue;
    }

    if (result.type === "string" && currPrompt.type === "string") {
      result.content += promptToString(currPrompt);
    } else if (result.type === "message" && currPrompt.type === "message") {
      for (const message of currPrompt.messages) {
        // join messages of the same role
        const lastMessage = result.messages.at(-1);
        if (lastMessage?.role === message.role) {
          lastMessage.content += message.content;
        } else {
          result.messages.push(message);
        }
      }
    } else {
      throw new Error(
        `Cannot join prompts of types: \"${result.type}\", \"${currPrompt.type}\"`,
      );
    }
  }

  return result;
}

export function promptToString(prompt: RenderedPrompt): string {
  switch (prompt.type) {
    case "string": {
      return prompt.content;
    }
    case "message": {
      return prompt.messages.map((message) => message.content).join("");
    }
    default: {
      throw new Error(`Failed to convert prompt ${prompt} to string`);
    }
  }
}

export type RenderedPrompt = StringPrompt | MessagePrompt;
