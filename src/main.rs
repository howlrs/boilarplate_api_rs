use std::sync::Arc;

use axum::{
    Router,
    http::Method,
    routing::{get, post},
};
use log::info;
use tower_http::cors::CorsLayer;

mod api;
mod common;
mod models;

#[tokio::main]
async fn main() {
    match dotenv::from_filename(".env.local") {
        Ok(_) => info!("Found .env.local"),
        Err(_) => info!("Not found .env.local"),
    };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let origin = vec![
        std::env::var("FRONTEND_URL")
            .unwrap_or("https://storage.googleapis.com".to_string())
            .parse()
            .unwrap(),
    ];

    // データベースの初期化
    // Arc は複数のスレッドで共有するためのスマートポインタ
    let db = Arc::new(common::database::Database::new().await);

    let endpoint = Router::new()
        // サーバー時間を返すエンドポイント
        .route("/api/public/health", get(api::initial::public_health))
        // ユーザー登録
        // パスワードハッシュ化
        // データベース登録
        .route("/api/public/signup", post(api::user::signup))
        // ユーザーログイン
        // ユーザー検索
        // パスワード検証
        // JWT 生成
        .route("/api/public/signin", post(api::user::signin))
        // 認証後のエンドポイント例
        // JWT -> Claims検証
        .route("/api/private/health", get(api::initial::private_health))
        .layer(
            CorsLayer::new()
                .allow_methods([
                    Method::GET,
                    Method::POST,
                    Method::PUT,
                    Method::DELETE,
                    Method::OPTIONS,
                ])
                .allow_origin(origin)
                // JSON でのリクエストを許可
                .allow_headers(["Content-Type".parse().unwrap()]),
        )
        .with_state(db);

    // Access-Control-Allow-Origin: *

    let port = std::env::var("PORT").unwrap_or("8080".to_string());
    let lister = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .unwrap();
    axum::serve::serve(lister, endpoint).await.unwrap();
}
