#### 存在重复元素III [LeetCode-217](https://leetcode.cn/problems/contains-duplicate-iii/)

给你一个整数数组 nums 和两个整数 k 和 t 。请你判断是否存在 两个不同下标 i 和 j，使得 abs(nums[i] - nums[j]) <= t ，同时又满足 abs(i - j) <= k 。

如果存在则返回 true，不存在返回 false。

```
输入：nums = [1,2,3,1], k = 3, t = 0
输出：true
```

```
输入：nums = [1,0,1,1], k = 1, t = 2
输出：true
```

```
输入：nums = [1,5,9,1,5,9], k = 2, t = 3
输出：false
```

##### 啥也别说 暴力解决😈
```js
/**
 * @param {number[]} nums
 * @param {number} indexDiff
 * @param {number} valueDiff
 * @return {boolean}
 */
var containsNearbyAlmostDuplicate = function(nums, indexDiff, valueDiff) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (Math.abs(nums[i] - nums[j]) <= valueDiff && Math.abs(i - j) <= indexDiff) {
                return true
            }
        }
    }

    return false
};
```

##### 滑动窗口
`abs(nums[i] - nums[j]) <= t`
`abs(i - j) <= k`
这两个公式怎么解释？
对于序列中每一个元素 x 左侧的至多 k 个元素，如果这 k 个元素中存在一个元素落在区间 [x−t,x+t] 中
