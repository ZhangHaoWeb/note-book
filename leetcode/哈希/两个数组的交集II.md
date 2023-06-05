#### 两个数组的交接II [LeetCode-350](https://leetcode.cn/problems/intersection-of-two-arrays-ii/)

给你两个整数数组 nums1 和 nums2 ，请你以数组形式返回两数组的交集。返回结果中每个元素出现的次数，应与元素在两个数组中都出现的次数一致（如果出现次数不一致，则考虑取较小值）。可以不考虑输出结果的顺序。

```
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2,2]
```

```
输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[4,9]
```

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
    const map = new Map()
    let ans = []

    for (let i = 0; i < nums2.length; i++) {
        map.set(nums2[i], map.has(nums2[i]) ? map.get(nums2[i]) + 1 : 1)
    }

    for (let j = 0; j < nums1.length; j++) {
        console.log(map)
        if (map.has(nums1[j]) && map.get(nums1[j]) > 0) {
            map.set(nums1[j],map.get(nums1[j]) - 1)

            ans.push(nums1[j])
        }
    }

    return ans
};
```