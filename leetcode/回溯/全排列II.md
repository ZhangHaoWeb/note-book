#### 全排列II [LeetCode-47](https://leetcode.cn/problems/permutations-ii/)

给定一个可包含重复数字的序列 nums ，按任意顺序 返回所有不重复的全排列。

```
输入：nums = [1,1,2]
输出：
[[1,1,2],
 [1,2,1],
 [2,1,1]]
```

```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 * @desc
 */
var permuteUnique = function(nums) {
    let ans = []
    const used = new Array(nums.length).fill(false);

    function backtrack(path) {
        // console.log(path);
        if (path.length == nums.length) {
            ans.push([...path])
        }

        const visited = new Set(); 

        for (let i = 0; i < nums.length; i++) {
            if (used[i] || visited.has(nums[i])) {
                continue; // 跳过已使用过的元素和已访问过的元素
            }

            // 递推
            path.push(nums[i])
            used[i] = true
            visited.add(nums[i]);

            backtrack(path)
            // 回归
            path.pop()
            used[i] = false
        }
    }

    backtrack([])

    return ans
};
```