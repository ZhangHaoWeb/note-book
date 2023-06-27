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
```

##### dep.depend


##### dep.notify