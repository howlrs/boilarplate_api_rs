use std::sync::Arc;

use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
};

use log::error;
use serde_json::{self, json};

use crate::{
    api::utils::response_handler,
    models::utils::{hash_password, verify_password},
};

/// # signup
///
/// APIエンドポイントの説明: このエンドポイントはユーザー登録を行います。
/// このエンドポイントは認証が不要です。
/// JSONペイロードを取得。
/// パスワードをハッシュ化。
/// ユーザー情報を登録。
/// 再度ログインを行っていただきます。
///
/// /// ## HTTP情報
///
/// - **メソッド**: GET
/// - **パス**: /api/signup
/// - **認証**: 不要
///
/// ## パラメータ
///
/// なし - このエンドポイントはパラメータを必要としません。
///
/// ## クエリパラメータ
///
/// なし
///
/// ## ペイロード
///
/// 以下の形式のJSONペイロードを受け付けます。
/// UserInfoなどの情報から認証登録を行います。
///
/// ## レスポンス
/// ### 成功時
/// 以下の形式のJSONレスポンスを返します：
///
/// ```json
/// {
///   "message": "success",
///   "data": null,
/// }
/// ```
pub async fn signup(
    State(db): State<Arc<crate::common::database::Database>>,
    Json(v): Json<serde_json::Value>,
) -> impl IntoResponse {
    // ペイロードの取得
    let mut user = match serde_json::from_value::<crate::models::user::User>(v) {
        Ok(user) => user,
        Err(e) => {
            error!("serde_json::from_value error: {:?}", e);
            return response_handler(
                StatusCode::BAD_REQUEST,
                "error".to_string(),
                None,
                Some(e.to_string()),
            );
        }
    };

    // パスワードのハッシュ化
    user.password = hash_password(user.password.as_str());
    // Imutableな変数を作成
    let user = user;

    // 同じnameのユーザーがいる場合はエラーを返す
    let key = user.user_id.clone();
    // ユーザー情報をDBに登録
    match db
        .create::<crate::models::user::User>("user", key.as_str(), user)
        .await
    {
        Ok(_) => response_handler(StatusCode::OK, "success".to_string(), None, None),
        Err(e) => {
            error!("crate to database error: {:?}", e);
            response_handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                "error".to_string(),
                None,
                Some(format!("{:?}", e)),
            )
        }
    }
}

/// # signin
///
/// APIエンドポイントの説明: このエンドポイントはユーザー認証を行います。
/// このエンドポイントは認証が不要です。
/// JSONペイロードを取得し、ユーザー情報をデータベースから検索。
/// パスワード検証を行い、
/// JWTトークンを発行して返します。
///
/// /// ## HTTP情報
///
/// - **メソッド**: GET
/// - **パス**: /api/signin
/// - **認証**: 不要
///
/// ## パラメータ
///
/// なし - このエンドポイントはパラメータを必要としません。
///
/// ## クエリパラメータ
///
/// なし
///
/// ## ペイロード
///
/// JSONペイロードを受け付けます。
/// ユーザー情報などを取得し、認証を行います。
///
/// ## レスポンス
///
/// ### 成功時
/// - **ステータスコード**: 200 OK
/// - **形式**: JSON
/// - **内容**:
///   ```json
///   {
///     "message": "success",
///     "data": {
///      "token": "JWTトークン",
///     "token_type": "bearer",
///    }
///   }
///   ```
///
/// ### エラー時
/// 以下の形式のJSONレスポンスを返します：
/// ```json
/// {
///    message: "error",
///   data: null,
///  error: "エラーメッセージ"
/// }
///
/// - `token`: JWTトークン
/// - `token_type`: トークンのタイプを表す文字列 [bearer]
///
pub async fn signin(
    State(db): State<Arc<crate::common::database::Database>>,
    Json(v): Json<serde_json::Value>,
) -> impl IntoResponse {
    // ペイロードの取得
    let user = match serde_json::from_value::<crate::models::user::User>(v) {
        Ok(user) => user,
        Err(e) => {
            return response_handler(
                StatusCode::BAD_REQUEST,
                "error".to_string(),
                None,
                Some(e.to_string()),
            );
        }
    };

    // ログイン用の検証
    // - key: emailでユーザーを検索
    let result = match db
        .read::<crate::models::user::User>("user", &user.user_id)
        .await
    {
        Ok(user) => user,
        Err(e) => {
            error!("not found user, {:?}", e);
            return response_handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                "error".to_string(),
                None,
                Some(format!("not found user, {:?}", e)),
            );
        }
    };

    // - パスワードの検証
    if let Some(db_user) = result.clone() {
        if !verify_password(&db_user.password, &user.password) {
            return response_handler(
                StatusCode::UNAUTHORIZED,
                "error".to_string(),
                None,
                Some("wrong password".to_string()),
            );
        }
    } else {
        error!("not found user");
        return response_handler(
            StatusCode::UNAUTHORIZED,
            "error".to_string(),
            None,
            Some("not found user".to_string()),
        );
    }

    // クレーム発行
    let claims = crate::models::claim::Claims::new(user.user_id, user.email);

    // クレームからトークンを生成
    let to_token = match claims.to_token() {
        Ok(token) => token,
        Err(e) => {
            error!("token creation error: {:?}", e);
            return response_handler(
                StatusCode::INTERNAL_SERVER_ERROR,
                "error".to_string(),
                None,
                Some(format!("{:?}", e)),
            );
        }
    };

    response_handler(
        StatusCode::OK,
        "success".to_string(),
        Some(json!({
            "token": to_token,
            "token_type": "bearer",
        })),
        None,
    )
}
