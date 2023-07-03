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
