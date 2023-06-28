##### 核心代码
通过编译流程可以发现 `Vue` 是在 `src/core/index.ts`在导出的，导入Vue后执行了 `initGlobalAPI`(先记下来)，代码如下

```js
// 发现Vue在 ./instance/index 中导出
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'
import { version } from 'v3'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = version

export default Vue
```

##### Vue构造函数和instance目录
进入 `src/core/instance/index.ts` 中查看
```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'

function Vue(options) {
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

//@ts-expect-error Vue has function type
initMixin(Vue)
//@ts-expect-error Vue has function type
stateMixin(Vue)
//@ts-expect-error Vue has function type
eventsMixin(Vue)
//@ts-expect-error Vue has function type
lifecycleMixin(Vue)
//@ts-expect-error Vue has function type
renderMixin(Vue)

export default Vue as unknown as GlobalAPI
```
看这段代码，有 `Vue` 的构造函数，依次调用了 initMixin、stateMixin、eventsMixin、lifecycleMixin、renderMixin
这些 `mixin` 主要是在 `Vue` 的原型上添加了一些函数

|minxin         |函数                              |说明                        |
|---------------|---------------------------------|----------------------------|
|initMixin      |_init                            |初始化函数，在 Vue 构造函数中调用|
|stateMixin     |\$set、\$delete、$watch           |...                         |
|eventsMixin    |\$on、\$once、\$off、$emit         |...                         |
|lifecycleMixin |_update、\$forceUpdate、$destroy  |...                         |
|renderMixin    |\$nextTick、_render               |...                         |




当用new Vue()实例化的时候， 调用了 `this._init(options)`， `_init` 函数在哪里定义的呢？通过上面的表格可以看出来在 `initMixin` 中定义的 `_init`

[Vue构造函数中的init](./Vue%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0%E4%B8%AD%E7%9A%84init.md)


mountComponent
callHook(vm, 'beforeMount')
vm.$emit('hook:' + hook)