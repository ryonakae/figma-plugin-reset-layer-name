declare global {
  type Result = { success: true } | { success: false; error: string }

  type OverrideFieldMap = {
    name: string
    visible: boolean
    locked: boolean
    opacity: number
    blendMode: BlendMode
    width: number
    height: number
    minWidth: number | null
    maxWidth: number | null
    minHeight: number | null
    maxHeight: number | null
    constraints: Constraints
    layoutGrids: ReadonlyArray<LayoutGrid>
    guides: ReadonlyArray<Guide>
    characters: string
    openTypeFeatures: { readonly [feature in OpenTypeFeature]: boolean }
    vectorNetwork: VectorNetwork
    effects: ReadonlyArray<Effect>
    exportSettings: ReadonlyArray<ExportSettings>
    arcData: ArcData
    autoRename: boolean
    fontName: FontName
    innerRadius: number
    fontSize: number
    lineHeight: LineHeight
    leadingTrim: LeadingTrim
    paragraphIndent: number
    paragraphSpacing: number
    listSpacing: number
    hangingPunctuation: boolean
    hangingList: boolean
    letterSpacing: LetterSpacing
    textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
    textCase: TextCase
    textDecoration: TextDecoration
    textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
    textTruncation: 'DISABLED' | 'ENDING'
    maxLines: number | null
    fills: ReadonlyArray<Paint>
    topLeftRadius: number
    topRightRadius: number
    bottomLeftRadius: number
    bottomRightRadius: number
    constrainProportions: boolean
    strokes: ReadonlyArray<Paint>
    strokeWeight: number
    strokeAlign: 'CENTER' | 'INSIDE' | 'OUTSIDE'
    strokeCap: StrokeCap
    strokeJoin: StrokeJoin
    strokeMiterLimit: number
    booleanOperation: 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE'
    overflowDirection: OverflowDirection
    dashPattern: ReadonlyArray<number>
    backgrounds: ReadonlyArray<Paint>
    handleMirroring: HandleMirroring
    cornerRadius: number
    cornerSmoothing: number
    relativeTransform: Transform
    x: number
    y: number
    rotation: number
    isMask: boolean
    maskType: MaskType
    clipsContent: boolean
    type: NodeType
    pointCount: number
    parent: (BaseNode & ChildrenMixin) | null
    pluginData: string
    styledTextSegments: ReadonlyArray<StyledTextSegment>
    overlayPositionType: OverlayPositionType
    overlayBackgroundInteraction: OverlayBackgroundInteraction
    overlayBackground: OverlayBackground
    prototypeStartNode:
      | FrameNode
      | GroupNode
      | ComponentNode
      | InstanceNode
      | null
    prototypeBackgrounds: ReadonlyArray<Paint>
    expanded: boolean
    fillStyleId: string
    strokeStyleId: string
    backgroundStyleId: string
    textStyleId: string
    effectStyleId: string
    gridStyleId: string
    description: string
    layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
    layoutWrap: 'NO_WRAP' | 'WRAP'
    paddingLeft: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    itemSpacing: number
    counterAxisSpacing: number
    layoutAlign: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT'
    counterAxisSizingMode: 'FIXED' | 'AUTO'
    primaryAxisSizingMode: 'FIXED' | 'AUTO'
    primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
    counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
    counterAxisAlignContent: 'AUTO' | 'SPACE_BETWEEN'
    layoutGrow: number
    layoutPositioning: 'AUTO' | 'ABSOLUTE'
    itemReverseZIndex: boolean
    hyperlink: HyperlinkTarget | null
    mediaData: MediaData
    stokeTopWeight: number
    strokeTopWeight: number // 追加 (Figma Plugin APIのバグでstrokeTopWeightがstokeTopWeightになっているため)
    strokeBottomWeight: number
    strokeLeftWeight: number
    strokeRightWeight: number
    reactions: ReadonlyArray<Reaction>
    flowStartingPoints: ReadonlyArray<{ nodeId: string; name: string }>
    shapeType: string
    connectorStart: ConnectorEndpoint
    connectorEnd: ConnectorEndpoint
    connectorLineType: 'ELBOWED' | 'STRAIGHT'
    connectorStartStrokeCap: ConnectorStrokeCap
    connectorEndStrokeCap: ConnectorStrokeCap
    codeLanguage: string
    widgetSyncedState: { [key: string]: any }
    componentPropertyDefinitions: ComponentPropertyDefinitions
    componentPropertyReferences: { [key: string]: string }
    componentProperties: ComponentProperties
    embedData: EmbedData
    linkUnfurlData: LinkUnfurlData
    text: string
    authorVisible: boolean
    authorName: string
    code: string
    textBackground: LabelSublayerNode
  }

  type OverrideValuesMap = {
    [id: string]: {
      targetNode: SceneNode
      overriddenFields: {
        [K in keyof OverrideFieldMap]?: OverrideFieldMap[K]
      }
    }
  }
}

export {}
