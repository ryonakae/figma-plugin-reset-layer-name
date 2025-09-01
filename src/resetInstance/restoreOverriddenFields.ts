import restoreBoundVariables from '@/resetInstance/restoreBoundVariables'
import restoreComponentProperties from '@/resetInstance/restoreComponentProperties'

/**
 * 各フィールドのオーバーライド値を復元する
 * @param nodeId - 対象ノードID
 * @param node - リセット対象のノード
 * @param targetNode - 復元対象ノード
 * @param filteredOverriddenFieldEntries - 復元対象フィールドのエントリ配列
 * @returns ノードが復元されたかどうか
 */
export default async function restoreOverriddenFields(
  nodeId: string,
  node: SceneNode,
  targetNode: SceneNode,
  filteredOverriddenFieldEntries: Array<[string, any]>,
): Promise<boolean> {
  let isNodeRestored = false

  for (const [field, value] of filteredOverriddenFieldEntries) {
    console.log('    ', 'restoreOverriddenFields:', { field, value })

    // valueがundefined, null, 空配列, 空文字、空オブジェクトの場合は何もしない
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value.length === 0) ||
      (typeof value === 'object' &&
        value !== null &&
        Object.keys(value).length === 0)
    ) {
      console.log('      ', 'skip because value is empty')
      continue
    }

    // node.idとnodeIdが同じかつfieldがnameの場合は何もしない（名前のリセットが目的のため）
    if (node.id === nodeId && field === 'name') {
      console.log('      ', 'skip because field is name')
      isNodeRestored = true
      continue
    }

    // fieldがboundVariablesの場合
    if (field === 'boundVariables') {
      const _value = value as NonNullable<SceneNodeMixin['boundVariables']>

      await restoreBoundVariables(targetNode, _value)

      isNodeRestored = true
    }

    // fieldがcomponentPropertiesの場合
    else if (field === 'componentProperties') {
      const _targetNode = targetNode as InstanceNode
      const _value = value as ComponentProperties

      await restoreComponentProperties(_targetNode, _value)

      isNodeRestored = true
    }

    // fieldがopenTypeFeaturesの場合
    // 現状openTypeFeaturesはreadonlyなので何もしない
    else if (field === 'openTypeFeatures') {
    }

    // fieldがfontNameの場合、フォントをロードしてからvalueを代入
    else if (field === 'fontName') {
      const _targetNode = targetNode as TextNode
      const _value = value as FontName

      // フォントをロード
      await figma.loadFontAsync(_value)

      // valueを代入
      _targetNode.fontName = _value

      isNodeRestored = true
    }

    // fieldがfillsの場合
    else if (field === 'fills') {
      const _targetNode = targetNode as
        | BooleanOperationNode
        | ComponentNode
        | ComponentSetNode
        | EllipseNode
        | FrameNode
        | HighlightNode
        | InstanceNode
        | LineNode
        | PolygonNode
        | RectangleNode
        | SectionNode
        | ShapeWithTextNode
        | SlideNode
        | StampNode
        | StarNode
        | StickyNode
        | TableCellNode
        | TableNode
        | TextNode
        | TextPathNode
        | TextSublayerNode
        | VectorNode
        | WashiTapeNode

      const fills = value as Paint[]

      // いったんfillsを空にする
      _targetNode.fills = []

      // fillsを代入
      _targetNode.fills = fills

      isNodeRestored = true
    }

    // fieldがstrokesの場合
    else if (field === 'strokes') {
      const _targetNode = targetNode as
        | BooleanOperationNode
        | ComponentNode
        | ComponentSetNode
        | ConnectorNode
        | EllipseNode
        | FrameNode
        | HighlightNode
        | InstanceNode
        | LineNode
        | PolygonNode
        | RectangleNode
        | ShapeWithTextNode
        | SlideNode
        | StampNode
        | StarNode
        | TextNode
        | TextPathNode
        | VectorNode
        | WashiTapeNode

      const strokes = value as Paint[]

      // いったんstrokesを空にする
      _targetNode.strokes = []

      // strokesを代入
      _targetNode.strokes = strokes

      isNodeRestored = true
    }

    // fieldがwidthの場合
    else if (field === 'width') {
      const _targetNode = targetNode as
        | BooleanOperationNode
        | ComponentNode
        | ComponentSetNode
        | EllipseNode
        | FrameNode
        | GroupNode
        | HighlightNode
        | InstanceNode
        | LineNode
        | MediaNode
        | PolygonNode
        | RectangleNode
        | ShapeWithTextNode
        | SliceNode
        | SlideNode
        | StampNode
        | StarNode
        | TextNode
        | TextPathNode
        | TransformGroupNode
        | VectorNode
        | WashiTapeNode

      const width = value as number
      const height = _targetNode.height

      _targetNode.resize(width, height)
    }

    // fieldがheightの場合
    else if (field === 'height') {
      const _targetNode = targetNode as
        | BooleanOperationNode
        | ComponentNode
        | ComponentSetNode
        | EllipseNode
        | FrameNode
        | GroupNode
        | HighlightNode
        | InstanceNode
        | LineNode
        | MediaNode
        | PolygonNode
        | RectangleNode
        | ShapeWithTextNode
        | SliceNode
        | SlideNode
        | StampNode
        | StarNode
        | TextNode
        | TextPathNode
        | TransformGroupNode
        | VectorNode
        | WashiTapeNode

      const width = _targetNode.width
      const height = value as number

      _targetNode.resize(width, height)
    }

    // それ以外のフィールドの場合、valueをそのまま代入
    else {
      const _targetNode = targetNode as any
      _targetNode[field] = value

      isNodeRestored = true
    }
  }

  return isNodeRestored
}
