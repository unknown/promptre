import type { PromptNode } from "../node";

export type FragmentProps = {
  children: PromptNode;
};

export function Fragment({ children }: FragmentProps) {
  return children;
}
