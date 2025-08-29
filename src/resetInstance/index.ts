import getOverrideValues from '@/resetInstance/getOverrideValues'
import restoreComponentProperties from '@/resetInstance/restoreComponentProperties'
import restoreOverriddenFields from '@/resetInstance/restoreOverriddenFields'
import restoreStyledTextSegments from '@/resetInstance/restoreStyledTextSegments'
import validate from '@/resetInstance/validate'

/**
 * インスタンスとその子要素をリセットする関数
 *
 * インスタンスのオーバーライドをリセットし、メインコンポーネントの名前に戻す処理を実行する。
 * ただし、テキストスタイルや他のプロパティなど、名前以外のオーバーライドは保持する。
 *
 * 処理の流れ:
 * 1. 対象ノードの検証
 * 2. オーバーライド値の取得と保存
 * 3. インスタンスのオーバーライドをリセット
 * 4. 保存したオーバーライド値の中で、名前以外の値を復元
 *
 * @param node - リセット対象のノード
 * @param parentInstance - nodeの親インスタンス（nodeがインスタンス自体の場合は自分自身）
 * @returns 処理結果を表すResultオブジェクト
 */
export default async function resetInstance(
  node: SceneNode,
  parentInstance: InstanceNode,
): Promise<Result> {
  console.log('resetInstanceChild:', {
    'node.name': node.name,
    node,
    parentInstance,
  })

  // 前提条件の検証
  const validationResult = validate(node, parentInstance)
  if (!validationResult.success) {
    return validationResult
  }

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  const overrideValues = getOverrideValues(
    parentInstance.overrides,
    parentInstance,
  )
  console.log('overrideValues:', { overrideValues })

  // 親インスタンスのoverrideをリセット
  parentInstance.resetOverrides()

  // 復元したノードの数をカウントする変数
  let restoredNodesCount = 0

  // 親インスタンス自身を含む、overrideValuesに保存されている各nodeのoverrideを復元 (node.name以外)
  // まず親インスタンスを復元してから子要素を復元するような順番で処理する
  // 親インスタンスでバリアントを変更したりしている場合、子要素が見つからないなどの問題が起きる可能性があるため
  for (const [nodeId, { targetNode, overriddenFields }] of Object.entries(
    overrideValues,
  )) {
    console.log('targetNode:', {
      'targetNode.name': targetNode.name,
      targetNode,
    })
    console.log('  ', 'overriddenFields:', { overriddenFields })

    // ノードが復元されたかどうかを追跡するフラグ
    let isNodeRestored = false

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
        isNodeRestored = true
      }

      // styledTextSegmentsを復元
      if (overriddenFields.styledTextSegments) {
        await restoreStyledTextSegments(
          targetNode as TextNode,
          overriddenFields.styledTextSegments,
        )
        isNodeRestored = true
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
      // テキストノードで既に復元を行っていた場合はカウントする
      if (isNodeRestored) {
        restoredNodesCount++
      }
      continue
    }

    // filteredOverriddenFieldEntriesの各要素に対して復元処理を実行 (name以外)
    isNodeRestored = await restoreOverriddenFields(
      nodeId,
      node,
      targetNode,
      filteredOverriddenFieldEntries,
    )

    // ノードが少なくとも1つのフィールドで復元された場合、カウントを増やす
    if (isNodeRestored) {
      restoredNodesCount++
    }
  }

  // 親インスタンスのcomponentPropertiesを復元(変更されている場合のみ)
  // ↑でおこなった子要素の復元により、プロパティの値が変わってしまう可能性があるため
  if (overrideValues[parentInstance.id].overriddenFields.componentProperties) {
    const componentProperties = overrideValues[parentInstance.id]
      .overriddenFields.componentProperties as ComponentProperties

    await restoreComponentProperties(parentInstance, componentProperties)

    restoredNodesCount++
  }

  // 復元したノードが1つもない場合はfalseを返す
  if (restoredNodesCount === 0) {
    return { success: false, error: 'No nodes restored' }
  }

  return { success: true }
}
