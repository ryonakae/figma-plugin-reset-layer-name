import { findIndex, times } from 'es-toolkit/compat'

/**
 * nodeのidから先祖インスタンスの配列を返す関数
 *
 * Figmaではインスタンス内の要素のIDは「;」で区切られた階層構造を持っている。
 * 例：12:34;56:78;90:12
 * この形式を利用して先祖のインスタンスを特定する。
 *
 * @param node - 対象となるノード
 * @returns 先祖のインスタンスノードの配列（浅い階層から深い階層の順）
 */
export function getAncestorInstances(node: SceneNode) {
  const instanceArray: InstanceNode[] = []

  // idをセミコロンで区切って配列にしたもの
  const idArray = node.id.split(';')

  idArray.forEach((id, i) => {
    // 最後の要素は自分自身なのでスキップ
    if (i === idArray.length - 1) {
      return
    }

    // indexに応じてidを加工
    // 階層ごとにIDを再構築して、該当するインスタンスを取得
    let targetId = ''
    if (i === 0) {
      targetId = idArray[i]
    } else {
      const arr: string[] = []
      times(i + 1).map(j => arr.push(idArray[j]))
      targetId = arr.join(';')
    }

    // 加工したidを元にインスタンスを検索
    const instance = figma.getNodeById(targetId) as InstanceNode

    instanceArray.push(instance)
  })

  return instanceArray
}

/**
 * 一番先祖のインスタンスまで遡って各階層のインデックスを取得する再帰関数
 *
 * Figmaのインスタンス内要素を特定するには、各階層での親要素内でのインデックス位置が必要
 * この関数は指定されたノードから親をたどり、各階層でのインデックスを配列に記録する
 *
 * @param node - インデックスを取得する対象のノード
 * @param rootAncestorInstance - 遡る対象の最上位インスタンス
 * @param array - インデックスを格納する配列（再帰呼び出しで更新される）
 * @returns 各階層でのインデックスを格納した配列
 */
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

/**
 * ノードのインスタンス内でのインデックス構造を返す関数
 *
 * インスタンス内の特定の要素を参照するために必要なインデックスパスを計算する
 * これにより、コンポーネント内の対応する要素を正確に特定することが可能になる
 *
 * @param node - インデックス構造を取得する対象のノード
 * @returns インデックス構造を表す数値配列（インスタンス内でない場合は空配列）
 */
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

/**
 * インデックス構造を元に子要素を取得する再帰関数
 *
 * インデックス構造（階層ごとのインデックス値の配列）を使用して、
 * 特定のノード内の子孫要素を取得する
 *
 * @param node - 探索を開始するノード
 * @param indexStructure - 探索に使用するインデックス構造
 * @param loopCount - 現在の再帰深度（インデックス構造の何番目を参照するか）
 * @returns 指定されたインデックス構造に対応する子孫ノード
 */
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

/**
 * インデックス構造を用いてコンポーネント内の指定要素を取得する
 *
 * インスタンスとコンポーネントは構造が対応しているため、
 * インスタンス内の要素と同じインデックス構造を持つコンポーネント内の要素を特定できる
 * この機能はレイヤー名のリセット処理で、コンポーネント内の元の名前を取得するために使用される
 *
 * @param node - 探索対象のコンポーネント
 * @param indexStructure - 探索に使用するインデックス構造
 * @returns 指定されたインデックス構造に対応するコンポーネント内のノード
 */
export function getNodeInComponentByIndexStructure(
  node: ComponentNode,
  indexStructure: number[],
) {
  const loopCount = 0
  const childNode = getChildNode(node, indexStructure, loopCount)
  return childNode
}

/**
 * エラーを一貫した方法で処理するヘルパー関数
 *
 * エラーメッセージをコンソールに出力し、エラー配列に追加するとともに、
 * 処理結果を表すResultオブジェクトを返す
 *
 * @param message - エラーメッセージ
 * @param errors - エラーメッセージを追加する配列
 * @returns {success: false, error: message}形式のResultオブジェクト
 */
export function handleError(message: string, errors: string[]) {
  console.warn(message)
  errors.push(message)
  return {
    success: false,
    error: message,
  }
}
