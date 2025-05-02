declare global {
  /**
   * 処理結果を表す型
   *
   * 成功/失敗を明示的に表現し、エラーメッセージを含める
   * これにより、処理結果に基づいた適切なフィードバックをユーザーに提供できる
   */
  type Result = { success: true } | { success: false; error: string }

  /**
   * オーバーライド値を格納するマップ型
   *
   * インスタンスのオーバーライドをリセットする際に、
   * 名前以外のプロパティ値を保存・復元するために使用
   */
  type OverrideValuesMap = {
    [id: string]: {
      targetNode: SceneNode
      overriddenFields: {
        [field: string]: any
      }
    }
  }
}

export {}
