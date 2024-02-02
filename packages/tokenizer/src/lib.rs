#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use tiktoken_rs::{get_bpe_from_tokenizer, model, tokenizer, CoreBPE};

#[napi]
pub struct Tokenizer {
  bpe: CoreBPE,
  context_size: i32,
}

#[napi]
impl Tokenizer {
  #[napi(constructor)]
  pub fn new(model: String) -> Self {
    let tokenizer = tokenizer::get_tokenizer(&model).unwrap();
    Self {
      bpe: get_bpe_from_tokenizer(tokenizer).unwrap(),
      context_size: model::get_context_size(&model) as i32,
    }
  }

  #[napi]
  pub fn count_tokens(&self, text: String) -> i32 {
    let tokens = self.bpe.encode_with_special_tokens(&text);
    tokens.len() as i32
  }

  #[napi]
  pub fn get_context_size(&self) -> i32 {
    self.context_size
  }
}
