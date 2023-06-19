#### 跳跃游戏II [LeetCode-45](https://leetcode.cn/problems/jump-game-ii/)
给定一个长度为 n 的 0 索引整数数组 nums。初始位置为 nums[0]。

每个元素 nums[i] 表示从索引 i 向前跳转的最大长度。换句话说，如果你在 nums[i] 处，你可以跳转到任意 nums[i + j] 处:

0 <= j <= nums[i] 
i + j < n
返回到达 nums[n - 1] 的最小跳跃次数。生成的测试用例可以到达 nums[n - 1]。
s

```
输入: [2,3,1,1,4]
输出: 2
解释: 跳到最后一个位置的最小跳跃数是 2。
     从下标为 0 跳到下标为 1 的位置，跳 1 步，然后跳 3 步到达数组的最后一个位置。
```

```
输入: nums = [2,3,0,1,4]
输出: 2
```

##### 方法一
反向查找，遍历数组先找出最大的能到达最后一个位置的元素，更新位置（循环已此方法查找）
``` go
func jump(nums []int) int {
    pos := len(nums) - 1
    steps := 0

    for pos > 0 {
        //遍历数组找出最大的能到达最后一个位置的元素
        for i := 0; i < pos ; i ++ {
            //判断是否可以跳到最有一个位置
            if i + nums[i] >= pos {
               pos = i
               steps++ 
               break
            }
        }
    }

    return steps
}
```
时间复杂度：O(n²)
空间复杂度：O(1)

##### 方法二
正向找最大可达到的位置，维护最大可到达的位置
``` js
/**
 * 遍历一次数组，记录每个元素能到达的最大位置，每次更新步数+1
 * maxPos 记录每个元素最大到达位置
 */
var jump = function(nums) {
    let pos = nums.length - 1
    let steps = 0, end = 0, maxPos = 0

    for(let i = 0;  i < pos; i++) {
        maxPos = Math.max(maxPos, i + nums[i])
        //找出前一步能几种最大能跳到的位置作为边界
        if(i == end) {
            end = maxPos
            steps++
        }
    }

    return steps
}

```
时间复杂度：O(n)
空间复杂度：O(1)