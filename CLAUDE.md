# しふとん🌱 — シフト登録カレンダーPWA

## 概要
Googleカレンダーにシフト（早番・遅番など）を一括登録できるPWA。
スマホのホーム画面に追加して使う想定。オリジナルマスコット「みどりん」がテーマキャラクター。

## デプロイ
- **リポジトリ**: https://github.com/GoshuE/shift-calendar
- **公開URL**: GitHub Pages（mainブランチへのpushで自動デプロイ）
- **CI**: `.github/workflows/deploy.yml` — GitHub Actions で pages にデプロイ

## 技術構成
- **単一ファイル構成**: `index.html` にHTML・CSS・JSをすべて内包
- **Google Calendar API v3**: events.insert / events.list / events.delete
- **Google Identity Services (GIS)**: OAuth 2.0 トークンベース認証
- **PWA**: manifest.json でスタンドアロン表示対応
- **データ永続化**: localStorage（シフト設定・週テンプレート）

## OAuth設定
- **Client ID**: `1051838677110-piv0se3763lgiock79vj641vcprkni43.apps.googleusercontent.com`（クライアントサイド公開前提の識別子）
- **スコープ**: `https://www.googleapis.com/auth/calendar.events`
- **テストユーザー**: Google Cloud Console の OAuth 同意画面で追加・管理する（個人メールアドレスのため、このファイルには記載しない）

## デザイン方針
- **配色**: 緑(#6aab6d, #5aaa5e)＋クリーム(#fefcef) — みどりんの画像に合わせた配色
- **ヘッダー**: 背景色 `#6aab6d`（midorintop.webp の背景色と統一）
- **フォント**: ヘッダーは `Hachi Maru Pop`（Google Fonts、手書き風かわいい書体）
- **マスコット「みどりん」**: ChatGPTで作成した著作権フリーのオリジナルキャラクター
- **Googleカレンダーカラー**: colorId(1〜11)の定義済みカラーを使用

## ファイル構成

### メインファイル
- `index.html` — アプリ本体（HTML+CSS+JS一体）
- `manifest.json` — PWA設定（名前: しふとん🌱）
- `sw.js` — Service Worker（PWA/WebAPK 対応）
- `font-compare.html` — フォント比較用ページ（開発時に使用、不要なら削除可）

### みどりん画像（すべて WebP 化済み）
| ファイル | 用途 |
|---------|------|
| `midorintop.webp` | ヘッダーアイコン |
| `midorin2.webp` | ファビコン |
| `1月.webp` 〜 `12月.webp` | トップのマスコット画像（月ごとに自動切替） |
| `midorin-umbrella.webp` | 中段デコレーション（mascot-between） |
| `midorin-tree.webp` | 中段デコレーション |
| `midorin-basket.webp` | 中段デコレーション |
| `midorin-clover.webp` | フッター両端 / セクションラベルアイコン |
| `midorin-dango2.webp` | セクションラベルアイコン（シフトを選択） |
| `yoko1.webp` 〜 `yoko5.webp` | フッター中央5つの画像 |

### PWA アイコン（PNG のまま）
- `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`

※旧 .jpg/.png 画像・SVG マスコット案は WebP 化の際に削除済み（git 履歴にのみ存在）

## 実装済み機能

### コア機能
1. **シフト登録** — 日付（単日/範囲選択）×シフト種別 → Googleカレンダーに一括登録
2. **終日イベント対応** — シフト設定で「終日」チェック可能（API: `date` vs `dateTime`）
3. **登録済みシフト表示** — カレンダー上にカラードットで表示（アプリ登録シフトのみ）
4. **シフト削除** — 日付タップ → ポップアップからイベント削除
5. **月間集計** — 勤務時間・シフト回数の集計（アプリ登録シフトのみカウント）
6. **週パターン一括登録** — 曜日ごとにシフトを設定し月全体に一括登録（折りたたみ式UI）
7. **シフト設定** — ⚙ボタンからシフトの名前・時間・色を自由にカスタマイズ

### UI/演出
8. **季節みどりん** — カレンダーの月切替で `{月}.webp` のイラストに自動変更
9. **ウェーブアニメーション** — シフト登録成功時、中段のみどりんたちが順番に跳ねる（2周）
10. **ログイン状態表示** — 未ログイン: オレンジボタン / ログイン中: 白緑ボタン

### デフォルトシフト
```javascript
{ id: 'hayaban', name: '早番', start: '07:30', end: '17:00', color: '#f28b1e', allDay: false }
{ id: 'osoban', name: '遅番', start: '12:30', end: '22:00', color: '#8e24aa', allDay: false }
```

## index.html 主要コード構造（参考）

### CSS（`<style>`内）
- `.header` — ヘッダー（#6aab6d、Hachi Maru Pop 36px）
- `.mascot-welcome` — トップ季節みどりん（120x120px）
- `.calendar-grid` — カレンダーのグリッド
- `.shift-btn` — シフト選択ボタン
- `.template-section` — 週パターン一括登録（折りたたみ）
- `.monthly-summary` — 月間集計
- `.mascot-between` — 中段デコレーション画像列
- `.mascot-footer` — フッター画像列

### JavaScript 主要関数
- `renderCalendar()` — カレンダー描画 + 月別みどりん画像切替
- `fetchCalendarEvents()` — Google Calendar APIから当月イベント取得
- `isShiftEvent(ev)` — アプリ登録シフトかどうか判定（shiftsの名前と一致チェック）
- `showEventPopup(dateStr)` — 日付タップ時のシフト一覧ポップアップ
- `deleteCalendarEvent(eventId)` — イベント削除
- `updateMonthlySummary()` — 月間集計更新
- `renderTemplateGrid()` — 週パターンUI描画
- `updateAuthUI()` — ログイン状態のUI更新

## ローカル開発
```bash
npx serve -l 3000 .
```
`.claude/launch.json` で設定済み。

## 今後の拡充候補
- 登録成功メッセージのランダム化（おつかれさま🌱 等）
- 連勤アラート（5連勤以上の警告）
- 今日のハイライト（今日の日付を強調＋今日のシフト表示）
- シフト編集機能（削除→再登録ではなく直接編集）
- LINE/テキスト共有（月間シフトをコピー可能なテキスト生成）
- 月間レポート強化（円グラフ、前月比較）
- 年間集計ビュー
- みどりんタップリアクション
- 勤務マイルストーン演出
