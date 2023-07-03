#### vue的 template 和 compileToFunctions
##### 关于 template
template会被编译成AST（abstract syntax tree），来看一下 `getOuterHTML`的实现

```js
// src/platforms/web/runtime-with-compiler.ts
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}
Vue.compile = compileToFunctions
```

##### 关于 compileToFunctions
逐步来分析这个函数到底做了什么事情
```js
/* 1. 该函数在 $mount 中调用 src/platforms/web/runtime-with-compiler.ts */
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

/* 2. src/platforms/web/compiler/index.ts */
import { baseOptions } from './options'
export const { compile, compileToFunctions } = createCompiler(baseOptions)

/* 3. src/compiler/index.ts */
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // AST抽象树
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  // 这里返回了 render 和 staticRenderFns
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})

/* 4. src/compiler/create-compiler.ts */
export function createCompilerCreator(baseCompile: Function): Function {
  return function createCompiler(baseOptions: CompilerOptions) {
    function compile(template, options) {
      // ...
      const compiled = baseCompile(template.trim(), finalOptions)
      return compiled
    }
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/* 5. src/compiler/to-function.ts */
export function createCompileToFunctionFn(compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions(template, options) {
    // ...
    const compiled = compile(template, options)
  }
}

```
好吧！上面有点乱😈
1. compileToFunctions 是由createCompiler 返回的，同时还有一个 compile， 参数是 baseOptions
2. createCompiler 是由 createCompilerCreator 返回的函数，该概述的参数是 baseCompile
3. 执行 createCompiler，其内部主要流程如下
    - 定义了 compile 函数， 内部可以获取 baseOptions 和 baseCompile
    - 又执行了 createCompileToFunctionFn(compile)，得到compileToFunctions
    - 返回 compile 和 compileToFunctions

这里用了一些闭包，在 `createCompiler` 内部可以获取 `baseCompile` 和 `baseOptions`

##### baseOptions

```js
/* src/platforms/web/compiler/options.ts */
export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
// modules
[
  {
    staticKeys: ['staticClass'],
    transformNode,
    genData
  },
  {
    staticKeys: ['staticStyle'],
    transformNode,
    genData
  },
  {
    preTransformNode
  }
]

// directives
{
  model: function(){},
  html: function(){},
  text: function(){}
}

// isPreTag 是否是 pre 标签
export const isPreTag = (tag: ?string): boolean => tag === 'pre'

// isUnaryTag 是否是一元标签 makeMap返回一个map查找函数, map的键是字符串分割，键存在返回true
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)

// mustUseProp: 用于检查标签元素的属性是否必须使用 prop 的方式来进行绑定
//  attributes that should be using props for binding
const acceptValue = makeMap('input,textarea,option,select,progress')
export const mustUseProp = (
  tag: string,
  type?: string | null,
  attr?: string
): boolean => {
  return (
    (attr === 'value' && acceptValue(tag) && type !== 'button') ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
}

// canBeLeftOpenTag 可以自己闭合的标签
// Elements that you can, intentionally, leave open
// (and which close themselves)
export const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)
```

##### parse 
vue中的抽象语法树AST的编译，compile中除了合并options以外，关键的是调用了 `baseCompile`
```js
// src/compiler/index.ts
function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  /*解析得到AST*/
  const ast = parse(template.trim(), options)
  /*将AST进行优化   2.在patch的过程中直接跳过。*/
  optimize(ast, options)
  /*根据AST生成所需的code（内部包含render与staticRenderFns）*/
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}
```

`parse` 函数的主要结构如下
```js
// src/compiler/parser/index.ts
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  // ...

  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    start (tag, attrs, unary) {
      // ...
    },
    end () {
      // ...
    },
    chars (text: string) {
      // ...
    },
    comment (text: string) {
      // ...
    }
  })
  return root
}
```

##### parseHTML & html-parser.ts
从顶部注释里看到，是基于 John Resig 的开源项目, http://erik.eae.net/simplehtmlparser/simplehtmlparser.js


