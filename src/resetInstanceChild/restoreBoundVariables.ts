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
