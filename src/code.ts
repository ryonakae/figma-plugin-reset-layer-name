import resetInstanceChild from '@/resetInstanceChild'
import { getAncestorInstances } from '@/util'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// メイン関数
async function main() {
  // 1つも選択されていない場合は処理中断
  if (!figma.currentPage.selection.length) {
    figma.notify('Please select at least one layer.')
    figma.closePlugin()
    return
  }

  // 処理結果を追跡するためのカウンター
  let successCount = 0

  // 選択している要素ごとに処理を実行
  await Promise.all(
    figma.currentPage.selection.map(async node => {
      console.log(node)

      // nodeがコンポーネント or Variantsの場合
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        // 名前をデフォルトに戻されると困るので、処理中断
        console.warn('This element is component or variants.')
        return
      }

      // nodeがそれ以外の場合
      // 先祖インスタンスを取得
      const ancestorInstances = getAncestorInstances(node)
      console.log('ancestorInstances', ancestorInstances)

      // 先祖インスタンスがある場合（nodeはインスタンスの子要素）
      // resetInstanceChildを実行
      if (ancestorInstances.length > 0) {
        const result = await resetInstanceChild(node, ancestorInstances[0])
        if (result.success) {
          successCount++
        }
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
            console.warn('Something went wrong.')
            return
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
          successCount++
        }
        // それ以外の場合
        else {
          // 名前を空にする（リセットされる）
          node.name = ''
          successCount++
        }
      }
    }),
  )

  // 処理結果に基づいて通知を表示
  console.log('successCount', successCount)

  // successCountが0の場合
  if (successCount === 0) {
    figma.notify('No layers name were reset.')
  }
  // successCountが1以上の場合
  else {
    figma.notify(
      `Reset ${successCount} layer${successCount > 1 ? 's' : ''} name!`,
    )
  }

  // プラグインを終了
  figma.closePlugin()
}

// メイン関数の実行
main()
