import { cloneDeep, orderBy } from 'lodash'

function getOverrideValues(
  overrides: {
    id: string
    overriddenFields: NodeChangeProperty[]
  }[],
  ancestorInstance: InstanceNode,
) {
  console.log('getOverrideValues', overrides, ancestorInstance)

  // インスタンスの子要素のoverrideの値を格納するためのマップを作成
  const valuesMap: {
    [id: string]: {
      targetNode: SceneNode
      overriddenFields: {
        [field: string]: any
      }
    }
  } = {}

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

async function restoreBoundVariables(
  targetNode: SceneNode,
  boundVariables: NonNullable<SceneNodeMixin['boundVariables']>,
) {
  for (const [variableField, variableValue] of Object.entries(boundVariables)) {
    console.log(variableField, variableValue)

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

async function restoreStyledTextSegment(
  targetTextNode: TextNode,
  styledTextSegments: StyledTextSegment[],
) {
  for (const styledTextSegment of styledTextSegments) {
    const { start, end } = styledTextSegment

    // targetTextNode.setRangeBoundVariable(start, end)
    targetTextNode.setRangeFillStyleId(
      start,
      end,
      styledTextSegment.fillStyleId,
    )
    targetTextNode.setRangeFills(start, end, styledTextSegment.fills)
    targetTextNode.setRangeFontName(start, end, styledTextSegment.fontName)
    targetTextNode.setRangeFontSize(start, end, styledTextSegment.fontSize)
    targetTextNode.setRangeHyperlink(start, end, styledTextSegment.hyperlink)
    targetTextNode.setRangeIndentation(
      start,
      end,
      styledTextSegment.indentation,
    )
    targetTextNode.setRangeLetterSpacing(
      start,
      end,
      styledTextSegment.letterSpacing,
    )
    targetTextNode.setRangeLineHeight(start, end, styledTextSegment.lineHeight)
    targetTextNode.setRangeListOptions(
      start,
      end,
      styledTextSegment.listOptions,
    )
    targetTextNode.setRangeListSpacing(
      start,
      end,
      styledTextSegment.listSpacing,
    )
    targetTextNode.setRangeParagraphIndent(
      start,
      end,
      styledTextSegment.paragraphIndent,
    )
    targetTextNode.setRangeParagraphSpacing(
      start,
      end,
      styledTextSegment.paragraphSpacing,
    )
    targetTextNode.setRangeTextCase(start, end, styledTextSegment.textCase)
    targetTextNode.setRangeTextDecoration(
      start,
      end,
      styledTextSegment.textDecoration,
    )
    if (styledTextSegment.textDecorationColor) {
      targetTextNode.setRangeTextDecorationColor(
        start,
        end,
        styledTextSegment.textDecorationColor,
      )
    }
    if (styledTextSegment.textDecorationOffset) {
      targetTextNode.setRangeTextDecorationOffset(
        start,
        end,
        styledTextSegment.textDecorationOffset,
      )
    }
    if (styledTextSegment.textDecorationSkipInk) {
      targetTextNode.setRangeTextDecorationSkipInk(
        start,
        end,
        styledTextSegment.textDecorationSkipInk,
      )
    }
    if (styledTextSegment.textDecorationStyle) {
      targetTextNode.setRangeTextDecorationStyle(
        start,
        end,
        styledTextSegment.textDecorationStyle,
      )
    }
    if (styledTextSegment.textDecorationThickness) {
      targetTextNode.setRangeTextDecorationThickness(
        start,
        end,
        styledTextSegment.textDecorationThickness,
      )
    }
    if (styledTextSegment.textStyleId) {
      await targetTextNode.setRangeTextStyleIdAsync(
        start,
        end,
        styledTextSegment.textStyleId,
      )
    }
  }
}

async function restoreComponentProperties(
  targetNode: InstanceNode,
  componentProperties: ComponentProperties,
) {
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
