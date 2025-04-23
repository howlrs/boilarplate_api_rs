# ビルドステージ
FROM rust:1.85.0-slim

# 作業ディレクトリを作成
WORKDIR /app
COPY . .

# 追加: pkg-config と OpenSSL 開発パッケージをインストール
RUN apt-get update \
    && apt-get install -y pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN cargo build --release

CMD [ "./target/release/backend" ]