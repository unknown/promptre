import * as Promptre from "./index";
import { countTokens } from "@promptre/tokenizer";
import { expect, test } from "vitest";
import { promptToString } from "./prompt";

const model = "gpt-4";

function ScopeTest() {
  return (
    <scope p={1000}>
      <scope prel={2}>Scope 1 </scope>
      <scope prel={10}>
        Text <scope prel={1}>Scope 2 </scope>
        <scope prel={2}>Scope 3</scope>
      </scope>
    </scope>
  );
}

test("scope renders all of its children", () => {
  expect(Promptre.render(<ScopeTest />, { model, tokenLimit: Infinity })).toBe(
    "Scope 1 Text Scope 2 Scope 3",
  );
});

test("fragment renders all of its children", () => {
  const FragmentTest = () => (
    <>
      <ScopeTest /> <ScopeTest />
    </>
  );

  expect(
    Promptre.render(<FragmentTest />, { model, tokenLimit: Infinity }),
  ).toBe("Scope 1 Text Scope 2 Scope 3 Scope 1 Text Scope 2 Scope 3");
});

test("rendering scopes respects token limit", () => {
  for (let tokenLimit = 0; tokenLimit <= 10; ++tokenLimit) {
    const prompt = Promptre.render(<ScopeTest />, { model, tokenLimit });
    const tokens = countTokens(promptToString(prompt), model);
    expect(tokens).lte(tokenLimit);
  }
});

test("throws on token limit smaller than prompt minimum size", () => {
  expect(() => {
    Promptre.render("test", { model, tokenLimit: 0 });
  }).toThrowError("token limit");
});

test("prompts with message tags render to message prompts", () => {
  const options = {
    model,
    tokenLimit: Infinity,
  };

  const assistantPrompt = Promptre.render(
    <Promptre.AssistantMessage>
      <ScopeTest />
    </Promptre.AssistantMessage>,
    options,
  );

  expect(assistantPrompt).toMatchObject({
    type: "message",
    messages: [{ role: "assistant", content: "Scope 1 Text Scope 2 Scope 3" }],
  });

  const systemPrompt = Promptre.render(
    <Promptre.SystemMessage>
      <ScopeTest />
    </Promptre.SystemMessage>,
    options,
  );

  expect(systemPrompt).toMatchObject({
    type: "message",
    messages: [{ role: "system", content: "Scope 1 Text Scope 2 Scope 3" }],
  });

  const userPrompt = Promptre.render(
    <Promptre.UserMessage>
      <ScopeTest />
    </Promptre.UserMessage>,
    options,
  );

  expect(userPrompt).toMatchObject({
    type: "message",
    messages: [{ role: "user", content: "Scope 1 Text Scope 2 Scope 3" }],
  });
});

test("throw on rendering prompts with different nested messages", () => {
  expect(() => {
    Promptre.render(
      <Promptre.AssistantMessage>
        <Promptre.SystemMessage>
          <ScopeTest />
        </Promptre.SystemMessage>
      </Promptre.AssistantMessage>,
      {
        model,
        tokenLimit: Infinity,
      },
    );
  }).toThrowError("nested message components");
});
