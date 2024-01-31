import { countTokens, getContextSize } from "@promptre/tokenizer";

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

function computePriorities(
  node: PromptNode,
  parentPriority: number,
  priorities: Set<number>,
) {
  if (isLiteral(node)) {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      computePriorities(child, parentPriority, priorities);
    }
    return;
  }

  switch (node.type) {
    case "scope": {
      const priority = node.props.p ?? parentPriority + (node.props.prel ?? 0);
      // store priorities for re-use later (e.g. rendering)
      node.props.p = priority;
      priorities.add(priority);
      computePriorities(node.props.children, priority, priorities);
    }
  }
}

// TODO: what if a node has a higher priorty than its parent?
function renderRecursive(
  node: PromptNode,
  priorityLimit: number,
): string | null {
  if (isLiteral(node)) {
    return node ? node.toString() : null;
  }

  if (Array.isArray(node)) {
    const results = node.map((child) => renderRecursive(child, priorityLimit));

    return results
      .filter((result): result is string => result !== null)
      .join(" ");
  }

  switch (node.type) {
    case "scope": {
      const priority = node.props.p;

      if (!priority) {
        throw new Error(
          "Error rendering: failed to precalculate scope element's priority",
        );
      }

      if (priority > priorityLimit) {
        return null;
      }

      return renderRecursive(node.props.children, priorityLimit);
    }
  }
}

export interface RenderOptions {
  model: string;
  tokenLimit?: number;
}

export function render(node: PromptNode, options: RenderOptions): string {
  // TODO: use a model's token limit as default
  const { model, tokenLimit = getContextSize(model) } = options;

  // compute priority levels to binary search on
  const priorities: Set<number> = new Set();
  computePriorities(node, 0, priorities);
  const sortedPriorities = Array.from(priorities).sort((a, b) => a - b);

  // binary search to find max priority level
  let left = 0;
  let right = sortedPriorities.length - 1;
  let maxPriorityIndex = 0;
  while (left <= right) {
    const candidateIndex = left + Math.floor((right - left) / 2);
    const candidatePriority = sortedPriorities[candidateIndex]!;

    const result = renderRecursive(node, candidatePriority);
    const numTokens = result ? countTokens(result, model) : null;

    if (numTokens !== null && numTokens <= tokenLimit) {
      maxPriorityIndex = candidateIndex;
      left = candidateIndex + 1;
    } else {
      right = candidateIndex - 1;
    }
  }

  const maxPriority = sortedPriorities[maxPriorityIndex]!;

  return renderRecursive(node, maxPriority) ?? "";
}
