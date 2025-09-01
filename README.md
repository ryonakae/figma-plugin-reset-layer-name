# Reset Layer Name Figma Plugin

![](./cover.png)

Resets the names of selected layers to their default values.  
This plugin supports **every type of element** you can select in Figma!  
\-  
選択したレイヤーの名前をデフォルト値にリセットします。  
このプラグインは、Figmaで選択可能な**すべてのタイプの要素**をサポートしています！


## 🔥 How to Use / 使い方

1.  Select one or more layers.
2.  Run this plugin.
3.  Layer names will be reset!

\-

1.  1つ以上のレイヤーを選択します。
2.  このプラグインを実行します。
3.  レイヤー名がリセットされます！

## ✏️ Note: Behavior / 動作について

The plugin's behavior varies depending on the selected element type:  
\-  
プラグインの動作は、選択された要素のタイプによって異なります：

### Component or Variants / コンポーネント・バリアント
The names of Components or Component Sets (Variants) will not be changed to preserve their original names.  
\-  
コンポーネントやコンポーネントセット（バリアント）の名前は、元の名前を保持するため変更されません。

### Instance or Child element of an Instance / インスタンスまたはインスタンスの子要素
The name override for the selected instance or child element is reset.  
\-  
選択されたインスタンスまたは子要素の名前オーバーライドがリセットされます。

- For an **Instance**: All overrides on the instance itself are reset, then all overrides except for the name are restored.
- For a **Child element of an Instance**: All overrides on the *parent* instance are reset, then all overrides except for the name are restored. This effectively resets the name override inherited by the child element.

\-  

- **インスタンス**の場合：インスタンス自体のすべてのオーバーライドをリセットし、その後名前以外のすべてのオーバーライドを復元します。
- **インスタンスの子要素**の場合：*親*インスタンスのすべてのオーバーライドをリセットし、その後名前以外のすべてのオーバーライドを復元します。これにより、子要素が継承している名前オーバーライドを効果的にリセットします。

#### How Instance Reset Works / インスタンスリセットの仕組み
When resetting an instance or its child elements, the plugin performs a sophisticated process:  
\-  
インスタンスまたはその子要素をリセットする際、プラグインは高度な処理を実行します：

1. **Validation**: Checks if the instance has overrides and if name overrides exist
2. **Override Collection**: Saves all current override values (text content, styles, component properties, etc.)
3. **Complete Reset**: Resets all overrides on the instance using `resetOverrides()`
4. **Selective Restoration**: Restores all saved overrides except for the name, maintaining:
   - Text styling and formatting
   - Colors, fills, and strokes
   - Size and positioning
   - Component property values (variants)
   - Variable bindings

\-  

1. **バリデーション**: インスタンスにオーバーライドがあり、名前のオーバーライドが存在するかを確認
2. **オーバーライド収集**: 現在のすべてのオーバーライド値（テキスト内容、スタイル、コンポーネントプロパティなど）を保存
3. **完全リセット**: `resetOverrides()`を使用してインスタンスのすべてのオーバーライドをリセット
4. **選択的復元**: 名前以外の保存されたオーバーライドをすべて復元し、以下を維持：
   - テキストのスタイルと書式
   - 色、塗りつぶし、線
   - サイズと位置
   - コンポーネントプロパティの値（バリアント）
   - 変数バインディング

*Note: Due to Figma API limitations, OpenType features on TextNodes within the instance (or parent instance) cannot be restored.*  
\-  
*注意: Figma APIの制限により、インスタンス（または親インスタンス）内のTextNodeのOpenType機能は復元できません。*

### Other Element Types / その他の要素タイプ
The names of other elements (like Text, Rectangle, Frame, Group, etc.) will be reset to an empty string.  
\-  
その他の要素（テキスト、矩形、フレーム、グループなど）の名前は空の文字列にリセットされます。

#### Special Cases / 特殊なケース
- **Auto-renamed Text**: TextNodes with `autoRename=true` are skipped as they already have default names

\-

- **自動リネームされるテキスト**: `autoRename=true`のTextNodeは、既にデフォルト名を持っているためスキップされます

## 📮 Support

If you encounter any problems or have feedback, please use the [GitHub Issues](https://github.com/ryonakae/figma-plugin-reset-layer-name/issues).

---

This plugin is made by Ryo Nakae 🙎‍♂️.

- https://brdr.jp
- https://x.com/ryo_dg
- https://github.com/ryonakae
