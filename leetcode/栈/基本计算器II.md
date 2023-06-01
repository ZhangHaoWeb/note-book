#### 基本计算器II [LeetCode-227](https://leetcode.cn/problems/basic-calculator-ii/)

给你一个字符串表达式 s ，请你实现一个基本计算器来计算并返回它的值。

整数除法仅保留整数部分。

你可以假设给定的表达式总是有效的。所有中间结果将在 [-231, 231 - 1] 的范围内。

注意：不允许使用任何将字符串作为数学表达式计算的内置函数，比如 eval() 。

```
输入：s = "3+2*2"
输出：7
```

```
输入：s = " 3/2 "
输出：1
```

- 数字字符和之前的数字字符拼接(可能不是个位置)
- 非数字字符(运算符)时，判断上一个运算符，
- `+`直接入栈 
- `-`取反入栈
- `*`从栈顶取出一个与当前运算符之前的数字相乘，且入栈
- `/`从栈顶取出一个与当前运算符之前的数字相除，且入栈
- 返回栈的求和结果

```js
/**
 * @param {string} s
 * @return {number}
 */
var calculate = function(s) {
    let list = []
    let str = ""
    let op = "+"

    for (let i = 0; i <= s.length; i++) {
        // 判断s[i]是数字还是运算符
        if (!isNaN(s[i])) {
            str += s[i]
        } else {
            // 判断上一个运算符
            if (op == "+") {
                list.push(str)
            } else if (op == "-") {
                list.push(-str)
            } else if (op == "*") {
                let prev = list.pop()
                list.push(prev * str)
            } else {
                let prev = list.pop()
                 list.push(parseInt(prev / str))
            }

            // 记录当前运算符
            op = s[i]
            str = ""
        }
    }
    
    // 求和
    const sum = list.reduce((a, b) => {
        return Number(a, 10) + Number(b, 10)
    }, 0)

    return Math.floor(sum)
};
```
