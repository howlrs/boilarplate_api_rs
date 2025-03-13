use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use firestore::{FirestoreQueryDirection, path};
use log::info;
use serde::Deserialize;
use serde_json::json;

use tokio_stream::StreamExt;

use crate::{api::utils::response_handler, models::data::Row};

#[derive(Deserialize)]
pub struct PathParams {
    category_slug: String,
}

#[derive(Deserialize)]
pub struct QueryParams {
    limit: Option<u32>,
}

/// # get
///
/// データベースの値を取得するエンドポイント
/// カテゴリーのスラッグに応じて、対応するデータを取得する
/// limitがあれば、指定数だけランダムに取得する
///
/// ## HTTP情報
///
/// - **メソッド**: GET
/// - **パス**: /api/data/{category_slug}/rows
/// - **認証**: 不要
///
/// ## パラメータ
///
/// - `category_slug`: カテゴリーのスラッグ (String) - 取得するカテゴリーを指定する
///
/// ## クエリパラメータ
///
/// - `limit`: 取得する問題数 (u32) - 取得する問題数を指定する
///
/// ## ペイロード
///
/// なし
///
/// ## レスポンス
///
/// ### 成功時
/// - **ステータスコード**: 200 OK
/// - **形式**: JSON
/// - **内容**:
///   ```json
///   {
///     "status": "success",
///     "message": "success",
///     "data": [Row{}...]
///   }
///   ```
///
/// ### エラー時
/// - **ステータスコード**: 404 Not Found
/// - **内容**: リソースが存在しない場合のエラーメッセージ
///
/// ## 例
///
/// GET /api/levels/1/categories/1/questions
///
/// ## 関連エンドポイント
/// - なし
pub async fn get(
    Path(path_params): Path<PathParams>,
    Query(query_params): Query<QueryParams>,
    State(db): State<Arc<crate::common::database::Database>>,
) -> impl IntoResponse {
    // カテゴリスラッグに応じて、値を取得する
    info!(
        "category_slug: {}, limit: {}",
        path_params.category_slug,
        query_params.limit.unwrap_or_default()
    );

    // データベースから値を取得
    let mut rows = read_db(&path_params, db.clone()).await;
    if rows.is_empty() {
        return response_handler(
            StatusCode::NOT_FOUND,
            "Not Found".to_string(),
            None,
            Some(
                format!(
                    "database has not rows, category_slug: {}",
                    path_params.category_slug,
                )
                .to_string(),
            ),
        );
    }

    info!(
        "category_slug: {} -> db has length: {}",
        path_params.category_slug,
        rows.len()
    );

    // limitがあれば、指定数だけランダムに取得
    let rows = match query_params.limit {
        Some(limit) => {
            if rows.len() < limit as usize {
                rows
            } else {
                use rand::seq::SliceRandom;
                let mut rng = rand::rng();
                rows.shuffle(&mut rng);
                rows.into_iter().take(limit as usize).collect()
            }
        }
        None => rows,
    };

    info!("limit: {}", rows.len());

    response_handler(StatusCode::OK, "ok".to_string(), Some(json!(rows)), None)
}

// データベースから値を取得
// Tを指定して、取得する値の型を指定する
async fn read_db(path_params: &PathParams, db: Arc<crate::common::database::Database>) -> Vec<Row> {
    match db
        .client
        .fluent()
        .select()
        // コレクションの指定
        .from("questions")
        .filter(|x| {
            x.for_all([x
                .field(path!(Row::category_slug))
                .eq(path_params.category_slug.clone())])
        })
        // 取得数リミット
        .limit(200)
        // 降順
        .order_by([(path!(Row::id), FirestoreQueryDirection::Descending)])
        // 型の指定
        .obj::<Row>()
        .stream_query_with_errors()
        .await
    {
        Ok(mut data) => {
            let mut result = Vec::new();
            while let Some(item) = data.next().await {
                match item {
                    Ok(item) => result.push(item),
                    Err(e) => eprintln!("Error: {:?}", e),
                }
            }
            result
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
            vec![]
        }
    }
}
