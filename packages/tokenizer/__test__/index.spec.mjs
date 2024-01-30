import test from "ava";

import { encode } from "../index.js";

test("tokens count is non-zero", (t) => {
  t.truthy(encode("test"));
});
