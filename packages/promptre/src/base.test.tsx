import * as Promptre from ".";
import { encode } from "@promptre/tokenizer";

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

test("scope renders all of its children", () => {
  expect(Promptre.render(scopeTest)).toBe("Scope 1 Text Scope 2 Scope 3");
});

test("rendering scopes respects token limit", () => {
  for (let tokenLimit = 0; tokenLimit <= 10; ++tokenLimit) {
    const prompt = Promptre.render(scopeTest, { tokenLimit });
    const tokens = encode(prompt);
    expect(tokens).lte(tokenLimit);
  }
});
