import resetInstanceChild from '@/resetInstanceChild'
import { getAncestorInstances } from '@/util'

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

// メッセージ集
const messages = {
  error: {
    componentsOrVariants: 'This element is component or variants.',
    noSelection: 'Please select at least one layer.',
    common: 'Something went wrong.',
    alreadyReset: 'Layer names have already been reset.',
  },
  success: 'Reset selected layers name!',
}

// メイン関数
async function main() {
  // 1つも選択されていない場合は処理中断
  if (!figma.currentPage.selection.length) {
    figma.notify(messages.error.noSelection)
    figma.closePlugin()
    return
  }

  // 処理結果を追跡するためのカウンター
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  // 選択している要素ごとに処理を実行
  await Promise.all(
    figma.currentPage.selection.map(async node => {
      console.log(node)

      // nodeがコンポーネント or Variantsの場合
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        // 名前をデフォルトに戻されると困るので、処理中断
        console.warn(messages.error.componentsOrVariants)
        errors.push(messages.error.componentsOrVariants)
        errorCount++
        return
      }

      // nodeがそれ以外の場合
      // 先祖インスタンスを取得
      const ancestorInstances = getAncestorInstances(node)
      console.log('ancestorInstances', ancestorInstances)

      // 先祖インスタンスがある場合（nodeはインスタンスの子要素）
      // resetInstanceChildを実行
      if (ancestorInstances.length > 0) {
        const result = await resetInstanceChild(node)
        if (result.success) {
          successCount++
        } else {
          errorCount++
          errors.push(result.error || 'Failed to reset instance child')
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
            console.warn(messages.error.common)
            errors.push(messages.error.common)
            errorCount++
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
  console.log('errorCount', errorCount)
  console.log('errors', errors)

  // 成功メッセージ
  const successMessage = `Reset ${successCount} layer${successCount > 1 ? 's' : ''} name!`
  // エラーメッセージ
  const errorMessage = `${errorCount} layer${errorCount > 1 ? 's' : ''} had errors.`

  // 1つも処理できず、エラーのみの場合
  if (successCount === 0 && errorCount > 0) {
    // エラーが1つだけの場合
    if (errors.length === 1) {
      figma.notify(errors[0], {
        // error: true,
      })
    }
    // エラーが複数ある場合
    else {
      figma.notify(errorMessage, {
        // error: true,
      })
    }
  }
  // 少なくとも1つは成功した場合
  else if (successCount > 0) {
    // 成功とエラーの両方がある場合
    if (errorCount > 0) {
      figma.notify(successMessage)
      figma.notify(errorMessage, {
        // error: true,
      })
    }
    // 成功のみの場合
    else {
      figma.notify(successMessage)
    }
  }

  // プラグインを終了
  figma.closePlugin()
}

// メイン関数の実行
main()
