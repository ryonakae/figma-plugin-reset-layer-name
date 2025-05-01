export default async function restoreComponentProperties(
  targetNode: InstanceNode,
  componentProperties: ComponentProperties,
) {
  console.log(
    '    ',
    'restoreComponentProperties',
    targetNode,
    componentProperties,
  )

  for (const [propertyName, propertyValue] of Object.entries(
    componentProperties,
  )) {
    // バリアブルが割り当てられている場合
    if (propertyValue.boundVariables?.value) {
      // VariableAliasを設定
      targetNode.setProperties({
        [propertyName]: propertyValue.boundVariables.value,
      })
    }
    // それ以外の場合
    else {
      targetNode.setProperties({
        [propertyName]: propertyValue.value,
      })
    }
  }
}
