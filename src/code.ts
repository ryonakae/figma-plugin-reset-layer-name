import resetInstance from '@/resetInstance'
import { getAncestorInstances, handleError } from '@/util'

/**
 * Figmaのレイヤー名をデフォルト値にリセットするプラグイン
 *
 * 挙動：
 * - コンポーネント/バリアントは名前を変更せず保持
 * - インスタンスはメインコンポーネントの名前に変更
 * - インスタンスの子要素はメインコンポーネントの同じ子要素の名前に変更
 * - その他の要素は空の名前（リセット状態）に変更
 *
 * このファイルはプラグインのエントリーポイントとして機能し、
 * ユーザーが選択した各レイヤーに対して適切な処理を実行します。
 */

// find系の高速化
// figma.skipInvisibleInstanceChildren = true

/**
 * プラグインのメイン処理を実行する関数
 * - 選択されたノードを分析し、適切なリセット処理を実行
 * - 結果に基づいてユーザーに通知を表示
 */
async function main() {
  // 1つも選択されていない場合は処理中断
  // 実行前に必ず選択状態をチェックして、ユーザーに通知する
  if (!figma.currentPage.selection.length) {
    figma.notify('Please select at least one layer')
    figma.closePlugin()
    return
  }

  // 処理結果を追跡するためのカウンター
  let successCount = 0
  const errors: string[] = []

  // 選択している要素ごとに処理を実行
  for (const node of figma.currentPage.selection) {
    console.log(node)

    // nodeがTextNodeでautoRenameがtrueの場合は処理をスキップ
    // autoRename=trueのテキストは既に自動的に名前が設定されているため、
    // 手動でリセットする必要がない
    if (node.type === 'TEXT' && node.autoRename) {
      handleError('Name has already been reset', errors)
      continue
    }

    // nodeがコンポーネント or Variantsの場合
    // コンポーネントとバリアントは名前を保持する必要があるため、
    // 処理をスキップして警告を表示する
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      // 名前をデフォルトに戻されると困るので、処理中断
      handleError('This element is component or variants', errors)
      continue
    }

    // nodeがそれ以外の場合
    // 先祖インスタンスを取得
    // インスタンス内の要素とそれ以外の要素で処理を分ける必要があるため
    const ancestorInstances = getAncestorInstances(node)
    console.log('ancestorInstances', ancestorInstances)

    // 先祖インスタンスがある場合（nodeはインスタンスの子要素）
    // インスタンス内の要素はコンポーネントの対応する要素から名前を取得するため、
    // resetInstance関数を使用して適切に処理する
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
      // インスタンス自体はコンポーネントの名前を取得するため、
      // 自分自身をparentInstanceとしてresetInstanceを実行
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
      // インスタンスでもコンポーネントでもない通常の要素は単に名前を空にする
      else {
        // 名前を空にする（リセットされる）
        node.name = ''
        successCount++
      }
    }
  }

  // 処理結果に基づいて通知を表示
  // 成功数に応じて適切なメッセージを選択し、ユーザーに通知する
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
