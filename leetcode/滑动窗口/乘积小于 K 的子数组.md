#### 乘积小于 K 的子数组 [LeetCode-713](https://leetcode.cn/problems/subarray-product-less-than-k)

给你一个整数数组 nums 和一个整数 k ，请你返回子数组内所有元素的乘积严格小于 k 的连续子数组的数目。
 
示例 1：
输入：nums = [10,5,2,6], k = 100
输出：8
解释：8 个乘积小于 100 的子数组分别为：[10]、[5]、[2],、[6]、[10,5]、[5,2]、[2,6]、[5,2,6]。
需要注意的是 [10,5,2] 并不是乘积小于 100 的子数组。

示例 2：
输入：nums = [1,2,3], k = 0
输出：0

```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 * 
 * 如果一个子串的乘积小于k，那么他的每个子集都小于k，而一个长度为n的数组，他的所有连续子串数量是1+2+...n，但是会和前面的重复。 
 * 比如例子中[10, 5, 2, 6]，第一个满足条件的子串是[10]，第二个满足的是[10, 5]，但是第二个数组的子集[10]和前面的已经重复了，
 * 因此我们只需要计算 包含最右边的数字的子串数量，就不会重复了，
 * 也就是在计算[10, 5]这个数组的子串是，只加入[5]和[10, 5]，而不加入[10]，这部分的子串数量刚好是r - l + 1
 */
var numSubarrayProductLessThanK = function(nums, k) {
    let start = 0, end = 0;
    let mult = 1, ans = 0

    while (end < nums.length) {
        mult = mult * nums[end]

        while (start <= end && mult >= k) {
            mult = mult / nums[start]
            start++
        }

        // 这个真的是😒
        ans += (end - start + 1)
        end++
    }

    return ans
};
```