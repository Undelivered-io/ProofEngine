rustup target add wasm32-unknown-unknown
cargo install wasm-pack --force
wasm-pack build --target no-modules --out-dir pkg