# Reset Layer Name Figma Plugin

![](./cover.png)

Reset names of selected layers to default.  
You can reset names of EVERY element!  
Text, frames, groups, rectangles, instance, etc.

## 🔥 How to use

1. Select one or more layers.
2. Run this plugin.
3. Enjoy🤟

## ✏️ Note: Behavior

This plugin behaves differently depending on the type of element selected.

(Component or variants)  
This plugin will not rename and keep the original name of the component or variants.

(Instance)  
This plugin renames the element to the name of the main component.

(Child element of instance)  
This plugin renames element to the name of the same child element of the main component.  
Note: Due to limitations of the plugin API, it is not resetting the override. It just renames to the same name.

(Other types of elements)  
This plugin renames the element to empty. That is, it resets it.

## 📮 Support

If you have any plobrem or feedback, please use the [GitHub Issues](https://github.com/ryonakae/figma-plugin-reset-layer-name/issues).

---

This plugin is made by Ryo Nakae 🙎‍♂️.

- https://brdr.jp
- https://twitter.com/ryo_dg
- https://github.com/ryonakae
