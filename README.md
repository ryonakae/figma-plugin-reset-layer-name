# Reset Layer Name Figma Plugin

![](./cover.png)

Resets the names of selected layers to their default values.  
This plugin supports **every type of element** you can select in Figma!

## 🔥 How to Use

1.  Select one or more layers.
2.  Run this plugin.
3.  Layer names will be reset!

## ✏️ Note: Behavior

The plugin's behavior varies depending on the selected element type:

### Component or Variants
The names of Components or Component Sets (Variants) will not be changed to preserve their original names.

### Instance or Child element of an Instance
The name override for the selected instance or child element is reset.  

- For an **Instance**: All overrides on the instance itself are reset, then all overrides except for the name are restored.
- For a **Child element of an Instance**: All overrides on the *parent* instance are reset, then all overrides except for the name are restored. This effectively resets the name override inherited by the child element.

*Note: Due to Figma API limitations, OpenType features on TextNodes within the instance (or parent instance) cannot be restored during this process.*

### Other Element Types
The names of other elements (like Text, Rectangle, Frame, Group, etc.) will be reset to an empty string.

## 📮 Support

If you encounter any problems or have feedback, please use the [GitHub Issues](https://github.com/ryonakae/figma-plugin-reset-layer-name/issues).

---

This plugin is made by Ryo Nakae 🙎‍♂️.

- https://brdr.jp
- https://x.com/ryo_dg
- https://github.com/ryonakae
