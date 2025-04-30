import { cloneDeep } from 'lodash'

function getOverrideValues(
  overrides: {
    id: string
    overriddenFields: NodeChangeProperty[]
  }[],
  ancestorInstance: InstanceNode,
) {
  console.log('getOverrideValues', overrides, ancestorInstance)

  // インスタンスの子要素のoverrideの値を格納する配列を作成
  const values: {
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

    values[override.id] = { targetNode, overriddenFields: {} }

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
        values[override.id].overriddenFields.styledTextSegments =
          styledTextSegments
      }
      // stokeTopWeightの場合
      // Plugin APIのバグでstrokeTopWeightがstokeTopWeightになっているため
      else if (overridenField === 'stokeTopWeight') {
        const value = (targetNode as any).strokeTopWeight
        values[override.id].overriddenFields.strokeTopWeight = value
      }
      // それ以外のフィールドの場合、lodashのcloneDeepを使用して値を保存
      else {
        const value = cloneDeep((targetNode as any)[overridenField])
        values[override.id].overriddenFields[overridenField] = value
      }
    })
  })

  return values
}

async function restoreBoundVariables(
  boundVariables: NonNullable<SceneNodeMixin['boundVariables']>,
  targetNode: SceneNode,
) {
  for (const [variableField, variableValue] of Object.entries(boundVariables)) {
    console.log(variableField, variableValue)

    if (variableField === 'fills') {
    } else if (variableField === 'strokes') {
    } else {
      const variable = await figma.variables.getVariableByIdAsync(
        (variableValue as VariableAlias).id as string,
      )
      targetNode.setBoundVariable(variableField as any, variable)
    }
  }
}

async function restoreStyledTextSegment(
  styledTextSegments: StyledTextSegment[],
  targetTextNode: TextNode,
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

export default async function resetInstanceChild(
  node: SceneNode,
  ancestorInstance: InstanceNode,
): Promise<{ success: boolean; error?: string }> {
  console.log('resetInstanceChild', node, ancestorInstance)

  // 先祖インスタンスに設定されているoverrideを取得
  const overrides = ancestorInstance.overrides
  console.log('overrides', overrides)

  // overridesが無い場合は処理中断
  if (!overrides.length) {
    console.warn('no overrides')
    return { success: false, error: 'No overrides found' }
  }

  // nodeと同じidのoverrideが無い場合は処理中断
  if (!overrides.find(override => override.id === node.id)) {
    console.warn('no override')
    return { success: false, error: 'No matching override found for this node' }
  }

  // overrideの各子要素ごとに、overridenFieldsの値を取得
  const overrideValues = getOverrideValues(overrides, ancestorInstance)
  console.log('overrideValues', overrideValues)

  // 先祖インスタンスのoverrideをリセット
  ancestorInstance.resetOverrides()

  // 先祖インスタンス自身を含む、overrideValuesに保存されている各nodeのoverrideを復元
  // node.name以外
  for (const [_nodeId, { targetNode, overriddenFields }] of Object.entries(
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

    // overriddenFieldsごとに処理を実行
    for (const [field, value] of Object.entries(overriddenFields)) {
      console.log(field, value)

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

      // fieldがnameの場合は何もしない（名前のリセットが目的のため）
      if (field === 'name') {
        continue
      }

      // fieldがboundVariablesの場合
      if (field === 'boundVariables') {
        restoreBoundVariables(value, targetNode)
      }

      // fieldがstyledTextSegmentsの場合、restoreStyledTextSegmentを実行
      else if (field === 'styledTextSegments') {
        restoreStyledTextSegment(value, targetNode as TextNode)
      }

      // それ以外のフィールドの場合、valueをそのまま代入
      else {
        ;(targetNode as any)[field] = value
      }
    }

    console.log(targetNode)
  }

  return { success: true }
}
