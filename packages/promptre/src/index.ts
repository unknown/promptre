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

export * from "@promptre/tokenizer";

export namespace JSX {
  export interface IntrinsicElements {
    scope: ScopeProps;
    message: MessageProps;
  }
  export type Element = PromptElement;
  export type ElementType =
    | keyof IntrinsicElements
    | ((props: any) => PromptNode);
}
