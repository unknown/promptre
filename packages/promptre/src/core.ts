import { isLiteral } from "./node.js";
import type { PromptElement, PromptNode } from "./node.js";

type IntrinsicElement = keyof JSX.IntrinsicElements;
type IntrinsicElementProps<T extends IntrinsicElement> =
  JSX.IntrinsicElements[T];

export function createElement<T extends IntrinsicElement>(
  tag: T,
  props: IntrinsicElementProps<T> | null,
  ...children: PromptNode[]
): PromptElement {
  const propsToPass = {
    ...props,
    children,
  };

  switch (tag) {
    case "scope": {
      return {
        type: "scope",
        props: propsToPass,
      };
    }
    default: {
      throw new Error(`Unknown prompt tag: ${tag}`);
    }
  }
}

export function render(node: PromptNode): string {
  if (isLiteral(node)) {
    return node ? node.toString() : "";
  }

  if (Array.isArray(node)) {
    const results = node.map((child) => render(child));
    return results.join(" ");
  }

  switch (node.type) {
    case "scope": {
      return render(node.props.children);
    }
  }
}
