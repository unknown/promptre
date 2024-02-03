import * as Promptre from "./index";
import { Tokenizer } from "@promptre/tokenizer";
import { expect, test } from "vitest";
import { promptToString } from "./prompt";

const tokenizer = new Tokenizer("gpt-4");

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
  expect(
    Promptre.render(<ScopeTest />, { tokenizer, tokenLimit: Infinity }),
  ).toMatchObject({
    type: "string",
    content: "Scope 1 Text Scope 2 Scope 3",
  });
});

test("fragment renders all of its children", () => {
  const FragmentTest = () => (
    <>
      <ScopeTest /> <ScopeTest />
    </>
  );

  expect(
    Promptre.render(<FragmentTest />, { tokenizer, tokenLimit: Infinity }),
  ).toMatchObject({
    type: "string",
    content: "Scope 1 Text Scope 2 Scope 3 Scope 1 Text Scope 2 Scope 3",
  });
});

test("rendering scopes respects token limit", () => {
  for (let tokenLimit = 0; tokenLimit <= 10; ++tokenLimit) {
    const prompt = Promptre.render(<ScopeTest />, { tokenizer, tokenLimit });
    const tokens = tokenizer.countTokens(promptToString(prompt));
    expect(tokens).lte(tokenLimit);
  }
});

test("throws on token limit smaller than prompt minimum size", () => {
  expect(() => {
    Promptre.render("test", { tokenizer, tokenLimit: 0 });
  }).toThrowError("token limit");
});

test("prompts with message tags render to message prompts", () => {
  const options = {
    tokenizer,
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
        tokenizer,
        tokenLimit: Infinity,
      },
    );
  }).toThrowError("nested message components");
});

test("falsy values are rendered properly", () => {
  const options = {
    tokenizer,
    tokenLimit: Infinity,
  };

  expect(promptToString(Promptre.render(<>{null}</>, options))).toBe("");
  expect(promptToString(Promptre.render(<>{undefined}</>, options))).toBe("");
  expect(promptToString(Promptre.render(<>{false}</>, options))).toBe("");
  expect(promptToString(Promptre.render(<>{NaN}</>, options))).toBe("NaN");
  expect(promptToString(Promptre.render(<>{0}</>, options))).toBe("0");
  expect(promptToString(Promptre.render(<>{-0}</>, options))).toBe("0");
  expect(promptToString(Promptre.render(<>{""}</>, options))).toBe("");
});
