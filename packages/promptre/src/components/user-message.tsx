import * as Promptre from "../index";
import type { PromptNode } from "../node";

export type UserMessageProps = {
  children?: PromptNode;
};

export function UserMessage({ children }: UserMessageProps): PromptNode {
  return <message role="user">{children}</message>;
}
