import test from "ava";

import { countTokens, getContextSize } from "../index.js";

test("tokens count is non-zero", (t) => {
  t.truthy(countTokens("test", "gpt-4"));
});

test("gpt-4 context size is 8192", (t) => {
  t.is(getContextSize("gpt-4"), 8192);
});
