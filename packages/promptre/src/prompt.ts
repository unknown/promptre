import { Tokenizer } from "@promptre/tokenizer";

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

export type RenderedPrompt = StringPrompt | MessagePrompt;

export function joinPrompts(prompts: RenderedPrompt[]): RenderedPrompt {
  let result: RenderedPrompt | undefined = prompts[0];

  if (result === undefined) {
    throw new Error("Cannot join an empty list of prompts");
  }

  for (let i = 1; i < prompts.length; ++i) {
    const currPrompt = prompts[i]!;

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
  }
}

export function countPromptTokens(
  prompt: RenderedPrompt,
  tokenizer: Tokenizer,
): number {
  switch (prompt.type) {
    case "string": {
      return tokenizer.countTokens(prompt.content);
    }
    case "message": {
      let numTokens = 0;

      for (const message of prompt.messages) {
        numTokens += tokenizer.countTokens(message.content);
        numTokens += 4; // e.g.: <|im_start|>user<|im_sep|><|im_end|>
      }

      numTokens += 3; // e.g.: <|start|>assistant<|im_sep|>

      return numTokens;
    }
  }
}
