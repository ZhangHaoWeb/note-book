#### vue的响应式原理
一说到vue的响应式原理，所有人能想到的一定是 [Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 使用该方法的 `set/get` 实现对像的属性监听

##### initMixin
在vue源码中, `initMixin(Vue)` 中调用了 `initState(vm)`
```js
// src/core/instance/init.ts
function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    ...

    //可以看出来在数据实现响应式之前和之后分别调用了 `beforeCreate` 和 `created` 生命周期钩子函数
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initState(vm)
    callHook(vm, 'created')

    ...

  }
}
```
##### initState
接着往 `initState` 看， 这里主要调用了几个函数，分别是
- initProps 
- initMethods
- initData
- initComputed
- initWatch
这几个初始化的参数都是从 `vm.$options` 中获取的，也就是vue在实际开发过程中用到的。

```js
//src/core/instance/state.ts
export function initState(vm: Component) {
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)

  // Composition API
  initSetup(vm)

  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    const ob = observe((vm._data = {}))
    ob && ob.vmCount++
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

##### initData
这里我们主要看的函数是 `initData`, 代码如下
```js
// src/core/instance/state.ts
function initData(vm: Component) {
  let data: any = vm.$options.data
  //平时写的vue组件代码data都是一个函数， 这里判断data如果是个函数就调用getData
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {}

  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length

  // 可以看出来data的属性不能与props中的重复，props优先级更高
  while (i--) {
    const key = keys[i]
    if (__DEV__) {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm)
      }
    }
    if (props && hasOwn(props, key)) {
      __DEV__ &&
        warn(
          `The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
          vm
        )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // data 的响应式处理  
  const ob = observe(data)
  ob && ob.vmCount++
}
```
上述代码代码中最核心的是调用了 `observe(data)`, 其实现了data的响应式处理

##### observe 函数
```js
// src/core/observer/index.ts
export function observe(
  value: any,
  shallow?: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
    ...

    return new Observer(value, shallow, ssrMockReactivity)

    ...
}
```
这里实例化 `Observer` 的时候只传入了一个参数value， 也就是之前 `observe(data)` 传入的data选项

##### Observer类

```js
// src/core/observer/index.ts
export class Observer {
  dep: Dep
  vmCount: number // number of vms that have this object as root $data

  constructor(public value: any, public shallow = false, public mock = false) {

    if (isArray(value)) {
        ... 

        // 判断data是不是数组，是数组的话递归调用 observe
        this.observeArray(value)
    } else {
        // 不是数组的话，对data中的每一个属性都调用函数 defineReactive
        // 传入的参数是(data, key, {}, undefined, false, falses)
        const keys = Object.keys(value)
        for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock)
      }
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(value: any[]) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.mock)
    }
  }
}
```
##### defineReactive
到这里我们会发现data中的每一个属性都会调用到这个 `defineReactive` 函数， 下面来看这个函数
```js
// src/core/observer/index.ts
export function defineReactive(
  obj: object,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean
) {
    ...

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                ...

                dep.depend()
                
            }
            return isRef(value) && !shallow ? value.value : value
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val
            
            if (setter) {
                setter.call(obj, newVal)
            } else if (getter) {
                // #7981: for accessor properties without setter
                return
            } else if (!shallow && isRef(value) && !isRef(newVal)) {
                value.value = newVal
                return
            } else {
                val = newVal
            }

            ...
            dep.notify()
        }
    })
}
```
可以看到上面对data的每个属性都调用了 `Object.defineProperty`, 在set中调用了 `dep.notify()`，在get中调用了 `dep.depend()` 这里牵扯到了vue的依赖收集,
接下来我们要看的就是vue的依赖收集

[vue的依赖收集](./vue%E7%9A%84%E4%BE%9D%E8%B5%96%E6%94%B6%E9%9B%86.md)


