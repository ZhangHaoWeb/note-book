#### 两数之和 II LeetCode-167
给你一个下标从 1 开始的整数数组 numbers ，该数组已按 非递减顺序排列  ，请你从数组中找出满足相加之和等于目标数 target 的两个数。如果设这两个数分别是 numbers[index1] 和 numbers[index2] ，则 1 <= index1 < index2 <= numbers.length 。

以长度为 2 的整数数组 [index1, index2] 的形式返回这两个整数的下标 index1 和 index2。

你可以假设每个输入 只对应唯一的答案 ，而且你 不可以 重复使用相同的元素。

你所设计的解决方案必须只使用常量级的额外空间。

输入：numbers = [2,7,11,15], target = 9
输出：[1,2]
解释：2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。

##### 方法一
```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 * @desc 有啥可说的 直接暴力解法试试先 O(n²)
 */
var twoSum = function(numbers, target) {
    for (let i = 0; i < numbers.length; i++) {
        let search = target - numbers[i];

        for (let j = 0; j < numbers.length; j++) {
            let num = numbers[j];
            
            if (search == num && i != j) {
                // 说是下标从1开始 实际从0开始
                return [i + 1, j + 1]
            }
        }
    }
};s
```
##### 方法二
```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 * @desc 有一点暴力 循环二分查找 O(nlogn)
 */
var twoSum = function(numbers, target) {
    for (let i = 0; i < numbers.length; i++) {
        let search = target - numbers[i];
        let l = 0, r = numbers.length - 1;
        
        // 二分吧
        while (l <= r) {
            let mid = Math.floor((l + r) / 2);

            if (search == numbers[mid]) {
                return i > mid ? [i, mid] : [mid, i]
            } else if (search > numbers[mid]) {
                l = mid + 1
            } else {
                r = mid + 1
            }
        }
    }
};
```
##### 方法三
```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 * @desc 双指针 O(n) 好像也不是二分的样子
 */
var twoSum = function(numbers, target) {
    let l = 0, r = numbers.length - 1;

    while (l <= r) {
        let total = numbers[l] + numbers[r]

        if (total == target) {
            return [l + 1, r + 1]
        } else if (total < target) {
            l++;
        } else {
            r--;
        }
    }
};
```
