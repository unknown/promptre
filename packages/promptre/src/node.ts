export interface Element<S extends String, P, InternalProps = {}> {
  type: S;
  props: P & InternalProps;
}

export type PropsWithPriority<P> = P & { p?: number; prel?: number };
export type PropsWithChildren<P> = P & { children?: PromptNode | undefined };

export type ScopeProps = PropsWithPriority<PropsWithChildren<{}>>;
export type Scope = Element<"scope", ScopeProps, { children: PromptNode }>;

export type PromptElement = Scope;

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

export type PromptNode = PromptNode[] | PromptElement | Literal;
