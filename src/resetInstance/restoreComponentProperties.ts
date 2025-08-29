/**
 * インスタンスのコンポーネントプロパティを復元する関数
 *
 * リセット処理後に、インスタンスに設定されていたコンポーネントプロパティの値を復元する
 * バリアント選択や他のプロパティ値を維持するために重要
 *
 * 処理内容:
 * - 通常の値の復元
 * - 変数バインディングされた値の復元
 *
 * @param targetNode - コンポーネントプロパティを復元する対象インスタンス
 * @param componentProperties - 復元するコンポーネントプロパティ情報
 */
export default async function restoreComponentProperties(
  targetNode: InstanceNode,
  componentProperties: ComponentProperties,
) {
  console.log('      ', 'restoreComponentProperties:', {
    targetNode,
    componentProperties,
  })

  for (const [propertyName, propertyValue] of Object.entries(
    componentProperties,
  )) {
    console.log('        ', `${propertyName}:`, { propertyValue })

    // バリアブルが割り当てられている場合
    if (propertyValue.boundVariables?.value) {
      // VariableAliasを設定
      targetNode.setProperties({
        [propertyName]: propertyValue.boundVariables.value,
      })
      console.log('          ', 'restored VariableAlias')
    }
    // それ以外の場合
    else {
      targetNode.setProperties({
        [propertyName]: propertyValue.value,
      })
      console.log('          ', 'restored value')
    }
  }
}
