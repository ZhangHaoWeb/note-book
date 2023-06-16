#### 子集II [LeetCode-90](https://leetcode.cn/problems/subsets-ii/)

给你一个整数数组 nums ，其中可能包含重复元素，请你返回该数组所有可能的子集（幂集）。

解集 不能 包含重复的子集。返回的解集中，子集可以按 任意顺序 排列。

```
输入：nums = [1,2,2]
输出：[[],[1],[1,2],[1,2,2],[2],[2,2]]
```

```
输入：nums = [0]
输出：[[],[0]]
```

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    const reuslt = []
    const path = []
    nums.sort((a, b) => a - b)

    function backtrack(start) {
        console.log(path)
        reuslt.push([...path])

        if (path.length == nums.length) {
            return
        }

        for (let i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) {
                continue
            }

            path.push(nums[i])
            backtrack(i + 1)
            path.pop()
        }
    }

    backtrack(0)
    return reuslt
};

const nums = [1,2,2] // [[],[1],[1,2],[1,2,2],[2],[2,2]]
subsetsWithDup(nums)
```

