import * as Promptre from "../index";
import type { PromptNode } from "../node";

export type SystemMessageProps = {
  children?: PromptNode;
};

export function SystemMessage({ children }: SystemMessageProps): PromptNode {
  return <message role="system">{children}</message>;
}
