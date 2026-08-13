# SoroPlay compiler service image.
# Rust toolchain (for wasm32 builds) + Node.js (build server) + binaryen (wasm-opt).
# soroban-sdk 27 requires Rust >= 1.91.
FROM rust:1.91-slim-bookworm

# System deps: build essentials for native crates, binaryen for wasm-opt,
# and Node.js 20 to run the server.
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates pkg-config libssl-dev binaryen \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# WASM target for Soroban contracts. Modern Soroban (Rust 1.84+) requires
# wasm32v1-none; the old wasm32-unknown-unknown enables reference-types /
# multi-value features the Soroban environment rejects.
RUN rustup target add wasm32v1-none

WORKDIR /app

# Install server deps first for better layer caching.
COPY package.json ./
RUN npm install --omit=dev

# Pre-warm the Cargo cache: build the placeholder contract once so soroban-sdk
# and its dependencies are compiled into the image. Runtime builds then only
# recompile the user's lib.rs and can run fully offline.
COPY template ./template
RUN cd template && cargo build --target wasm32v1-none --release

COPY server.mjs ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
