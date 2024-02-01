import * as Promptre from "../index";
import type { PromptNode } from "../node";

export type AssistantMessageProps = {
  children?: PromptNode;
};

export function AssistantMessage({
  children,
}: AssistantMessageProps): PromptNode {
  return <message role="assistant">{children}</message>;
}
