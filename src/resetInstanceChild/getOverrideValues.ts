import { cloneDeep, orderBy } from 'lodash'

export default function getOverrideValues(
  overrides: {
    id: string
    overriddenFields: NodeChangeProperty[]
  }[],
  ancestorInstance: InstanceNode,
) {
  console.log('getOverrideValues', overrides, ancestorInstance)

  // インスタンスの子要素のoverrideの値を格納するためのマップを作成
  const valuesMap: OverrideValuesMap = {}

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  overrides.forEach(override => {
    // 対象nodeを取得
    let targetNode: SceneNode

    // override.idがancestorInstance.idと同じ場合は、ancestorInstanceを対象nodeにする
    if (override.id === ancestorInstance.id) {
      targetNode = ancestorInstance
    }
    // そうでない場合は、インスタンスから要素を検索する
    else {
      targetNode = ancestorInstance.findOne(
        node => node.id === override.id,
      ) as SceneNode
    }

    valuesMap[override.id] = { targetNode, overriddenFields: {} }

    override.overriddenFields.forEach(overridenField => {
      // styledTextSegmentsの場合
      if (overridenField === 'styledTextSegments') {
        const styledTextSegments = (
          targetNode as TextNode
        ).getStyledTextSegments([
          'fontSize',
          'fontName',
          'fontWeight',
          'textDecoration',
          'textDecorationStyle',
          'textDecorationOffset',
          'textDecorationThickness',
          'textDecorationColor',
          'textDecorationSkipInk',
          'textCase',
          'lineHeight',
          'letterSpacing',
          'fills',
          'textStyleId',
          'fillStyleId',
          'listOptions',
          'listSpacing',
          'indentation',
          'paragraphIndent',
          'paragraphSpacing',
          'hyperlink',
          'openTypeFeatures',
          'boundVariables',
          'textStyleOverrides',
        ])
        valuesMap[override.id].overriddenFields.styledTextSegments =
          styledTextSegments
      }
      // stokeTopWeightの場合
      // Plugin APIのバグでstrokeTopWeightがstokeTopWeightになっているため
      else if (overridenField === 'stokeTopWeight') {
        const value = (targetNode as any).strokeTopWeight
        valuesMap[override.id].overriddenFields.strokeTopWeight = value
      }
      // それ以外のフィールドの場合、lodashのcloneDeepを使用して値を保存
      else {
        const value = cloneDeep((targetNode as any)[overridenField])
        valuesMap[override.id].overriddenFields[overridenField] = value
      }
    })
  })

  // idキーとvalueの配列に変換
  const entries = Object.entries(valuesMap).map(([id, value]) => ({
    id,
    ...value,
  }))

  // 並び替え条件に従ってソート
  const sortedEntries = orderBy(
    entries,
    [
      // 1. idの文字数（セグメント数）が少ない順
      entry => entry.id.split(';').length,
      // 2. id内の数値が若い順（数値部分のみを比較）
      entry => {
        // 各セグメントを分解し、数値部分を抽出して比較用の文字列を生成
        return entry.id
          .split(';')
          .map(segment => {
            // 数値部分を抽出（数字以外は無視）
            const numPart = segment.replace(/\D/g, '')
            // 0埋めして桁数を揃える（ソート用）
            return numPart.padStart(10, '0')
          })
          .join(';')
      },
      // 3. targetNodeがInstanceNodeのものを上に
      entry => (entry.targetNode.type === 'INSTANCE' ? 0 : 1),
    ],
    ['asc', 'asc', 'asc'], // すべて昇順
  )

  // ソートした結果をオブジェクトに戻す
  const values: typeof valuesMap = {}
  sortedEntries.forEach(entry => {
    values[entry.id] = {
      targetNode: entry.targetNode,
      overriddenFields: entry.overriddenFields,
    }
  })

  return values
}
