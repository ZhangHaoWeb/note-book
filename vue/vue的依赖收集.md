#### vue的依赖收集
##### 依赖收集在响应式中的穿插
思考一个问题,data中定义的所有属性都会作为依赖被收集吗？意思是data中的所有的属性都是响应式的吗？
其实不是的，vue是在第一次 render 的时候，只有视图中用到的属性，在 `Object.defineProperty` 的get中进行了依赖收集，
通过依赖收集类 `Dep` 来实现，还记得在响应式原理中最后提到的
- 在set中调用了 `dep.notify()`
- 在get中调用了 `dep.depend()`

依赖收集会有点绕，先回忆一下，在对data的每一个属性调用 `defineReactive`的时候，该函数的第一句就是, 大概流程是如下这样的
```js
// src/core/observer/index.ts
// Observer类构造函数中的一段代码,value是data对象，遍历每一个属性调用 defineReactive
const keys = Object.keys(value)
for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock)
}

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

##### 总结
顺着代码我们了解到了vue如何做的依赖收集，再来整体捋一下流程
```bash
# 响应式流程
1. data的每一个属性都调用了`defineReactive`，函数内又使用 `Object.defineProperty` 来监听属性的get/set
2. 同时在 `defineReactive` 内创建了dep， `const dep = new Dep()`
3. 对每一个属性的get调用了 `dep.depend()`, set调用了 `dep.notify()`
```

那么好~  是不是说只有在get的时候做了依赖收集，也就是只有视图有用到的数据，并不是整个data，试想一下data里定义了但是视图没有用的呢

再看来这个 `dep.depend()` ， 里面有个判断是 `if (Dep.target) {}`, 否则不会做依赖收集， `Dep.target`是什么？
上面其实详细的分析了，挑重点再说一次，挑重点再说一次，挑重点再说一次！

```bash
# Dep和Watcher
1. new Vue() 调用了 _init初始化函数
2、_init 在最后调用了 $mount 挂载函数，该函数是在所有的 mixin 和 initGlobalAPI 后面在Vue原型上添加的挂载函数
3. $mount 调用 mountComponent函数
4. mountComponent 函数内部有 new Watcher， Watcher类在构造函数最后调用了自身的 get方法
5. get方法的第一句是 pushTarget(this)
6. pushTarget是Dep类到处的函数， 接受到的参数是target
7. Dep.target = target， target也就是第4步创建的watcher
```

这里有一个问题思考一下 `_init`中的执行顺序如下
```js
// _init 函数中的代码
...
initState(vm)
...
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
}

##### mountComponent
```
从上面可以看出，先做的依赖收集，但是 `Dep.target`还不存在，因为还没执行 `$mount`，那第一次的依赖收集到底发生的哪里?
在第一次渲染的时候 `$mount` 调用了 `mountComponent` 大致代码如下：
```js
function mountComponent(vm, el) {
  // ...一些前置处理逻辑

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
updateComponent 函数中。在该函数中，会调用 vm._render 方法生成虚拟 DOM，并将其传递给 vm._update 方法进行实际的 DOM 更新。在 vm._update 方法中，会使用 patch 函数对比新旧虚拟 DOM，然后进行 DOM 的创建、更新或删除操作。

##### vm._render
```js
Vue.prototype._render = function() {
  const vm = this;
  const { render } = vm.$options; // 获取组件的 render 方法
  let vnode;
  
  // 调用 render 方法创建虚拟节点
  try {
    vnode = render.call(vm, vm.$createElement);
  } catch (error) {
    // 错误处理逻辑
  }
  
  return vnode;
};
```

```js
// Vue 构造函数
function Vue(options) {
  // ...

  // 初始化渲染相关的属性和方法
  this._initRender();

  // ...

  // 如果用户定义了 render 方法，则将其作为 $createElement 方法
  if (options.render) {
    this.$createElement = options.render;
  }

  // ...

  // 调用生命周期钩子函数
  this._callHook('beforeCreate');

  // ...
}

// 初始化渲染相关的属性和方法
Vue.prototype._initRender = function() {
  // ...

  // 绑定 $createElement 方法到 Vue 实例上
  this.$createElement = this._createElement;

  // ...
};
```