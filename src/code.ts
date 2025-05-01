import resetInstance from '@/resetInstance'
import { getAncestorInstances, handleError } from '@/util'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// メイン関数
async function main() {
  // 1つも選択されていない場合は処理中断
  if (!figma.currentPage.selection.length) {
    figma.notify('Please select at least one layer')
    figma.closePlugin()
    return
  }

  // 処理結果を追跡するためのカウンター
  let successCount = 0
  const errors: string[] = []

  // 選択している要素ごとに処理を実行
  await Promise.all(
    figma.currentPage.selection.map(async node => {
      console.log(node)

      // nodeがコンポーネント or Variantsの場合
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        // 名前をデフォルトに戻されると困るので、処理中断
        handleError('This element is component or variants', errors)
        return
      }

      // nodeがそれ以外の場合
      // 先祖インスタンスを取得
      const ancestorInstances = getAncestorInstances(node)
      console.log('ancestorInstances', ancestorInstances)

      // 先祖インスタンスがある場合（nodeはインスタンスの子要素）
      if (ancestorInstances.length > 0) {
        // resetInstanceを実行 (parentInstanceはancestorInstancesの最後の要素)
        const result = await resetInstance(
          node,
          ancestorInstances[ancestorInstances.length - 1],
        )
        if (result.success) {
          successCount++
        } else {
          console.warn(result.error)
          errors.push(result.error)
        }
      }

      // 先祖インスタンスがない場合
      else {
        console.log('no ancestorInstances')

        // nodeがインスタンスの場合
        if (node.type === 'INSTANCE') {
          // resetInstanceを実行 (parentInstanceはnode自身)
          const result = await resetInstance(node, node)
          if (result.success) {
            successCount++
          } else {
            console.warn(result.error)
            errors.push(result.error)
          }
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
    // errorsが1つだけの場合はそのエラーメッセージを表示
    if (errors.length === 1) {
      figma.notify(errors[0])
    }
    // errorsが複数ある場合は、汎用的なエラーメッセージを表示
    else {
      figma.notify('No layer names were reset')
    }
  }
  // successCountが1以上の場合
  else {
    figma.notify(
      `Reset ${successCount} layer ${successCount > 1 ? 'names' : 'name'}!`,
    )
  }

  // プラグインを終了
  figma.closePlugin()
}

// メイン関数の実行
main()
