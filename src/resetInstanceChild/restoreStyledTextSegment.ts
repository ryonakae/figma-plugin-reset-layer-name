export default async function restoreStyledTextSegment(
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
