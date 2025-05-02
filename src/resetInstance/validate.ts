/**
 * リセット処理の実行条件を検証する関数
 *
 * インスタンスのオーバーライドをリセットする前に、以下の条件を確認する：
 * 1. インスタンスにオーバーライドが存在するか
 * 2. 対象ノードにオーバーライドが設定されているか
 * 3. 特に名前のオーバーライドが存在するか（レイヤー名リセットが目的のため）
 *
 * これにより、不必要な処理の実行を防ぎ、エラーメッセージを適切に返す
 *
 * @param node - 検証対象のノード
 * @param ancestorInstance - ノードの先祖インスタンス
 * @returns 検証結果を表すResultオブジェクト
 */
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
