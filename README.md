# AIに依頼する構文をテンプレート化する





## Features
- AIによるチェックプロンプトの実装

## Endpoints
- クライアントに対してのメールリファクタリング
- 文章内整合性チェック
- テンプレート化（テンプレート文書への現情報の代入）
- 

## Envs
<!-- Output level of the logger [trace, debug, info, warn, error] -->
RUST_LOG=debug
<!-- Port to listen on -->
PORT=8080
<!-- Requested by the frontend
/ is not needed at the end -->
FRONTEND_URL=http://localhost:3000
<!-- Generate JWT Token by this secret -->
JWT_SECRET=secret
