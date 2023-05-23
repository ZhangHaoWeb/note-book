#### 大小为 K 且平均值大于等于阈值的子数组数目 [LeetCode-1343](https://leetcode.cn/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold)
给你一个整数数组 arr 和两个整数 k 和 threshold 。

请你返回长度为 k 且平均值大于等于 threshold 的子数组数目。

示例 1：
输入：arr = [2,2,2,2,5,5,5,8], k = 3, threshold = 4
输出：3
解释：子数组 [2,5,5],[5,5,5] 和 [5,5,8] 的平均值分别为 4，5 和 6 。其他长度为 3 的子数组的平均值都小于 4 （threshold 的值)。

示例 2：
输入：arr = [11,13,17,23,29,31,7,5,2,3], k = 3, threshold = 5
输出：6
解释：前 6 个长度为 3 的子数组平均值都大于 5 。注意平均值不是整数。

<font color="red">自己当时写的时候，看起来循环了一次，计算平均值却很耗时，执行用时4484 ms（醉了！😠）</font>

```js
/**
 * @param {number[]} arr
 * @param {number} k
 * @param {number} threshold
 * @return {number}
 */
var numOfSubarrays = function(arr, k, threshold) {
    let l = 0, r = k - 1;
    let count = 0;

    while (r < arr.length) {
        let temp = arr.slice(l, r + 1)
        let avg = temp.reduce((a, b) => a + b) / k

        if (avg >= threshold) {
            count++
        }

        l++
        r++
    }

    return count
};
```
<font color="green">计算出第一个窗口的和，每次滑动时，加上当前窗口的arr[r],同时减去arr[l]</font>

```js
/**
 * @param {number[]} arr
 * @param {number} k
 * @param {number} threshold
 * @return {number}
 */
var numOfSubarrays = function(arr, k, threshold) {
    let l = 0, r = 0;
    let count = 0;

    // 求和
    let sum = 0
    while (r < k) {
        sum += arr[r]
        r++
    }
    // r - 1, 上面的求和导致当前r = 3
    while (r - 1 < arr.length) {
        // 平均值
        let avg = sum / k
        if (avg >= threshold) {
            count++
        }

        //使窗口滑动， sum减去arr[l], 加上arr[r]（注意r不能大于arr.length）
        sum -= arr[l++]
        if (r - 1 < arr.length) {
            // 注意r - 1， 这里加的是arr[r]
            sum += arr[r++]
        } else {
            r++
        }
    }

    return count
};
```