import { findIndex } from 'lodash'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// nodeの先祖が特定のタイプかどうかを返す再帰関数
// page or documentまで遡り、先祖node or undefinedを返す
function getAncestorNodeByType(
  node: SceneNode,
  type: SceneNode['type']
): SceneNode | undefined {
  if (!node.parent) {
    return undefined
  } else if (node.parent.type === type) {
    return node.parent
  } else if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT') {
    return undefined
  } else {
    return getAncestorNodeByType(node.parent, type)
  }
}

if (figma.currentPage.selection.length) {
  // 選択している要素ごとに処理を実行
  figma.currentPage.selection.forEach(node => {
    console.log(node)

    // nodeの先祖がComponentの場合
    if (getAncestorNodeByType(node, 'COMPONENT')) {
      console.log(node.id, getAncestorNodeByType(node, 'COMPONENT')?.id)
    }
    // nodeの先祖がインスタンスの場合
    // 無理やり元の名前にリネームしているだけで、overrideをリセットしているわけではない
    // (reset overrideできるAPIが現時点では無い)
    else if (getAncestorNodeByType(node, 'INSTANCE')) {
      // 親nodeを取得
      const parentNode = node.parent as InstanceNode

      // インスタンスのmainComponentを取得
      const mainComponent = parentNode.mainComponent

      // mainComponentが無い場合は処理中断
      if (!mainComponent) {
        figma.notify('Main component not found.')
        return
      }

      // インスタンスのchildrenでのnodeのインデックスを取得
      const index = findIndex(parentNode.children, child => {
        return child.id === node.id
      })

      // nodeの名前をmainComponentにある要素と同じ名前にする
      node.name = mainComponent.children[index].name
    }
    // nodeがインスタンスの場合
    else if (node.type === 'INSTANCE') {
      // インスタンスのmainComponentを取得
      const mainComponent = node.mainComponent

      // mainComponentが無い場合は処理中断
      if (!mainComponent) {
        figma.notify('Main component not found.')
        return
      }

      // mainComponentの親を取得
      const parentMainComponent = mainComponent.parent as SceneNode

      // mainComponentの親がVariantsの場合
      if (parentMainComponent.type === 'COMPONENT_SET') {
        // nodeの名前をVariantsの名前にする
        node.name = parentMainComponent.name
      }
      // それ以外の場合（普通のコンポーネントの場合）
      else {
        // nodeの名前をmainComponentの名前にする
        node.name = mainComponent.name
      }
    }
    // nodeがコンポーネント or Variantsの場合
    else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      // 名前をデフォルトに戻されると困るので、処理中断
      figma.notify('This element is component or variants.')
      return
    }
    // nodeがそれ以外の場合
    else {
      // 名前を空にするとリセットされる
      node.name = ''
    }

    figma.notify('Reset selected layers name!')
  })
} else {
  figma.notify('Please select at least one layer.')
}

// プラグインを終了
figma.closePlugin()
