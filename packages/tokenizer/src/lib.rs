#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use tiktoken_rs::{get_bpe_from_tokenizer, model, tokenizer};

#[napi]
pub fn count_tokens(text: String, model: String) -> i32 {
  let tokenizer = tokenizer::get_tokenizer(&model).unwrap();
  let bpe = get_bpe_from_tokenizer(tokenizer).unwrap();
  let tokens = bpe.encode_with_special_tokens(&text);
  tokens.len().try_into().unwrap()
}

#[napi]
pub fn get_context_size(model: String) -> i32 {
  model::get_context_size(&model).try_into().unwrap()
}
