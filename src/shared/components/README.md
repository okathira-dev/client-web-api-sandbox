# React プロジェクト用共有コンポーネント

このディレクトリには React プロジェクト間で共有されるコンポーネントが含まれています。

## SocialIcons

SNSアイコン (GitHub, X, Bluesky) および目次ページへのリンクアイコンを表示するためのコンポーネントです。すべてのアイコンは画面右上に縦一列に表示されます。

### 使い方

```tsx
import { SocialIcons } from "../shared/components/SocialIcons";

function MyComponent() {
  return (
    <div>
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/your-project" />
      {/* その他のコンテンツ */}
    </div>
  );
}
```
