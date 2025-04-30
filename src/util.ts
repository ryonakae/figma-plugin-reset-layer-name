import { findIndex, times } from 'lodash'

// nodeのidから先祖インスタンスの配列を返す関数
// 自分は含まない
export function getAncestorInstances(node: SceneNode) {
  const instanceArray: InstanceNode[] = []

  // idをセミコロンで区切って配列にしたもの
  const idArray = node.id.split(';')

  idArray.forEach((id, i) => {
    if (i === idArray.length - 1) {
      return
    }

    // indexに応じてidを加工
    let targetId = ''
    if (i === 0) {
      targetId = idArray[i]
    } else {
      const arr: string[] = []
      times(i + 1).forEach(j => arr.push(idArray[j]))
      targetId = arr.join(';')
    }

    // 加工したidを元にインスタンスを検索
    const instance = figma.getNodeById(targetId) as InstanceNode

    instanceArray.push(instance)
  })

  return instanceArray
}

// 一番先祖のインスタンスまで遡って各階層のインデックスを取得する再帰関数
function getIndexArray(
  node: SceneNode,
  rootAncestorInstance: InstanceNode,
  array: number[],
): number[] {
  if (node.parent) {
    const index = findIndex(node.parent.children, child => {
      return child.id === node.id
    })

    // インデックスを配列の先頭に追加する
    array.splice(0, 0, index)

    // 親要素のidがrootAncestorInstanceと同じ場合、再帰を終了
    if (node.parent.id === rootAncestorInstance.id) {
      return array
    }

    return getIndexArray(node.parent as SceneNode, rootAncestorInstance, array)
  }

  return array
}

// nodeの、インスタンス内でのインデックス構造を返す関数
export function getIndexStructureInInstance(node: SceneNode) {
  // idをセミコロンで区切って配列にしたもの
  const idArray = node.id.split(';')

  // idArrayのlenghが1→先祖にインスタンスが無いので、空配列を返す
  if (idArray.length === 1) {
    return []
  }

  // idArrayの0番目（一番先祖）の要素を取得
  const rootAncestorInstance = figma.getNodeById(idArray[0]) as InstanceNode

  // インデックスを入れる配列を用意して、各階層でのインデックスを配列に入れる
  let indexArray: number[] = []
  indexArray = getIndexArray(node, rootAncestorInstance, indexArray)

  // 配列を返して終了
  return indexArray
}

// インデックス構造を元に子要素を取得する再帰関数
function getChildNode(
  node:
    | ComponentNode
    | InstanceNode
    | GroupNode
    | FrameNode
    | BooleanOperationNode,
  indexStructure: number[],
  loopCount: number,
): SceneNode {
  // インデックスを取得
  const index = indexStructure[loopCount] as number | undefined

  // ループしすぎてindexが無い場合、nodeを返して再帰終了
  if (index === undefined) {
    return node
  }

  // インデックスを元に子要素を取得
  const childNode = node.children[index] as SceneNode | null

  // 子要素が無い場合、nodeを返して再帰終了
  if (!childNode) {
    return node
  }

  // 子要素がある場合
  // 子要素の種類がchildrenを持つタイプのNodeの場合、更に子要素を取得
  if (
    childNode.type === 'INSTANCE' ||
    childNode.type === 'GROUP' ||
    childNode.type === 'FRAME' ||
    childNode.type === 'BOOLEAN_OPERATION'
  ) {
    return getChildNode(childNode, indexStructure, loopCount + 1)
  }

  // それ以外のタイプの場合→childNodeを返して再帰終了
  return childNode
}

// インデックス構造をコンポーネント内の要素を取得する
export function getNodeInComponentByIndexStructure(
  node: ComponentNode,
  indexStructure: number[],
) {
  const loopCount = 0
  const childNode = getChildNode(node, indexStructure, loopCount)
  return childNode
}

export function handleError(message: string, errors: string[]) {
  console.warn(message)
  errors.push(message)
  return {
    success: false,
    error: message,
  }
}
