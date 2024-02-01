import * as Promptre from "./index";
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
  expect(
    Promptre.render(scopeTest, { ...renderOptions, tokenLimit: Infinity }),
  ).toBe("Scope 1 Text Scope 2 Scope 3");
});

test("rendering scopes respects token limit", () => {
  for (let tokenLimit = 0; tokenLimit <= 10; ++tokenLimit) {
    const prompt = Promptre.render(scopeTest, { ...renderOptions, tokenLimit });
    const tokens = countTokens(prompt, model);
    expect(tokens).lte(tokenLimit);
  }
});

test("throws on token limit smaller than prompt minimum size", () => {
  expect(() => {
    Promptre.render("test", { ...renderOptions, tokenLimit: 0 });
  }).toThrowError("token limit");
});

test("fragment renders all children", () => {
  const fragmentTest = (
    <>
      {scopeTest}
      {scopeTest}
    </>
  );

  expect(
    Promptre.render(fragmentTest, { ...renderOptions, tokenLimit: Infinity }),
  ).toBe("Scope 1 Text Scope 2 Scope 3 Scope 1 Text Scope 2 Scope 3");
});
