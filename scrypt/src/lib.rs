use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn scrypt(
    password_hex: &str,
    salt_hex: &str,
    n: u32,
    r: u32,
    p: u32,
    dklen: usize,
) -> String {
    // Pre-allocate vectors with exact capacity
    let password_bytes = hex_decode_fast(password_hex);
    let salt_bytes = hex_decode_fast(salt_hex);
    
    // Use log2 of N for params
    let log_n = (n as f64).log2() as u8;
    
    // Pre-allocate output
    let mut output = vec![0u8; dklen];
    
    // Use the scrypt function directly with less error handling overhead
    let params = scrypt::Params::new(log_n, r, p, dklen).unwrap();
    scrypt::scrypt(&password_bytes, &salt_bytes, &params, &mut output).unwrap();
    
    // Fast hex encoding
    hex_encode_fast(&output)
}

#[inline(always)]
fn hex_decode_fast(hex: &str) -> Vec<u8> {
    let len = hex.len() / 2;
    let mut bytes = Vec::with_capacity(len);
    
    for i in 0..len {
        let byte = u8::from_str_radix(&hex[i*2..i*2+2], 16).unwrap_or(0);
        bytes.push(byte);
    }
    
    bytes
}

#[inline(always)]
fn hex_encode_fast(bytes: &[u8]) -> String {
    const HEX_CHARS: &[u8; 16] = b"0123456789abcdef";
    let mut hex = String::with_capacity(bytes.len() * 2);
    
    for &byte in bytes {
        hex.push(HEX_CHARS[(byte >> 4) as usize] as char);
        hex.push(HEX_CHARS[(byte & 0xf) as usize] as char);
    }
    
    hex
}