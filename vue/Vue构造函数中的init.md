##### Vue构造函数中的init
```js
import { initMixin } from './init'
....

function Vue(options) {
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

//@ts-expect-error Vue has function type
initMixin(Vue)
...
```
如上截取了一小段代码，在声明Vue构造函数后执行了 `initMixin(Vue)`， 参数是Vue构造函数， 看一下 `initMixin` 中做了什么,
省略了一些代码
```js
export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    const vm: Component = this

    ...

    // 1.合并配置项
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options as any)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (__DEV__) {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化生命周期
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    // 调用 beforeCreate
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
     // 调用 created
    callHook(vm, 'created')

    ...

    // 挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```
可以看出来 `initMixin` 在Vue的原型上创建了一个 `_init` 函数，也就说Vue实例后执行的就是这个 `_init` 函数


1. 当使用Vue.component方法注册全局组件或在components选项中注册局部组件时，Vue会将组件选项对象进行一系列处理，并在处理过程中给对象添加_isComponent属性。
