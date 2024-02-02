import type {
  MessageProps,
  PromptElement,
  PromptNode,
  ScopeProps,
} from "./node";

export * from "./node";
export * from "./core";

export * from "./components/fragment";
export * from "./components/assistant-message";
export * from "./components/system-message";
export * from "./components/user-message";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      scope: ScopeProps;
      message: MessageProps;
    }
    type Element = PromptElement;
    type ElementType = keyof IntrinsicElements | ((props: any) => PromptNode);
  }
}
