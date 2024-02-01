// literal values that can be rendered
export type Literal = string | number | boolean | undefined | null;

export function isLiteral(node: PromptNode): node is Literal {
  return (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "boolean" ||
    node === undefined ||
    node === null
  );
}

export interface Element<S, P, InternalProps = {}> {
  type: S;
  props: P & InternalProps;
}

export type PropsWithPriority<P> = P & { p?: number; prel?: number };
export type PropsWithChildren<P> = P & { children?: PromptNode | undefined };

export type ScopeProps = PropsWithPriority<PropsWithChildren<{}>>;
export type ScopeElement = Element<
  "scope",
  ScopeProps,
  { children: PromptNode }
>;

export type MessageProps = PropsWithChildren<{
  role: "assistant" | "system" | "user";
}>;
export type MessageElement = Element<"message", MessageProps, {}>;

export interface FunctionComponent<P = {}> {
  (props: P): PromptNode;
}
export type FunctionComponentElement = Element<FunctionComponent, {}>;

// represents elements that can be created via `Promptre.createElement`
export type PromptElement =
  | ScopeElement
  | MessageElement
  | FunctionComponentElement;

// represents anything a Prompt can render
export type PromptNode = PromptNode[] | PromptElement | Literal;
