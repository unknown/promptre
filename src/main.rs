use tiktoken_rs::p50k_base;

fn main() {
    let bpe = p50k_base().unwrap();
    let tokens = bpe.encode_with_special_tokens("This is a sentence   with spaces");
    println!("Token count: {}", tokens.len());
}
