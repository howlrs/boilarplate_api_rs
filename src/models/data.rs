use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Row {
    pub id: u32,
    // 関連する情報
    pub category_slug: String,

    pub name: String,
    pub title: String,
}
