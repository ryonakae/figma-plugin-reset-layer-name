export default function validate(
  node: SceneNode,
  ancestorInstance: InstanceNode,
): Result {
  // 先祖インスタンスに設定されているoverrideを取得
  const overrides = ancestorInstance.overrides
  console.log('ancestorInstance overrides', overrides)

  // overridesが無い場合は処理中断
  if (!overrides.length) {
    return { success: false, error: 'No overrides found' }
  }

  // nodeと同じidのoverrideがあるか確認し、無い場合は処理中断
  const nodeOverride = overrides.find(override => override.id === node.id)
  if (!nodeOverride) {
    return { success: false, error: 'No overrides found for this layer' }
  }

  // nameプロパティがオーバーライドされていない場合は処理中断
  if (!nodeOverride.overriddenFields.includes('name')) {
    return {
      success: false,
      error: 'Name has already been reset',
    }
  }

  return { success: true }
}
