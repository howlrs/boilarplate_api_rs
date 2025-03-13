use axum::{http::StatusCode, response::IntoResponse};
use log::info;
use serde_json::json;

use crate::models::claim::Claims;

use super::utils::response_handler;

/// # public_health
///
/// APIエンドポイントの説明: このエンドポイントはサーバーのヘルスステータスを返します。
/// このエンドポイントは認証が不要です。
///
/// ## Parameters
///
/// なし - このエンドポイントはパラメータを必要としません。
///
/// ## Returns
///
/// 以下の形式のJSONレスポンスを返します：
///
/// ```json
/// {
///   "success": true,
///   "message": "success",
///   "data": {
///     "health": "ok",
///   }
/// }
/// ```
///
/// - `health`: サーバーの状態を表す文字列
/// - `server_time`: サーバーの現在時刻（RFC 3339形式）
///
pub async fn public_health() -> impl IntoResponse {
    response_handler(
        StatusCode::OK,
        "success".to_string(),
        Some(json!({
            "health": "ok",
        })),
        None,
    )
}

/// # private_health
///
/// APIエンドポイントの説明: このエンドポイントはサーバーのヘルスステータスを返します。
/// このエンドポイントは認証が必要です。
///
/// ## Header
/// - Bearar Token: JWTトークンを指定します。
///
/// ## Parameters
///
/// なし - このエンドポイントはパラメータを必要としません。
///
/// ## Returns
///
/// 以下の形式のJSONレスポンスを返します：
///
/// ```json
/// {
///   "success": true,
///   "message": "success",
///   "data": {
///     "health": "ok",
///     "server_time": "2023-12-31T23:59:59.999Z"
///   }
/// }
/// ```
///
/// - `health`: サーバーの状態を表す文字列
/// - `server_time`: サーバーの現在時刻（RFC 3339形式）
///
pub async fn private_health(claims: Claims) -> impl IntoResponse {
    info!("claims on signed: {:?}", claims);

    response_handler(
        StatusCode::OK,
        "success".to_string(),
        Some(json!({
            "health": "ok",
            "server_time": chrono::Utc::now().to_rfc3339(),
        })),
        None,
    )
}
