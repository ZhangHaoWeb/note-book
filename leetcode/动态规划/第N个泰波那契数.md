#### 目标和 [LeetCode-1137](https://leetcode.cn/problems/n-th-tribonacci-number/)
泰波那契序列 Tn 定义如下： 

T0 = 0, T1 = 1, T2 = 1, 且在 n >= 0 的条件下 Tn+3 = Tn + Tn+1 + Tn+2

给你整数 n，请返回第 n 个泰波那契数 Tn 的值。

```
输入：n = 4
输出：4
解释：
T_3 = 0 + 1 + 1 = 2
T_4 = 1 + 1 + 2 = 4
```

```
输入：n = 25
输出：1389537
```

```js
/**
 * @param {number} n
 * @return {number}
 */
var tribonacci = function(n) {
    const dp = new Array(n + 1)

    dp[0] = 0
    dp[1] = 1
    dp[2] = 1

    // Tn+3 = Tn + Tn+1 + Tn+2
    for (let i = 3; i < dp.length; i++) {
        dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3]
    }

    return dp[n]
};
```
