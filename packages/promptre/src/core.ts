import { countTokens, getContextSize } from "@promptre/tokenizer";

import { isLiteral } from "./node";
import type { FunctionComponent, PromptElement, PromptNode } from "./node";
import { joinPrompts, promptToString } from "./prompt";
import type { Message, RenderedPrompt } from "./prompt";

type IntrinsicElement = keyof JSX.IntrinsicElements;
type IntrinsicElementProps<T extends IntrinsicElement> =
  JSX.IntrinsicElements[T];

export function createElement<T extends IntrinsicElement>(
  tag: T,
  props: IntrinsicElementProps<T>,
  ...children: PromptNode[]
): PromptElement;

export function createElement<P>(
  tag: FunctionComponent<P>,
  props: P,
  ...children: PromptNode[]
): PromptElement;

export function createElement<T extends IntrinsicElement | FunctionComponent>(
  tag: T,
  props: any,
  ...children: PromptNode[]
): PromptElement {
  const propsToPass = {
    ...props,
    children,
  };

  if (typeof tag === "function") {
    return {
      type: tag,
      props: propsToPass,
    };
  }

  switch (tag) {
    case "scope": {
      return {
        type: "scope",
        props: propsToPass,
      };
    }
    case "message": {
      return {
        type: "message",
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

  if (typeof node.type === "function") {
    throw new Error(
      "Error rendering: function components should have been pre-rendered",
    );
  }

  switch (node.type) {
    case "scope": {
      const priority = node.props.p ?? parentPriority + (node.props.prel ?? 0);
      // store priorities for re-use later (e.g. rendering)
      node.props.p = priority;
      priorities.add(priority);
      computePriorities(node.props.children, priority, priorities);
      break;
    }
    default: {
      computePriorities(node.props.children, parentPriority, priorities);
      break;
    }
  }
}

// TODO: what if a node has a higher priorty than its parent?
function renderRecursive(
  node: PromptNode,
  priorityLimit: number | null,
): RenderedPrompt | null {
  if (isLiteral(node)) {
    return node ? { type: "string", content: node.toString() } : null;
  }

  if (Array.isArray(node)) {
    const results = node
      .map((child) => renderRecursive(child, priorityLimit))
      .filter((result): result is RenderedPrompt => result !== null);

    return results.length > 0 ? joinPrompts(results) : null;
  }

  if (typeof node.type === "function") {
    throw new Error(
      "Error rendering: function components should have been pre-rendered",
    );
  }

  switch (node.type) {
    case "scope": {
      const priority = node.props.p;

      if (priority === undefined) {
        throw new Error(
          "Error rendering: scope elements should have had their priorities pre-calculated",
        );
      }

      if (priorityLimit !== null && priority > priorityLimit) {
        return null;
      }

      return renderRecursive(node.props.children, priorityLimit);
    }
    case "message": {
      const childrenPrompt = renderRecursive(
        node.props.children,
        priorityLimit,
      );

      let messages: Message[] = [];
      switch (childrenPrompt?.type) {
        case "string": {
          messages = [
            { role: node.props.role, content: promptToString(childrenPrompt) },
          ];
          break;
        }
        case "message": {
          for (const message of childrenPrompt.messages) {
            if (message.role !== node.props.role) {
              throw new Error(
                "Error rendering: nested message components cannot have differing message roles",
              );
            }

            messages.push(message);
          }
          break;
        }
      }

      return {
        messages,
        type: "message",
      };
    }
  }
}

// Renders all function components to `PromptNode`s
export function renderFunctionComponents(node: PromptNode): PromptNode {
  if (isLiteral(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child) => renderFunctionComponents(child));
  }

  if (typeof node.type === "function") {
    const component = node.type(node.props);
    return renderFunctionComponents(component);
  }

  node.props.children = renderFunctionComponents(node.props.children);
  return node;
}

export interface RenderOptions {
  model: string;
  tokenLimit?: number;
}

export function render(
  initialNode: PromptNode,
  options: RenderOptions,
): RenderedPrompt {
  const { model, tokenLimit = getContextSize(model) } = options;

  const node = renderFunctionComponents(initialNode);

  // compute priority levels to binary search on
  const priorities: Set<number> = new Set();
  computePriorities(node, 0, priorities);
  const sortedPriorities = Array.from(priorities).sort((a, b) => a - b);

  // binary search to find max priority level
  let left = 0;
  let right = sortedPriorities.length - 1;
  let maxPriority: number | null = null;
  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    const candidatePriority = sortedPriorities[middle]!;

    const result = renderRecursive(node, candidatePriority);
    const numTokens =
      result !== null ? countTokens(promptToString(result), model) : null;

    if (numTokens === null || numTokens <= tokenLimit) {
      maxPriority = candidatePriority;
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  if (maxPriority === null && priorities.size > 0) {
    throw new Error(
      `Could not render valid prompt with ${tokenLimit} token limit.`,
    );
  }

  // TODO: this is the repeat of a calculation made while binary searching
  const result = renderRecursive(node, maxPriority) ?? {
    type: "string",
    content: "",
  };
  const numTokens = countTokens(promptToString(result), model);

  if (numTokens > tokenLimit) {
    throw new Error(
      `Could not render valid prompt with ${tokenLimit} token limit.`,
    );
  }

  return result;
}
