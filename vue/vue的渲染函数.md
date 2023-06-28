```js
// src/core/vdom/vnode.ts

function mountComponent(vm, el) {
  // ...一些前置处理逻辑
  vm.$options.render = createEmptyVNode

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

```js
// src/core/vdom/vnode.ts
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
```

```js
// src/core/vdom/vnode.ts
export default class VNode {
  tag?: string
  data: VNodeData | undefined
  children?: Array<VNode> | null
  text?: string
  elm: Node | undefined
  ns?: string
  context?: Component // rendered in this component's scope
  key: string | number | undefined
  componentOptions?: VNodeComponentOptions
  componentInstance?: Component // component instance
  parent: VNode | undefined | null // component placeholder node

  // strictly internal
  raw: boolean // contains raw HTML? (server only)
  isStatic: boolean // hoisted static node
  isRootInsert: boolean // necessary for enter transition check
  isComment: boolean // empty comment placeholder?
  isCloned: boolean // is a cloned node?
  isOnce: boolean // is a v-once node?
  asyncFactory?: Function // async component factory function
  asyncMeta: Object | void
  isAsyncPlaceholder: boolean
  ssrContext?: Object | void
  fnContext: Component | void // real context vm for functional nodes
  fnOptions?: ComponentOptions | null // for SSR caching
  devtoolsMeta?: Object | null // used to store functional render context for devtools
  fnScopeId?: string | null // functional scope id support
  isComponentRootElement?: boolean | null // for SSR directives

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode> | null,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance
  }
}
```