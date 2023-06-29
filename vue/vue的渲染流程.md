#### vue的$mount
众所周知，vue在$mount中对组件进行了渲染，也就是调用了 `vm._render`, 这个 `_render` 是从哪里来的？

```js
// src/platforms/web/runtime/index.ts
Vue.prototype.$mount = function (el, hydrating){
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
export default Vue

// src/platforms/web/runtime-with-compiler.ts
import Vue from './runtime/index'
// 覆盖原先的 $mount， 暂存到mount变量 😈😈😈
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function () {
  const options = this.$options

  if (!options.render) {
    let template = options.template
    // 判断配置项里是否有 template选项
    if (template) {
      
    } else if (el) {
      // 如果有el选项，获取其html作为template
      // @ts-expect-error
      template = getOuterHTML(el)
    }
    if (template) {
      // ...
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: __DEV__,
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      // options上添加render函数！！！！
      options.render = render
      options.staticRenderFns = staticRenderFns

      // ...
    }
  }
  // 执行 mountComponent
  return mount.call(this, el, hydrating)
}
```
上面两段代码，可以看出来先在Vue的原型上添加了 `$mount`, 赋值给了 `mount` 变量，又覆盖了 `$mount`， 在里面执行了暂存的 `mount`
那么好！那么好！那么好！😈  让我们发小了 在 `$mount` 里面，给vue实例的 `$options` 上添加了两个属性
- options.render = render
- options.staticRenderFns = staticRenderFns

#### $mount中的 mountComponent
当vue的实例的$options上有了 `rennder`, 又调用了 `mountComponent`,在里面执行了 `vm._render()`
```js
// src/core/instance/lifecycle.ts
function mountComponent(vm, el) {
  // 这个时候vm._render已经存在了
  //...

  // 创建渲染 watcher
  const updateComponent = () => {
    // 渲染逻辑
    vm._update(vm._render(), hydrating);
  };

  // 实例化渲染 watcher
  new Watcher(vm, updateComponent, noop, {
    before() {
      // ...一些 before 钩子的处理逻辑
    }
  });

  // 调用 beforeMount 钩子函数
  callHook(vm, 'beforeMount');

  // 执行组件的初始化渲染和后续更新
  vm._update(vm._render());

  // 调用 mounted 钩子函数
  callHook(vm, 'mounted');
}
```

#### vue渲染函数 _render
`renderMixin`中的渲染函数，为Vue的原型上添加了 `_render`方法， 里面从 `$options` 中提取了 `render`，并且执行了， 得到了`vnode`
```js
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options
  // ...

  // vm._renderProxy = vm 在_init函数中
  vnode = render.call(vm._renderProxy, vm.$createElement)
  vnode.parent = _parentVnode
  return vnode
}
```

真棒！🎉🎉🎉  是不是思路开始清晰了！ 想一想执行流程是什么样的
``` js
1. new Vue()的最后调用了 `$mount`
2. `$mount` 给当前实例添加了 `vm.$options.render`
3. 执行 `mountComponent`
4. 执行 `vm._render()`, 其在 `mixin` 阶段就被添加到了Vue原型上
5. 其内部执行 `vm.$options.render`
```
来回答一开始的问题 `_render`是哪来的? 上面的代码段里其实有的嘛~
```js
// src/platforms/web/runtime-with-compiler.ts
let template = options.template
// template存在的时候取template，不存在的时候取el的outerHTML
if (template) {
  // ...
} else if (el) {
  // @ts-expect-error
  template = getOuterHTML(el)
}

// 将template编译成render函数，这里会有render以及staticRenderFns两个返回，这是vue的编译时优化，static静态不需要在VNode更新时进行patch，优化性能
const { render, staticRenderFns } = compileToFunctions(
  template,
  {
    outputSourceRange: __DEV__,
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
  },
  this
)
options.render = render
options.staticRenderFns = staticRenderFns
```
`$mount` 将template进行 `compileToFunctions` 得到 `render` 以及 `staticRenderFns`, 且赋值到当前实例的 `$options`

<font color=red>这里牵扯出了两个东西 `template` 和 `compileToFunctions`</font>
[vue的 template 和 compileToFunctions](./vue%E7%9A%84template%E5%92%8CcompileToFunctions.md)



