<!-- I want to review in Japanese. -->

## レビューに関して

必ず日本語でレビューすること。
レビューコメントには、以下のプレフィックスをつけること。

## コーディングルール

下記の命名規則に従っているかをチェックすること。
|対象|命名規則|例|
|:---|:---|:---|
| ディレクトリ | `小文字` | `composables`, `utils` |
| コンポーネント (.vue) | `PascalCase` | `AppHeader.vue`, `UiButton.vue` |
| ページ (.vue) | `kebab-case` | `user-profile.vue`, `contact-us.vue` |
| レイアウト (.vue) | `kebab-case` | `custom-layout.vue` |
| Composable (.ts) | `use + CamelCase` | `useAuth.ts`, `useCounter.ts` |
| サーバー API (.ts) | `kebab-case` | `send-email.post.ts` |
| 型定義 (.ts) | `PascalCase` | `Product.ts` |
| 関数・変数 | `camelCase` | `fetchUserData`, `userName` |
| 定数 | `UPPER_SNAKE_CASE` | `API_KEY`, `TIMEOUT_MS` |

<!-- for Github Copilot review rule -->

[必須]: セキュリティ、バグ、重大な設計問題
[推奨]: パフォーマンス改善、可読性向上
[提案]: より良い実装方法の提案
[質問]: 実装意図の確認
[Nits]: 細かな修正（typo、フォーマットなど）

<!-- for Github Copilot review rule -->

<!-- I want to review in Japanese. -->
