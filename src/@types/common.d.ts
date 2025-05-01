declare global {
  type Result = { success: true } | { success: false; error: string }

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
