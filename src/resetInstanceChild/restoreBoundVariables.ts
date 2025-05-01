export default async function restoreBoundVariables(
  targetNode: SceneNode,
  boundVariables: NonNullable<SceneNodeMixin['boundVariables']>,
) {
  for (const [variableField, variableValue] of Object.entries(boundVariables)) {
    // console.log(variableField, variableValue)

    // fieldがfillとstroke以外の場合に、setBoundVariableを実行
    // fillとstrokeはfillsとstrokesを変更することで変数を適用する
    if (variableField !== 'fills' && variableField !== 'strokes') {
      const variable = await figma.variables.getVariableByIdAsync(
        (variableValue as VariableAlias).id as string,
      )
      targetNode.setBoundVariable(variableField as any, variable)
    }
  }
}
