# kojo-xml-viewer 改善提案：XMLスキーマ活用による堅牢な実装

## 現状の問題点

1. **CSVファイルへの依存**: 現在はExcelファイルを無理やりCSV/HTMLに変換して使用
2. **型安全性の欠如**: CSVパースは手動で列インデックスを指定しており、型安全性が低い
3. **バリデーション不足**: XMLファイルの構造検証が不十分
4. **重複した情報管理**: CSVとXMLスキーマで同じ情報を別々に管理

## 利用可能なリソース

### 1. XMLスキーマ（XSD）ファイル

**場所**: `kojoall_original/04XMLスキーマ/`

**構造**:
- `general/General.xsd`: 共通ボキャブラリの定義
  - `name`, `address`, `yymmdd`, `kingaku`, `kubun` など
  - 各型に`xsd:appinfo`で日本語名が記載
- `kyotsu/TEG*.xsd`: 各TEGコードのスキーマ定義
  - 各要素に`xsd:appinfo`で日本語名が記載
  - 例: `<xsd:appinfo>"保険会社名"</xsd:appinfo>`

**特徴**:
- 要素の出現回数（minOccurs, maxOccurs）が定義されている
- データ型が厳密に定義されている
- 必須/任意が明確に定義されている

### 2. CSV変換モジュールテンプレート

**場所**: `kojoall_original/03CSV変換モジュールインターフェイス仕様書【電子的控除証明書等】/CSV変換モジュールバイナリ/property/`

**ファイル**: `TEG800_1.1_tpl.xml`など

**内容**:
- CSV列番号とXML要素のマッピング
- 親子関係の定義
- 必須/任意の定義
- ゼロサプレスなどの書式情報

## 改善提案

### 提案1: XMLスキーマから型定義を自動生成

**目的**: XSDファイルからTypeScriptの型定義を自動生成

**実装方法**:
1. XSDパーサーライブラリを使用（例: `xsd2ts`、`xml2js`）
2. XSDファイルをパースしてTypeScript型を生成
3. `xsd:appinfo`から日本語名を抽出してJSDocコメントに追加

**メリット**:
- 型安全性の向上
- 自動補完の改善
- コンパイル時エラーの検出

**ツール候補**:
- `xsd2ts`: XSD to TypeScript converter
- `quicktype`: JSON/XML/Schema to TypeScript
- カスタムパーサー: `@xmldom/xmldom` + `xpath`でXSDをパース

### 提案2: XMLスキーマベースのバリデーション

**目的**: アップロードされたXMLファイルをXSDで検証

**実装方法**:
1. ブラウザ上でXSDバリデーション（`libxmljs`のWASM版など）
2. またはサーバーサイドでバリデーション
3. エラーメッセージをユーザーに表示

**メリット**:
- 不正なXMLの早期検出
- 仕様違反の明確なエラー表示

**ライブラリ候補**:
- `libxmljs-wasm`: WASM版のlibxmljs
- `xmldom` + カスタムバリデーター

### 提案3: XSDから要素マッピングを自動生成

**目的**: CSVパースの代わりにXSDから要素情報を取得

**実装方法**:
1. XSDファイルをパース
2. 各要素の`xsd:appinfo`から日本語名を取得
3. `minOccurs`/`maxOccurs`から出現回数を取得
4. 型情報からデータ型を取得
5. 親子関係をツリー構造として構築

**メリット**:
- CSVファイルへの依存を削減
- より正確な構造情報の取得
- バージョン管理が容易（XSDファイルのみ）

**実装例**:
```typescript
interface XsdElement {
  name: string;
  japaneseName: string; // xsd:appinfoから取得
  type: string;
  minOccurs: number;
  maxOccurs: number | 'unbounded';
  children: XsdElement[];
}
```

### 提案4: CSV変換テンプレートの活用

**目的**: CSV変換テンプレート（tpl.xml）からマッピング情報を取得

**実装方法**:
1. tpl.xmlファイルをパース
2. CSV列番号とXML要素のマッピングを抽出
3. 書式情報（zeroSuppressなど）を取得
4. 必須/任意の情報を取得

**メリット**:
- CSV列番号の正確なマッピング
- 書式情報の取得
- 既存のCSV変換モジュールとの互換性

### 提案5: ハイブリッドアプローチ（推奨）

**目的**: XSDを主情報源とし、CSV/テンプレートを補助的に使用

**実装方法**:
1. **基本構造**: XSDから取得
   - 要素名、型、出現回数、親子関係
2. **表示情報**: CSVから取得（既存の実装を活用）
   - 項目名、グループ名、書式、値の範囲
3. **マッピング情報**: tpl.xmlから取得（必要に応じて）
   - CSV列番号との対応

**メリット**:
- 既存のCSVパーサーを活用
- XSDの型安全性を活用
- 段階的な移行が可能

## 実装の優先順位

### Phase 1: XSDパーサーの実装（高優先度）
1. XSDファイルをパースして要素情報を取得
2. `xsd:appinfo`から日本語名を抽出
3. 既存のCSVパーサーと並行して使用

### Phase 2: バリデーションの追加（中優先度）
1. アップロードされたXMLをXSDで検証
2. エラーメッセージを表示

### Phase 3: 型定義の自動生成（低優先度）
1. XSDからTypeScript型を自動生成
2. ビルド時に型定義を更新

## 技術的な考慮事項

### XSDパーサーの選択

**ブラウザ環境での制約**:
- Node.jsのライブラリは直接使用できない
- WASM版のライブラリが必要
- または、カスタムパーサーを実装

**推奨アプローチ**:
1. ビルド時にXSDをパースしてJSONに変換
2. 実行時にJSONを読み込んで使用
3. これにより、ブラウザでのXSDパースの複雑さを回避

### パフォーマンス

- XSDファイルは比較的小さい（各TEGコードで数百行）
- パースは一度だけ実行すればよい（キャッシュ可能）
- バリデーションは必要に応じて実行

### 互換性

- 既存のCSVパーサーを段階的に置き換え
- 既存のAPIを維持しながら内部実装を改善
- テストを追加して回帰を防止

## 具体的な実装例

### XSDパーサーの実装（ビルド時）

```typescript
// scripts/parseXsd.ts
import { DOMParser } from '@xmldom/xmldom';
import { select } from 'xpath';

interface XsdElementInfo {
  name: string;
  japaneseName?: string;
  type: string;
  minOccurs: number;
  maxOccurs: number | 'unbounded';
  children: XsdElementInfo[];
}

function parseXsdFile(xsdPath: string): XsdElementInfo[] {
  const xsdContent = fs.readFileSync(xsdPath, 'utf-8');
  const doc = new DOMParser().parseFromString(xsdContent);
  
  // xsd:elementを取得
  const elements = select('//xsd:element', doc) as Element[];
  
  return elements.map(element => {
    const name = element.getAttribute('name') || '';
    const appinfo = select('.//xsd:appinfo', element)[0] as Element;
    const japaneseName = appinfo?.textContent?.trim().replace(/"/g, '');
    
    // 型情報、出現回数などを取得
    // ...
    
    return {
      name,
      japaneseName,
      // ...
    };
  });
}
```

### 実行時の使用

```typescript
// specs/loadXsdSpecs.ts
import xsdSpecs from '../generated/xsd-specs.json';

export function getElementInfo(tegCode: string, elementCode: string) {
  const spec = xsdSpecs[tegCode];
  return spec?.elements.find(e => e.name === elementCode);
}
```

## まとめ

XMLスキーマを活用することで、以下の改善が期待できます：

1. **型安全性の向上**: XSDから型定義を自動生成
2. **バリデーションの強化**: XMLファイルの構造検証
3. **保守性の向上**: CSVへの依存を削減
4. **正確性の向上**: 仕様書との整合性を確保

段階的な実装により、既存の機能を壊すことなく改善を進めることができます。
