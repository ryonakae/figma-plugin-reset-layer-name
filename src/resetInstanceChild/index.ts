import getOverrideValues from '@/resetInstanceChild/getOverrideValues'
import restoreBoundVariables from '@/resetInstanceChild/restoreBoundVariables'
import restoreComponentProperties from '@/resetInstanceChild/restoreComponentProperties'
import restoreStyledTextSegments from '@/resetInstanceChild/restoreStyledTextSegments'
import validate from '@/resetInstanceChild/validate'

export default async function resetInstanceChild(
  node: SceneNode,
  ancestorInstance: InstanceNode,
): Promise<Result> {
  console.log('resetInstanceChild', node, ancestorInstance)

  // 前提条件の検証
  const validationResult = validate(node, ancestorInstance)
  if (!validationResult.success) {
    return validationResult
  }

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  const overrideValues = getOverrideValues(
    ancestorInstance.overrides,
    ancestorInstance,
  )
  console.log('overrideValues', overrideValues)

  // 先祖インスタンスのoverrideをリセット
  ancestorInstance.resetOverrides()

  // 先祖インスタンス自身を含む、overrideValuesに保存されている各nodeのoverrideを復元
  // node.name以外
  for (const [nodeId, { targetNode, overriddenFields }] of Object.entries(
    overrideValues,
  )) {
    console.log('targetNode', targetNode)
    console.log('  overriddenFields', overriddenFields)

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

      // styledTextSegmentsを復元
      if (overriddenFields.styledTextSegments) {
        await restoreStyledTextSegments(
          targetNode as TextNode,
          overriddenFields.styledTextSegments,
        )
      }
    }

    // charactersとstyledTextSegmentsを除いたoverriddenFieldsを定義
    const filteredOverriddenFieldEntries = Object.entries(
      overriddenFields,
    ).filter(
      ([field]) => field !== 'characters' && field !== 'styledTextSegments',
    )

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
        continue
      }

      // node.idとnodeIdが同じかつfieldがnameの場合は何もしない（名前のリセットが目的のため）
      if (node.id === nodeId && field === 'name') {
        continue
      }

      // fieldがboundVariablesの場合
      if (field === 'boundVariables') {
        await restoreBoundVariables(targetNode, value)
      }

      // fieldがcomponentPropertiesの場合
      else if (field === 'componentProperties') {
        await restoreComponentProperties(targetNode as InstanceNode, value)
      }

      // fieldがopenTypeFeaturesの場合
      // 現状openTypeFeaturesはreadonlyなので何もしない
      else if (field === 'openTypeFeatures') {
      }

      // fieldがfontNameの場合、フォントをロードしてからvalueを代入
      else if (field === 'fontName') {
        // フォントをロード
        await figma.loadFontAsync(value as FontName)
        // valueを代入
        ;(targetNode as any)[field] = value
      }

      // それ以外のフィールドの場合、valueをそのまま代入
      else {
        ;(targetNode as any)[field] = value
      }
    }
  }

  return { success: true }
}
