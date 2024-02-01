import type { PromptElement, ScopeProps } from "./node";

export * from "./node";
export * from "./core";

export * from "./components/fragment";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      scope: ScopeProps;
    }
    type Element = PromptElement;
  }
}
