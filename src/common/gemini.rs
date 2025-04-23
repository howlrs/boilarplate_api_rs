use log::{error, info};
use serde_json::{Value, json};

// request to Gemini API
// parse response
pub async fn request(request_content: &str) -> Result<Value, String> {
    let mut model = std::env::var("GEMINI_MODEL").unwrap_or_default();

    if model.is_empty() {
        let models = std::env::var("GEMINI_MODELS").unwrap_or_default();
        model = models.split(',').collect::<Vec<&str>>()[0].to_string();
    }

    let mut token = std::env::var("GEMINI_API_TOKEN").unwrap_or_default();
    if token.is_empty() {
        token = std::env::var("GOOGLE_GEMINI_API_KEY").unwrap_or_default();
    }

    if model.is_empty() || token.is_empty() {
        return Err("GEMINI_MODEL or GEMINI_API_TOKEN is empty".to_string());
    }

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model.clone(),
        token.clone()
    );

    match inner_request(&url, &request_content).await {
        Ok(s) => {
            info!("{:?}", s.clone());
            // let serded_value: Todo = match serde_json::from_str(s.clone().as_str()) {
            //     Ok(v) => v,
            //     Err(e) => {
            //         error!("parsed error: {:?}, {:?}", e, s);
            //         return Err(e.to_string());
            //     }
            // };
            // info!("serded: {:?}", serded_value);

            Ok(json!({
                "model": model,
                "result": s.clone(),
            }))
        }
        Err(e) => {
            error!("error: {:?}", e);
            Err(e.to_string())
        }
    }
}

async fn inner_request(url: &str, str: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());

    let body = json!({
        "contents": [
            {
                "parts": [
                    {
                        "text": str
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 8192,
            "topK": 1,
            "topP": 0.1,
        }
    });

    let res = match client.post(url).headers(headers).json(&body).send().await {
        Ok(v) => v,
        Err(e) => return Err(e.to_string()),
    };

    // 1. JSON文字列を `serde_json::Value` にパース
    match res.json::<Value>().await {
        Ok(value) => {
            // 2. `candidates` 配列を取得 (Option<&Value> として)
            //    `value["candidates"]` は存在しないキーだと panic する可能性があるため、
            //    `get()` を使うのが安全。
            let candidates_value = value.get("candidates");

            // 3. `candidates` が配列であることを確認し、最初の要素を取得
            //    `and_then` を使うとネストを避けられる
            let first_candidate_value = candidates_value
                .and_then(|candidates| candidates.as_array()) // candidates が配列なら Some(&Vec<Value>)
                .and_then(|arr| arr.first()); // 配列が空でなければ Some(&Value)

            // 4. 最初の候補 (candidate) がオブジェクトであることを確認し、`content` を取得
            let content_value = first_candidate_value
                .and_then(|candidate| candidate.as_object()) // candidate がオブジェクトなら Some(&Map<String, Value>)
                .and_then(|obj| obj.get("content")); // オブジェクトに "content" キーがあれば Some(&Value)

            // 5. `content` の値が見つかったかどうかで分岐
            match content_value {
                Some(content) => {
                    // --- さらに content の中の text を取得する例 ---
                    // content["parts"][0]["text"] のようなアクセスを安全に行う

                    let text = content
                        .get("parts") // Some(&Value) (parts 配列) or None
                        .and_then(|parts| parts.as_array()) // Some(&Vec<Value>) or None
                        .and_then(|arr| arr.first()) // Some(&Value) (最初の part オブジェクト) or None
                        .and_then(|part| part.as_object()) // Some(&Map<String, Value>) or None
                        .and_then(|obj| obj.get("text")) // Some(&Value) (text 文字列) or None
                        .and_then(|text_val| text_val.as_str()); // Some(&str) or None

                    match text {
                        Some(_) => (),
                        None => println!(
                            "`content.parts[0].text` が見つからないか、文字列ではありませんでした。"
                        ),
                    }

                    // 全ての part の text を連結する場合
                    let all_texts =
                        content
                            .get("parts")
                            .and_then(|parts| parts.as_array())
                            .map(|arr| {
                                // Option::map を使う
                                arr.iter()
                                    .filter_map(|part| part.get("text")) // 各 part から "text" を取得 (Option<&Value>)
                                    .filter_map(|text_val| text_val.as_str()) // 文字列なら &str に変換
                                    .collect::<Vec<&str>>() // &str の Vec を作成
                            }); // 結果は Option<Vec<&str>>

                    if let Some(texts) = all_texts {
                        Ok(texts.join(""))
                    } else {
                        println!("`content.parts` が配列でないか、見つかりませんでした。");
                        Err("`content.parts` が配列でないか、見つかりませんでした。".to_string())
                    }

                    // 必要であれば content オブジェクトを所有権付きでコピー
                    // let owned_content: Value = content.clone();
                }
                None => {
                    let msg = format!(
                        "`candidates` 配列の最初の要素、またはその中の `content` フィールドが見つかりませんでした。  {}",
                        value
                    );
                    Err(msg)
                }
            }
        }
        Err(e) => {
            eprintln!("JSONのパースに失敗しました: {}", e);
            Err(e.to_string())
        }
    }
}
