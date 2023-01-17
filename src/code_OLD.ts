import { findIndex } from 'lodash'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// nodeの親が特定のタイプかどうかを返す再帰関数
// 親がpage or documentまで遡り、true or falseを返す
function getParentType(node: SceneNode, type: SceneNode['type']): boolean {
  if (!node.parent) {
    return false
  } else if (node.parent.type === type) {
    return true
  } else if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT') {
    return false
  } else {
    return getParentType(node.parent, type)
  }
}

if (figma.currentPage.selection.length) {
  // 処理後に選択を更新するので、それ用の配列を用意
  const newSelection: SceneNode[] = []

  // 選択している要素ごとに処理を実行
  figma.currentPage.selection.forEach(node => {
    console.log(node)

    // 親のnodeを取得
    const parentNode = node.parent as BaseNode & ChildrenMixin

    // parentNodeがインスタンスの場合
    if (parentNode.type === 'INSTANCE') {
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

      // newSelectionにnodeを追加
      newSelection.push(node)
    }
    // nodeがテキストの場合
    else if (node.type === 'TEXT') {
      // autoRenameをtrueにするだけで名前がリセットされる
      node.autoRename = true

      // newSelectionにnodeを追加
      newSelection.push(node)
    }
    // nodeがコンポーネントorVariantsの場合
    else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      // 名前をデフォルトに戻されると困るので、処理中断
      figma.notify('This element is component or variants.')
      return
    }
    // nodeがそれ以外の場合
    else {
      // 名前を空にするとリセットされる
      node.name = ''

      // // nodeをcloneする
      // const clonedNode = node.clone()

      // // nodeがインスタンスの場合→mainComponentの名前にする
      // if (node.type === 'INSTANCE') {
      //   // mainComponentを取得
      //   const mainComponent = node.mainComponent

      //   // mainComponentが無い場合は処理中断
      //   if (!mainComponent) {
      //     figma.notify('Main component not found.')
      //     return
      //   }

      //   // mainComponentのさらに親を取得
      //   const parentMainComponent = mainComponent.parent

      //   // parentMainComponentがCOMPONENT_SET、つまりVariantsの場合
      //   if (
      //     parentMainComponent &&
      //     parentMainComponent.type === 'COMPONENT_SET'
      //   ) {
      //     // clonedNodeの名前をparentMainComponentのものにする
      //     clonedNode.name = parentMainComponent.name
      //   }
      //   // それ以外（ただのコンポーネント）の場合
      //   else {
      //     // clonedNodeの名前をmainComponentのものにする
      //     clonedNode.name = mainComponent.name
      //   }
      // }
      // // それ以外の場合
      // else {
      //   // clonedNodeの名前を空にする→デフォルトの名前になる
      //   clonedNode.name = ''
      // }

      // // nodeのインデックスを取得
      // const index = findIndex(parentNode.children, child => {
      //   return child.id === node.id
      // })

      // // インデックスを元に、nodeの後にclonedNodeを移動
      // parentNode.insertChild(index + 1, clonedNode)

      // newSelectionにnodeを追加
      newSelection.push(node)

      // // nodeを削除
      // node.remove()
    }

    // 現在のselectionをnewSelectionsにする
    figma.currentPage.selection = newSelection

    figma.notify('Reset selected layers name!')
  })
} else {
  figma.notify('Please select at least one layer.')
}

// プラグインを終了
figma.closePlugin()
