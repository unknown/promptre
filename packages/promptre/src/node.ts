// literal values that can be rendered
export type Literal = string | number | null | undefined | boolean;

export function isLiteral(node: PromptNode): node is Literal {
  return (
    node === undefined ||
    node === null ||
    typeof node === "boolean" ||
    typeof node === "number" ||
    typeof node === "string"
  );
}

export interface Element<S extends String, P, InternalProps = {}> {
  type: S;
  props: P & InternalProps;
}

export type PropsWithPriority<P> = P & { p?: number; prel?: number };
export type PropsWithChildren<P> = P & { children?: PromptNode | undefined };

export type ScopeProps = PropsWithPriority<PropsWithChildren<{}>>;
export type Scope = Element<"scope", ScopeProps, { children: PromptNode }>;

// represents elements that can be created via `Promptre.createElement`
export type PromptElement = Scope;

// represents anything a Prompt can render
export type PromptNode = PromptNode[] | PromptElement | Literal;
