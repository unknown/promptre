#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use tiktoken_rs::p50k_base;

#[napi]
pub fn encode(text: String) -> i32 {
  let bpe = p50k_base().unwrap();
  let tokens = bpe.encode_with_special_tokens(&text);
  tokens.len().try_into().unwrap()
}
