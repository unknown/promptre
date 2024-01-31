import type { PromptElement, ScopeProps } from "./node.js";

export * from "./node.js";
export * from "./core.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      scope: ScopeProps;
    }
    type Element = PromptElement;
  }
}
