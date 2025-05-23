use axum::{Json, http::StatusCode, response::IntoResponse};
use log::error;
use serde_json::{Value, json};

// レスポンスを返す関数
// レスポンスの形式を統一するために使用
pub fn response_handler(
    code: StatusCode,
    message: String,
    data: Option<Value>,
    err: Option<String>,
) -> impl IntoResponse {
    let mut body = json!({
        "message": message,
    });

    if let Some(error_msg) = err {
        error!("Error: {}", error_msg);
        body["error"] = json!(error_msg);
    } else {
        body["data"] = json!(data);
    }

    (code, Json(body))
}

#[allow(unused)]
// 漢字の文字数でソートする関数
pub fn kanji_len(s: &str) -> usize {
    s.chars()
        .filter(|c| unicode_script::Script::from(*c) == unicode_script::Script::Han)
        .count()
}
