/**
 * インスタンスの変数バインディングを復元する関数
 *
 * リセット処理後に、ノードに関連付けられていた変数バインディングを復元する
 * これにより、名前はリセットされるが、色やサイズなどの変数連携は維持される
 *
 * @param targetNode - 変数バインディングを復元する対象ノード
 * @param boundVariables - 復元する変数バインディング情報
 */
export default async function restoreBoundVariables(
  targetNode: SceneNode,
  boundVariables: NonNullable<SceneNodeMixin['boundVariables']>,
) {
  console.log('    ', 'restoreBoundVariables', targetNode, boundVariables)

  for (const [variableField, variableValue] of Object.entries(boundVariables)) {
    const variable = await figma.variables.getVariableByIdAsync(
      (variableValue as VariableAlias).id as string,
    )

    if (variable) {
      targetNode.setBoundVariable(variableField as any, variable)
    }
  }
}
