export type StringPrompt = string;

export function isStringPrompt(prompt: RenderedPrompt): prompt is StringPrompt {
  return typeof prompt === "string";
}

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

export function isMessagePrompt(
  prompt: RenderedPrompt,
): prompt is MessagePrompt {
  return typeof prompt === "object" && prompt.type === "message";
}

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

    if (isStringPrompt(result) && isStringPrompt(currPrompt)) {
      result += currPrompt;
    } else if (isMessagePrompt(result) && isMessagePrompt(currPrompt)) {
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
        `Cannot join prompts of different types: \"${result}\", \"${currPrompt}\"`,
      );
    }
  }

  return result;
}

export function promptToString(prompt: RenderedPrompt) {
  if (isStringPrompt(prompt)) {
    return prompt;
  } else if (isMessagePrompt(prompt)) {
    return prompt.messages.join();
  }
  throw new Error(`Failed to convert prompt ${prompt} to string`);
}

export type RenderedPrompt = StringPrompt | MessagePrompt;
