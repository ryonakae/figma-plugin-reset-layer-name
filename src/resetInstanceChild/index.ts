import getOverrideValues from '@/resetInstanceChild/getOverrideValues'
import restoreBoundVariables from '@/resetInstanceChild/restoreBoundVariables'
import restoreComponentProperties from '@/resetInstanceChild/restoreComponentProperties'
import restoreStyledTextSegment from '@/resetInstanceChild/restoreStyledTextSegment'

export default async function resetInstanceChild(
  node: SceneNode,
  ancestorInstance: InstanceNode,
): Promise<{ success: true } | { success: false; error: string }> {
  console.log('resetInstanceChild', node, ancestorInstance)

  // 先祖インスタンスに設定されているoverrideを取得
  const overrides = ancestorInstance.overrides
  console.log('ancestorInstance overrides', overrides)

  // overridesが無い場合は処理中断
  if (!overrides.length) {
    return { success: false, error: 'No overrides found' }
  }

  // nodeと同じidのoverrideがあるか確認
  const nodeOverride = overrides.find(override => override.id === node.id)

  // nodeと同じidのoverrideが無い場合は処理中断
  if (!nodeOverride) {
    return { success: false, error: 'No overrides found for this layer' }
  }

  // nameプロパティがオーバーライドされているか確認
  // nameプロパティがオーバーライドされていない場合は処理中断
  if (!nodeOverride.overriddenFields.includes('name')) {
    return {
      success: false,
      error: 'Layer name is not overridden',
    }
  }

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  const overrideValues = getOverrideValues(overrides, ancestorInstance)
  console.log('overrideValues', overrideValues)

  // 先祖インスタンスのoverrideをリセット
  ancestorInstance.resetOverrides()

  // 先祖インスタンス自身を含む、overrideValuesに保存されている各nodeのoverrideを復元
  // node.name以外
  for (const [nodeId, { targetNode, overriddenFields }] of Object.entries(
    overrideValues,
  )) {
    console.log('targetNode', targetNode)
    console.log('overriddenFields', overriddenFields)

    // targetNodeがテキストの場合
    if (targetNode.type === 'TEXT') {
      // 事前にフォントをロード
      await Promise.all(
        targetNode
          .getRangeAllFontNames(0, targetNode.characters.length)
          .map(figma.loadFontAsync),
      )

      // 先に文字列を復元
      // setRange...関数を実行する際に文字列が復元前と異なるとエラーになるため
      if (overriddenFields.characters) {
        targetNode.characters = overriddenFields.characters
      }
    }

    // charactersを除いたoverriddenFieldsを定義
    const filteredOverriddenFieldEntries = Object.entries(
      overriddenFields,
    ).filter(([field]) => field !== 'characters')

    // filteredOverriddenFieldEntriesが0件なら処理をスキップ
    if (!filteredOverriddenFieldEntries.length) {
      continue
    }

    // filteredOverriddenFieldEntriesごとに処理を実行
    for (const [field, value] of filteredOverriddenFieldEntries) {
      console.log('    ', field, value)

      // valueがundefined, null, 空配列, 空文字の場合は何もしない
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'string' && value.length === 0)
      ) {
        console.log(
          field,
          value,
          'undefined, null, empty array or empty string',
        )
        continue
      }

      // node.idとnodeIdが同じかつfieldがnameの場合は何もしない（名前のリセットが目的のため）
      if (node.id === nodeId && field === 'name') {
        continue
      }

      // fieldがboundVariablesの場合
      if (field === 'boundVariables') {
        restoreBoundVariables(targetNode, value)
      }

      // fieldがcomponentPropertiesの場合
      else if (field === 'componentProperties') {
        restoreComponentProperties(targetNode as InstanceNode, value)
      }

      // fieldがopenTypeFeaturesの場合
      else if (field === 'openTypeFeatures') {
        // TODO: openTypeFeaturesの復元処理を実装する
      }

      // fieldがstyledTextSegmentsの場合
      else if (field === 'styledTextSegments') {
        restoreStyledTextSegment(targetNode as TextNode, value)
      }

      // それ以外のフィールドの場合、valueをそのまま代入
      else {
        ;(targetNode as any)[field] = value
      }
    }
  }

  return { success: true }
}
