#### Vue的事件机制

##### 初始化事件
```js
// src/core/instance/init.ts
// ...
initEvents
// ...


// src/core/instance/events.ts
export function initEvents(vm: Component) {
  //在vm上创建一个_events对象，用来存放事件。
  vm._events = Object.create(null)
  //是否存在钩子函数的标记， 如果存在是事件是以 hoot: 开头
  vm._hasHookEvent = false 
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```
可以看出来vue的事件都放在了 `vm._events`, vue事件相关的函数有, 详情在[实例方法/事件](https://v2.cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95-%E4%BA%8B%E4%BB%B6)
- $on
- $once
- $off
- $emit

事件相关的函数都在 `eventsMixin` 中添加到了Vue的原型对象上，在[入口核心流程](./vue%E5%85%A5%E5%8F%A3%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B.md)的表格里有
##### $on
```js
// src/core/instance/events.ts
export function eventsMixin(Vue: typeof Component) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (
    event: string | Array<string>,
    fn: Function
  ): Component {
    const vm: Component = this
    // 如果是数组的时候，则递归调用$on，为每一个元素都注册事件
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      // 每一个事件的回调函数都是一个数组  
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // 标记是否是钩子事件, 可以注册一个这样的事件 ,this.$on('mounted', fn)
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  //...
}
```


##### $once
```js
// src/core/instance/events.ts
export function eventsMixin(Vue: typeof Component) {

  //...

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on() {
      // 执行一次 销毁事件
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  //...
}
```


##### $off
```js
// src/core/instance/events.ts
export function eventsMixin(Vue: typeof Component) {

  //...
  
  Vue.prototype.$off = function (
    event?: string | Array<string>,
    fn?: Function
  ): Component {
    const vm: Component = this
    // all 不传参销毁是所有事件
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // 数组遍历销毁
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // 事件回调函数数组
    const cbs = vm._events[event!]
    // 不存在直接返回
    if (!cbs) {
      return vm
    }
    // 没有传入具体回调，删除所有回调
    if (!fn) {
      vm._events[event!] = null
      return vm
    }
    // 删除传入的具体回调
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  //...
}
```

##### $emit
```js
// src/core/instance/events.ts
export function eventsMixin(Vue: typeof Component) {

  //...

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    //...
    
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      // 遍历时间回调，逐个执行   
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }

  //...
}

// src/core/util/error.ts
export function invokeWithErrorHandling(
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res
  try {
    // 执行回调
    res = args ? handler.apply(context, args) : handler.call(context)
    if (res && !res._isVue && isPromise(res) && !(res as any)._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      ;(res as any)._handled = true
    }
  } catch (e: any) {
    handleError(e, vm, info)
  }
  return res
}
```

#### vue的生命周期函数

##### beforeCreate 和 created
```js
// src/core/instance/init.ts
Vue.prototype._init = function (options?: Record<string, any>) {
    // ...

    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    // ...
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
}
```
可以看出来 `beforeCreate` 和 `created` 是在 `$mount`之前执行的，同时 `beforeCreate` 是在 `initState` 之前执行的，
再说一次！`initState` 中的 `initData` 和 `initProps` 只有当 `Dep.target`(也就是watcher)存在的时候才会变为响应式的数据
<font color=red>watcher是在 `$mount` 里才创建的， 所以在这两个声明周期内数据并不是响应式的。</font>
vue文档里给出的响应式原理图，依赖收集是在渲染阶段触发的
![vue响应式原理](https://v2.cn.vuejs.org/images/data.png)

##### beforeMount 和 mounted
```js
export function mountComponent() {
    // ...
    callHook(vm, 'beforeMount')

    // ...
    vm._update(vm._render(), hydrating)

    // ...
    callHook(vm, 'mounted')
}
```


##### callHook 
钩子调用函数
```js
export function callHook(
  vm: Component,
  hook: string,
  args?: any[],
  setContext = true
) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const prev = currentInstance
  setContext && setCurrentInstance(vm)
  // data配置想中的声明周期函数
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  // 声明周期函数确实是个数组，但是多个同名的声明周期函数只执行最后一个，不明所以😈
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, args || null, vm, info)
    }
  }
  // 如果代码中注册过声明周期钩子事件, 因为在$on里面可以注册钩子事件， 举个🌰： this.$on('hook:mounted', fn)
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  setContext && setCurrentInstance(prev)
  popTarget()
}
```



