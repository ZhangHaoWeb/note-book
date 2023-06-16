#### 组合总和II [LeetCode-40](https://leetcode.cn/problems/combination-sum-ii/)
给定一个候选人编号的集合 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的每个数字在每个组合中只能使用 一次 。

注意：解集不能包含重复的组合。 

```
输入: candidates = [10,1,2,7,6,1,5], target = 8,
输出:
[
    [1,1,6],
    [1,2,5],
    [1,7],
    [2,6]
]
```

```
输入: candidates = [2,5,2,1,2], target = 5,
输出:
[
    [1,2,2],
    [5]
]
```

```js
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function(candidates, target) {
    const result = []
    const path = []
    candidates.sort((a, b) => a - b)

    function backtrack(start, sum) {
        if (sum == target) {
           result.push([...path])
           return
        }

        for (let i = start; i < candidates.length; i++) {
            // [ 1, 1,  2, 5, 6, 7, 10]
            // 当前元素和前一个元素相等 
            // i > start 有点难理解 筛选第一次的循环，递归里面不做筛选
            if(i > start && candidates[i] === candidates[i- 1]){
                continue;
            }
               
            sum += candidates[i]
            if (sum > target) {
                sum -= candidates[i]
                break
            }

            path.push(candidates[i])
            backtrack(i + 1, sum)
            path.pop()
            sum -= candidates[i]
        }
    }

    backtrack(0, 0)
    return result
};
```