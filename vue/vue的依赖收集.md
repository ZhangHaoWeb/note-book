#### vue的依赖收集
##### 依赖收集在响应式中的穿插
思考一个问题,data中定义的所有属性都会作为依赖被收集吗？意思是data中的所有的属性都是响应式的吗？
其实不是的，vue是在第一次 render 的时候，只有视图中用到的属性，在 `Object.defineProperty` 的get中进行了依赖收集，
通过依赖收集类 `Dep` 来实现，还记得在响应式原理中最后提到的
- 在set中调用了 `dep.notify()`
- 在get中调用了 `dep.depend()`

依赖收集会有点绕，先回忆一下，在对data的每一个属性调用 `defineReactive`的时候，该函数的第一句就是, 大概流程是如下这样的
```js
export function defineReactive(){
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            dep.depend()
        }
        set() {
            dep.notify()
        }
    })
}
```
说明对于每一个data中的属性 都创建了一个依赖收集, 且在get和set中调用了相关的函数， 即 `dep.depend()` 和 `dep.notify()`

##### Dep类的实现
来看一下 `Dep`类的实现，
```js
// src/core/observer/dep.ts
export default class Dep {
  static target?: DepTarget | null
  id: number
  subs: Array<DepTarget | null>
  // pending subs cleanup
  _pending = false

  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }

  removeSub(sub: DepTarget) {
    // #12696 deps with massive amount of subscribers are extremely slow to
    // clean up in Chromium
    // to workaround this, we unset the sub for now, and clear them on
    // next scheduler flush.
    this.subs[this.subs.indexOf(sub)] = null
    if (!this._pending) {
      this._pending = true
      pendingCleanupDeps.push(this)
    }
  }

  depend(info?: DebuggerEventExtraInfo) {
    if (Dep.target) {
      Dep.target.addDep(this)
      if (__DEV__ && info && Dep.target.onTrack) {
        Dep.target.onTrack({
          effect: Dep.target,
          ...info
        })
      }
    }
  }

  notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.filter(s => s) as DepTarget[]
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      const sub = subs[i]
      if (__DEV__ && info) {
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info
          })
      }
      sub.update()
    }
  }
}

Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

##### Dep.target
在 `dep.depend` 进行依赖收集的时候, 会看到这个函数里在频繁的使用这个 `Dep.target`， 这玩意到底是个什么？😈
它是Dep类的一个静态成员变量，可以看到代码里`Dep.target = null`,还有一个 `targetStack = []` ,同时还提供了两个函数
- pushTarget
- popTarget

这里来分析第一次渲染的时候，回忆一下，我们一步一步来
1. 在 `initMixin`中给Vue原型上添加了 `_init`函数
2. 在 `src/platforms/web/runtime/index.ts` 中给Vue的原型上添加了 `$mount`函数
3. 在 `new Vue()` 时，调用 `_init` 函数
4. 在 `_init` 的最后调用了挂载函数 `vm.$mount(vm.$options.el)`
5. 在 `$mount` 函数调用了 `mountComponent`
6. 调用生命周期钩子 `callHook(vm, 'beforeMount')`
7. 在 `mountComponent` 中有 `new Watcher(...)`
...

好的，这里说到 `Watcher` 这个好兄弟！好兄弟！好兄弟！😒
```js
// src/core/instance/lifecycle.ts
new Watcher(
    vm,
    updateComponent,
    noop, //空函数
    watcherOptions,
    true /* isRenderWatcher */
)

// src/core/observer/watcher.ts
export default class Watcher implements DepTarget {
    ...
    constructor() {
        ...
        // 调用get
        this.value = this.lazy ? undefined : this.get()
    }
    get() {
        // 终于看见De相关的操作了是吧！！
        pushTarget(this)
    }
}
```
上面的代码说明什么？ 是不是说 `Dep.target` 其实就是 `Watcher` 的实例
当挂载的的时候创建了watcher，同时在 `computed`和`watch` 的时候调用了 `new Watcher`，这个时候就需要了 `targetStack`


##### dep.depend
好的 知道了 `Dep.target`，现在来看get中调用的 `dep.depend`
```js
// src/core/observer/dep.ts
depend(info?: DebuggerEventExtraInfo) {
    if (Dep.target) {
        // Watcher类的addDep方法
        Dep.target.addDep(this)
        if (__DEV__ && info && Dep.target.onTrack) {
            Dep.target.onTrack({
                effect: Dep.target,
                ...info
            })s
        }
    }
}

// src/core/observer/watcher.ts
addDep(dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        if (!this.depIds.has(id)) {
            // Dep类的addSub方法
            dep.addSub(this)
        }
    }
}

// src/core/observer/dep.ts
addSub(sub: DepTarget) {
    this.subs.push(sub)
}
```
主打的就是一个玩是吧, `Dep`和`Watcher`你俩有完没完了，调用过来调用过去是在做什么呢？？这其实是一个非常巧妙的设计

具体来说，addDep 是在观察者对象（Watcher）中调用的方法，用于添加依赖（Dep）对象。每个观察者对象会跟踪一组依赖，而每个依赖对象会管理一组观察者对象。当观察者对象发生变化时，会通知其所依赖的依赖对象，从而触发相应的更新。

addSub 是在依赖对象（Dep）中调用的方法，用于添加观察者对象（Watcher）。当依赖对象的状态发生变化时，它会遍历所有的观察者对象，并调用它们的更新方法。


##### dep.notify
理解了上面的之后，这个方法就好理解了，在data发生变更时，通知 Watcher 执行update操作
```js
// src/core/observer/dep.ts
notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.filter(s => s) as DepTarget[]
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      const sub = subs[i]
      if (__DEV__ && info) {
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info
          })
      }
      sub.update()
    }
}

// src/core/observer/watcher.ts
update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
}
run() {
    ...
    this.cb.call(this.vm, value, oldValue)
}
```