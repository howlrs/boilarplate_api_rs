use std::{fmt::Display, sync::LazyLock};

use axum::{
    Json, RequestPartsExt,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
    response::{IntoResponse, Response},
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};

use serde::{Deserialize, Serialize};
use serde_json::json;

// Axum examples/jwt 実装を踏襲
// https://github.com/tokio-rs/axum/blob/main/examples/jwt/src/main.rs

/// JWT Secret Key
/// 指定された文字列からJWTのエンコード・デコードキーを生成
static KEYS: LazyLock<Keys> = LazyLock::new(|| {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(secret.as_bytes())
});

pub struct Keys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl Keys {
    pub fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

/// 認証時に発生するエラーを定義
pub enum AuthError {
    InvalidToken,
    MissingToken,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid token"),
            AuthError::MissingToken => (StatusCode::BAD_REQUEST, "Missing token"),
        };

        let body = Json(json!({
            "code": status.as_u16(),
            "error": message.to_string(),
        }));

        (status, body).into_response()
    }
}

// Claim Struct
// 認証時に発行するトークンが保持する情報
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub user_id: String,
    pub email: String,
    pub exp: i64,
}

impl Claims {
    pub fn new(user_id: String, email: String) -> Self {
        let after72h = chrono::Utc::now().timestamp() + 60 * 60 * 72 * 10;
        Self {
            user_id,
            email,
            exp: after72h,
        }
    }

    #[allow(unused)]
    pub fn is_ok(&self) -> bool {
        let now = chrono::Utc::now().timestamp();
        self.exp > now
    }

    pub fn to_token(&self) -> Result<String, String> {
        encode(&Header::default(), self, &KEYS.encoding).map_err(|e| e.to_string())
    }
}

// Claim Display
impl Display for Claims {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let now = chrono::Utc::now();
        let one_week = chrono::Duration::weeks(1);
        let after_oneweek = now + one_week;

        write!(
            f,
            "Claims: user_id: {}, email: {}, exp: {}",
            self.user_id,
            self.email,
            after_oneweek.format("%Y-%m-%d %H:%M")
        )
    }
}

// Axum Extract
// リクエストからトークンを取り出し、Claimsを返す処理を定義
// AxumのレスポンスハンドラでClaimsを取得するために必要な実装
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AuthError;
    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract the token from the authorization header
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| AuthError::InvalidToken)?;
        // Decode the user data
        let token_data = decode::<Claims>(bearer.token(), &KEYS.decoding, &Validation::default())
            .map_err(|_| AuthError::InvalidToken)?;

        Ok(token_data.claims)
    }
}
