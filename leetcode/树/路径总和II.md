#### 路径总和II [LeetCode-113](https://leetcode.cn/problems/path-sum-ii/)
给你二叉树的根节点 root 和一个整数目标和 targetSum ，找出所有 从根节点到叶子节点 路径总和等于给定目标和的路径。

叶子节点 是指没有子节点的节点。

![二叉树苏](https://assets.leetcode.com/uploads/2021/01/18/pathsumii1.jpg)
```
输入：root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
输出：[[5,4,11,2],[5,8,4,5]]
```

```
输入：root = [1,2,3], targetSum = 5
输出：[]
```

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {number[][]}
 */
var pathSum = function(root, targetSum) {
    let paths = []

    if (!root) {
        return paths
    }

    function traverse(node, path, sum) {
        if (!node) {
            return
        }

        sum += node.val
        let p = [...path, node.val]

        if (!node.left && !node.right && sum == targetSum) {
            paths.push(p)
        }

        traverse(node.left, p, sum)
        traverse(node.right, p, sum)
    }

    traverse(root, [], 0)

    return paths
}
```


