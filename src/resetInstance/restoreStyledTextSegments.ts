export default async function restoreStyledTextSegments(
  targetTextNode: TextNode,
  styledTextSegments: StyledTextSegment[],
) {
  console.log(
    '    ',
    'restoreStyledTextSegments',
    targetTextNode,
    styledTextSegments,
  )

  for (const styledTextSegment of styledTextSegments) {
    const { start, end } = styledTextSegment
    // textStyleIdがあるかどうか
    const hasTextStyleId =
      styledTextSegment.textStyleId && styledTextSegment.textStyleId !== ''
    // fillStyleIdがあるかどうか
    const hasFillStyleId =
      styledTextSegment.fillStyleId && styledTextSegment.fillStyleId !== ''

    // textStyleIdがある場合は、textStyleIdを復元
    if (hasTextStyleId) {
      await targetTextNode.setRangeTextStyleIdAsync(
        start,
        end,
        styledTextSegment.textStyleId,
      )
    }
    // textStyleIdがない場合は、TextStyleに含まれる個別のスタイルを復元
    else {
      // boundVariablesの復元
      if (styledTextSegment.boundVariables) {
        for (const [variableField, variableValue] of Object.entries(
          styledTextSegment.boundVariables,
        )) {
          const variable = await figma.variables.getVariableByIdAsync(
            (variableValue as VariableAlias).id as string,
          )
          targetTextNode.setRangeBoundVariable(
            start,
            end,
            variableField as any,
            variable,
          )
        }
      }

      targetTextNode.setRangeFontName(start, end, styledTextSegment.fontName)
      targetTextNode.setRangeFontSize(start, end, styledTextSegment.fontSize)
      targetTextNode.setRangeLetterSpacing(
        start,
        end,
        styledTextSegment.letterSpacing,
      )
      targetTextNode.setRangeLineHeight(
        start,
        end,
        styledTextSegment.lineHeight,
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
    }

    // fillStyleIdがある場合は、fillStyleIdを復元
    if (hasFillStyleId) {
      await targetTextNode.setRangeFillStyleIdAsync(
        start,
        end,
        styledTextSegment.fillStyleId,
      )
    }
    // fillStyleIdがない場合は、fillsを復元
    else {
      targetTextNode.setRangeFills(start, end, styledTextSegment.fills)
    }

    // textStyleIdの有無に関わらず常に復元するプロパティ
    // fill関連
    targetTextNode.setRangeHyperlink(start, end, styledTextSegment.hyperlink)
    targetTextNode.setRangeIndentation(
      start,
      end,
      styledTextSegment.indentation,
    )
    targetTextNode.setRangeListOptions(
      start,
      end,
      styledTextSegment.listOptions,
    )

    // テキスト装飾関連
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
  }
}
