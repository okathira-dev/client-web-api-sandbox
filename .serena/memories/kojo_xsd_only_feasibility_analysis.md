# XSDのみでの実装可能性分析

## 調査結果：CSVから取得している情報とXSDから取得可能な情報の比較

### ✅ XSDから完全に取得可能な情報

| 情報項目 | CSVからの取得方法 | XSDからの取得方法 | 備考 |
|---------|-----------------|-----------------|------|
| **要素名（タグ名）** | CSV列18（XML構造設計書） | `xsd:element/@name` | 完全一致 |
| **日本語名（項目名）** | CSV列4（帳票フィールド仕様書） | `xsd:element/xsd:annotation/xsd:appinfo` | XSDの方が正確（仕様書と一致） |
| **データ型** | CSV列12（XML構造設計書） | `xsd:element/@type` | 完全一致、より詳細 |
| **出現回数（最小）** | CSV列13（XML構造設計書） | `xsd:element/@minOccurs`（デフォルト: 1） | 完全一致 |
| **出現回数（最大）** | CSV列14（XML構造設計書） | `xsd:element/@maxOccurs`（デフォルト: 1、または"unbounded"） | 完全一致 |
| **親子関係** | CSV列1（レベル）から推測 | `xsd:complexType/xsd:sequence/xsd:element` | XSDの方が正確（構造が明確） |
| **値の範囲（区分型）** | CSV列9（帳票フィールド仕様書） | `xsd:restriction/xsd:enumeration/@value` | XSDの方が正確 |
| **文字数制限** | CSV列16（共通ボキャブラリ） | `xsd:restriction/xsd:maxLength/@value` | 完全一致 |
| **パターン** | CSV列17（共通ボキャブラリ） | `xsd:restriction/xsd:pattern/@value` | 完全一致 |
| **必須/任意** | CSV列13（minOccurs=0で任意） | `xsd:element/@minOccurs`（0で任意） | 完全一致 |

### ⚠️ XSDから部分的に取得可能な情報

| 情報項目 | CSVからの取得方法 | XSDからの取得方法 | 備考 |
|---------|-----------------|-----------------|------|
| **入力型（文字/数値/区分）** | CSV列1（帳票フィールド仕様書） | XSDの型から推測可能 | `xsd:string`→文字型、`xsd:long`/`xsd:decimal`→数値型、`xsd:enumeration`→区分型 |
| **値の範囲（数値型）** | CSV列9（帳票フィールド仕様書） | `xsd:restriction/xsd:minInclusive`、`xsd:maxInclusive` | 一部の型で利用可能 |
| **カテゴリ（グループ名）** | CSV列3（帳票フィールド仕様書） | 親要素の日本語名から推測可能 | XSDには明示的なグループ名はないが、親要素の`appinfo`から推測可能 |

### ❌ XSDから取得できない情報

| 情報項目 | CSVからの取得方法 | 代替案 | 影響度 |
|---------|-----------------|--------|--------|
| **書式情報** | CSV列6（帳票フィールド仕様書） | デフォルト書式を使用、または型から推測 | **低** - 表示用で、必須ではない |
| **項目（グループ）名** | CSV列3（帳票フィールド仕様書） | 親要素の日本語名を使用 | **低** - カテゴリ分類は表示用 |

## 実装の簡潔性の分析

### 現在の実装（CSVベース）

**必要なファイル**:
- 3種類のCSVパーサー（vocabularyParser, xmlStructureParser, formFieldsParser）
- CSVファイルの読み込み処理
- CSV列インデックスの管理
- メタデータ行の処理

**コードの複雑さ**:
- CSVの列インデックスがハードコードされている
- メタデータ行の位置が固定されている
- CSVの形式変更に弱い

### XSDのみでの実装

**必要なファイル**:
- 1つのXSDパーサー（XSDファイルをパース）
- XSDファイルの読み込み処理
- 階層構造の再帰的な処理

**コードの簡潔性**:
- XSDは標準的なXML形式なので、汎用的なXMLパーサーで処理可能
- 列インデックスの管理が不要
- メタデータがXSDの`xsd:documentation`に含まれている
- 構造が明確で、パースが容易

## 結論

### ✅ **XSDのみでCSVへの依存を無くすことは可能**

**理由**:
1. **必須情報はすべてXSDから取得可能**
   - 要素名、日本語名、型、出現回数、親子関係など、表示に必要な情報はすべてXSDから取得可能

2. **コードが簡潔になる**
   - CSVパーサー3つ → XSDパーサー1つ
   - 列インデックスの管理が不要
   - メタデータの処理が簡潔

3. **正確性が向上**
   - XSDは仕様書の正式な定義
   - CSVは手動で作成された可能性があり、誤りが含まれる可能性がある
   - XSDの`appinfo`は仕様書と一致している

### ⚠️ **注意点**

1. **書式情報の欠如**
   - ゼロサプレス、カンマ編集などの書式情報はXSDにはない
   - **対応**: 型情報から推測するか、デフォルト書式を使用
   - **影響**: 表示の見た目に影響するが、機能には影響しない

2. **グループ名の欠如**
   - カテゴリ分類用のグループ名はXSDにはない
   - **対応**: 親要素の日本語名を使用するか、階層構造から推測
   - **影響**: カテゴリ分類の精度が若干下がる可能性があるが、表示には問題ない

## 実装の推奨アプローチ

### Phase 1: XSDパーサーの実装

```typescript
// specs/parsers/xsdParser.ts
interface XsdElement {
  name: string;
  japaneseName: string; // xsd:appinfoから
  type: string;
  minOccurs: number;
  maxOccurs: number | 'unbounded';
  isRequired: boolean;
  children: XsdElement[];
  parent?: XsdElement;
  // 値の範囲（enumerationがある場合）
  enumValues?: string[];
  // 文字数制限
  maxLength?: number;
  // パターン
  pattern?: string;
}

function parseXsdFile(xsdContent: string): XsdElement[] {
  // XSDをパースして要素情報を抽出
  // 階層構造を再帰的に処理
}
```

### Phase 2: ElementMappingの生成

```typescript
// mappings/elementMappingFromXsd.ts
export function generateElementMappingsFromXsd(
  tegCode: string,
  xsdElements: XsdElement[],
): ElementMapping[] {
  const mappings: ElementMapping[] = [];
  
  function traverse(element: XsdElement, parentCode?: string, level = 0) {
    const mapping: ElementMapping = {
      teg: tegCode,
      elementCode: element.name,
      label: element.japaneseName,
      category: parentCode ? getElementJapaneseName(parentCode) : undefined,
      vocabularyOrDataType: element.type,
      minOccurs: element.minOccurs,
      maxOccurs: element.maxOccurs,
      level,
      parentElementCode: parentCode,
      valueRange: element.enumValues?.join(', '),
      // 入力型は型から推測
      inputType: inferInputType(element.type, element.enumValues),
    };
    
    mappings.push(mapping);
    
    // 子要素を再帰的に処理
    element.children.forEach(child => {
      traverse(child, element.name, level + 1);
    });
  }
  
  xsdElements.forEach(root => traverse(root));
  return mappings;
}

function inferInputType(type: string, enumValues?: string[]): string {
  if (enumValues && enumValues.length > 0) {
    return '区分';
  }
  if (type.includes('long') || type.includes('decimal') || type.includes('kingaku')) {
    return '数値';
  }
  return '文字';
}
```

### Phase 3: CSVパーサーの削除

- `vocabularyParser.ts` → 削除（XSDから取得）
- `xmlStructureParser.ts` → 削除（XSDから取得）
- `formFieldsParser.ts` → 削除（XSDから取得）
- `loadSpecs.ts` → XSD読み込みに変更

## まとめ

**XSDのみでCSVへの依存を無くすことは可能で、コードも簡潔になります。**

**メリット**:
- ✅ コードの簡潔性向上（3つのパーサー → 1つのパーサー）
- ✅ 正確性の向上（仕様書と一致）
- ✅ 保守性の向上（CSVファイルの管理が不要）
- ✅ 型安全性の向上（XSDの型情報を活用）

**デメリット**:
- ⚠️ 書式情報の欠如（表示の見た目に影響する可能性）
- ⚠️ グループ名の欠如（カテゴリ分類の精度が若干下がる可能性）

**推奨**: XSDのみでの実装を推奨します。書式情報やグループ名は、必要に応じて後から追加できます。
