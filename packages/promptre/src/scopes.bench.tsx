import * as Promptre from "./index";
import { bench } from "vitest";

const tokenizer = new Promptre.Tokenizer("gpt-4");

const options = { time: 1000 };

interface ScopeTestProps {
  count: number;
}

function ScopeTest({ count }: ScopeTestProps) {
  return (
    <>
      {Array.from(Array(count).keys()).map((i) => (
        <scope p={i}>Test {i}</scope>
      ))}
    </>
  );
}

bench(
  "100 scopes",
  () => {
    Promptre.render(<ScopeTest count={100} />, { tokenizer });
  },
  options,
);

bench(
  "1000 scopes",
  () => {
    Promptre.render(<ScopeTest count={1000} />, { tokenizer });
  },
  options,
);

bench(
  "10000 scopes",
  () => {
    Promptre.render(<ScopeTest count={10000} />, { tokenizer });
  },
  options,
);
