import { cloneDeep, orderBy } from 'lodash-es'

/**
 * インスタンスのオーバーライド値を取得・整理する関数
 *
 * インスタンスとその子要素のオーバーライド値を収集し、リセット後に復元するための
 * データ構造を構築する。名前以外のオーバーライド（スタイル、テキスト内容など）を
 * 保持するために使用される。
 *
 * 処理の流れ:
 * 1. 各オーバーライド要素の現在の値を取得
 * 2. テキストノードの特殊処理（文字列とスタイルセグメント）
 * 3. コンポーネントプロパティの収集
 * 4. 処理の安定性を確保するためのソート処理
 *
 * @param overrides - インスタンスのオーバーライド情報配列
 * @param parentInstance - 対象のインスタンス
 * @returns オーバーライド値を格納したマップオブジェクト
 */
export default function getOverrideValues(
  overrides: {
    id: string
    overriddenFields: NodeChangeProperty[]
  }[],
  parentInstance: InstanceNode,
) {
  console.log('getOverrideValues:', { overrides, parentInstance })

  // インスタンスの子要素のoverrideの値を格納するためのマップを作成
  const valuesMap: OverrideValuesMap = {}

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  overrides.forEach(override => {
    // 対象nodeを取得
    let targetNode: SceneNode

    // override.idがparentInstance.idと同じ場合は、parentInstanceを対象nodeにする
    if (override.id === parentInstance.id) {
      targetNode = parentInstance
    }
    // そうでない場合は、インスタンスから要素を検索する
    else {
      targetNode = parentInstance.findOne(
        node => node.id === override.id,
      ) as SceneNode
    }

    valuesMap[override.id] = { targetNode, overriddenFields: {} }

    // TextNodeの場合は、charactersを常に取得する
    if (targetNode.type === 'TEXT') {
      const textNode = targetNode as TextNode

      // charactersを取得
      valuesMap[override.id].overriddenFields.characters = textNode.characters
    }

    override.overriddenFields.forEach(overridenField => {
      // charactersの場合（TextNodeの場合は既に取得済みなのでスキップ）
      if (overridenField === 'characters' && targetNode.type === 'TEXT') {
      }
      // styledTextSegmentsの場合
      else if (
        overridenField === 'styledTextSegments' &&
        targetNode.type === 'TEXT'
      ) {
        // styledTextSegmentsを取得（すべてのフィールドを指定）
        valuesMap[override.id].overriddenFields.styledTextSegments =
          targetNode.getStyledTextSegments([
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
          ])
      }
      // stokeTopWeightの場合
      // Plugin APIのバグでstrokeTopWeightがstokeTopWeightになっているため
      else if (
        overridenField === 'stokeTopWeight' &&
        (targetNode.type === 'COMPONENT' ||
          targetNode.type === 'COMPONENT_SET' ||
          targetNode.type === 'FRAME' ||
          targetNode.type === 'INSTANCE' ||
          targetNode.type === 'RECTANGLE' ||
          targetNode.type === 'SLIDE')
      ) {
        const value = targetNode.strokeTopWeight
        valuesMap[override.id].overriddenFields.strokeTopWeight = value
      }
      // それ以外のフィールドの場合、lodashのcloneDeepを使用して値を保存
      else {
        const value = cloneDeep((targetNode as any)[overridenField])
        valuesMap[override.id].overriddenFields[overridenField] = value
      }
    })
  })

  // parentInstanceの子要素からインスタンスを探して、componentPropertiesを取得
  const childInstances = parentInstance.findAll(
    node => node.type === 'INSTANCE',
  ) as InstanceNode[]
  childInstances.forEach(instance => {
    // componentPropertiesが存在し、空でない場合のみ処理
    if (
      instance.componentProperties &&
      Object.keys(instance.componentProperties).length > 0
    ) {
      // すでにvaluesMapに存在する場合は、overriddenFieldsにcomponentPropertiesを追加
      if (valuesMap[instance.id]) {
        valuesMap[instance.id].overriddenFields.componentProperties = cloneDeep(
          instance.componentProperties,
        )
      }
      // まだvaluesMapに存在しない場合は、新たにエントリを作成
      else {
        valuesMap[instance.id] = {
          targetNode: instance,
          overriddenFields: {
            componentProperties: cloneDeep(instance.componentProperties),
          },
        }
      }
    }
  })

  // idキーとvalueの配列に変換
  type EntryType = {
    id: string
    targetNode: SceneNode
    overriddenFields: { [field: string]: unknown }
  }

  const entries: EntryType[] = Object.entries(valuesMap).map(([id, value]) => ({
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
    // overriddenFieldsのキーを1.文字列が短い順、2.アルファベット順でソートして新しいオブジェクトを作成
    const sortedFields: { [field: string]: unknown } = {}

    // キーを取得してソート条件を適用
    const keys = Object.keys(entry.overriddenFields).sort((a, b) => {
      // 1. 文字列の長さで比較（短い順）
      if (a.length !== b.length) {
        return a.length - b.length
      }
      // 2. アルファベット順
      return a.localeCompare(b)
    })

    // ソートされたキーの順番で新しいオブジェクトを構築
    keys.forEach(key => {
      sortedFields[key] = entry.overriddenFields[key]
    })

    values[entry.id] = {
      targetNode: entry.targetNode,
      overriddenFields: sortedFields,
    }
  })

  return values
}
