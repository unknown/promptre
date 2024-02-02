import test from "ava";

import { Tokenizer } from "../index.js";

const tokenizer = new Tokenizer("gpt-4");

test("tokens count is non-zero", (t) => {
  t.truthy(tokenizer.countTokens("test"));
});

test("gpt-4 context size is 8192", (t) => {
  t.is(tokenizer.getContextSize(), 8192);
});
