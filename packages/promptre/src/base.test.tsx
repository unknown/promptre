import * as Promptre from ".";
import { countTokens } from "@promptre/tokenizer";

import { expect, test } from "vitest";

const scopeTest = (
  <scope p={1000}>
    <scope prel={2}>Scope 1</scope>
    <scope prel={10}>
      Text
      <scope prel={1}>Scope 2</scope>
      <scope prel={2}>Scope 3</scope>
    </scope>
  </scope>
);

const model = "gpt-4";

const renderOptions: Promptre.RenderOptions = { model };

test("scope renders all of its children", () => {
  expect(Promptre.render(scopeTest, renderOptions)).toBe(
    "Scope 1 Text Scope 2 Scope 3",
  );
});

test("rendering scopes respects token limit", () => {
  for (let tokenLimit = 0; tokenLimit <= 10; ++tokenLimit) {
    const prompt = Promptre.render(scopeTest, { ...renderOptions, tokenLimit });
    const tokens = countTokens(prompt, model);
    expect(tokens).lte(tokenLimit);
  }
});
