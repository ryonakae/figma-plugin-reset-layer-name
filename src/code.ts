import {
  getAncestorInstances,
  getIndexStructureInInstance,
  getNodeInComponentByIndexStructure,
} from '@/util'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// メッセージ集
const messages = {
  componentsOrVariants: 'This element is component or variants.',
  noSelection: 'Please select at least one layer.',
  success: 'Reset selected layers name!',
  error: {
    common: 'Something went wrong.',
    alreadyReset: 'Layer names have already been reset.',
  },
}

if (figma.currentPage.selection.length) {
  // 選択している要素ごとに処理を実行
  figma.currentPage.selection.forEach(async node => {
    console.log(node)

    // nodeがコンポーネント or Variantsの場合
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      // 名前をデフォルトに戻されると困るので、処理中断
      figma.notify(messages.componentsOrVariants)
      return
    }

    // nodeがそれ以外の場合
    // 先祖インスタンスを取得
    const ancestorInstances = getAncestorInstances(node)
    console.log('ancestorInstances', ancestorInstances)

    // 先祖インスタンスがある場合（nodeはインスタンスの子要素）
    if (ancestorInstances.length > 0) {
      console.log('ancestorInstances exist')

      // 先祖インスタンスのメインコンポーネントを取得する
      const mainComponentOfRootAncestorInstance =
        ancestorInstances[0].mainComponent
      console.log(
        'mainComponentOfRootAncestorInstance',
        mainComponentOfRootAncestorInstance,
        mainComponentOfRootAncestorInstance?.name,
        mainComponentOfRootAncestorInstance?.remote,
      )

      // メインコンポーネントが無い場合は処理中断
      if (!mainComponentOfRootAncestorInstance) {
        return figma.notify(messages.error.common)
      }

      // nodeのインデックス構造を取得する
      const indexStructure = getIndexStructureInInstance(node)
      console.log('indexStructure', indexStructure)

      // 取得したインデックス構造から、先祖インスタンスのメインコンポーネント内の、
      // nodeと同じ要素を取得する
      const sameNode = getNodeInComponentByIndexStructure(
        mainComponentOfRootAncestorInstance,
        indexStructure,
      )
      console.log('sameNode', sameNode)

      // 同じ要素が無い場合は処理中断
      if (!sameNode) {
        return figma.notify(messages.error.common)
      }

      // nodeの名前がsameNodeの名前とすでに同じ場合
      if (node.name === sameNode.name) {
        return figma.notify(messages.error.alreadyReset)
      }
      // 違う場合→リネーム
      node.name = sameNode.name
    }

    // 先祖インスタンスがない場合
    else {
      console.log('no ancestorInstances')

      // nodeがインスタンスの場合
      if (node.type === 'INSTANCE') {
        // メインコンポーネントを取得
        const mainComponent = node.mainComponent

        // メインコンポーネントが無い場合は処理中断
        if (!mainComponent) {
          return figma.notify(messages.error.common)
        }

        // メインコンポーネントの親がvariantsの場合→nodeをvariantsの名前にする
        if (
          mainComponent.parent &&
          mainComponent.parent.type === 'COMPONENT_SET'
        ) {
          node.name = mainComponent.parent.name
        }
        // それ以外の場合→nodeをメインコンポーネントの名前にする
        else {
          node.name = mainComponent.name
        }
      }
      // それ以外の場合
      else {
        // 名前を空にする（リセットされる）
        node.name = ''
      }
    }

    figma.notify(messages.success)
  })
} else {
  figma.notify(messages.noSelection)
}

// プラグインを終了
figma.closePlugin()
