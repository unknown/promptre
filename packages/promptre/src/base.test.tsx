import * as Promptre from ".";

import { expect, test } from "vitest";

test("scope renders all of its children", () => {
  const scopeTest = (
    <scope>
      <scope>Scope 1</scope>
      <scope>
        Text
        <scope>Scope 2</scope>
        <scope>Scope 3</scope>
      </scope>
    </scope>
  );
  expect(Promptre.render(scopeTest)).toBe("Scope 1 Text Scope 2 Scope 3");
});
