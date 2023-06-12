#### 二叉树的层序遍历II [LeetCode-107](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/)

给你二叉树的根节点 root ，返回其节点值 自底向上的层序遍历 。 （即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）
![二叉树](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

```
输入：root = [3,9,20,null,null,15,7]
输出：[[15,7],[9,20],[3]]
```

```
输入：root = [1]
输出：[[1]]
```

```
输入：root = []
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
 * @return {number[][]}
 */
var levelOrderBottom = function(root) {
    if (!root) {
        return []
    }

    const ans = []
    const queue = [root]

    while (queue.length) {
        // 暂存队列长度
        let size = queue.length
        let levelNodes = []
        for (let i = 0; i < size; i++) {
            let node = queue.shift()    
            levelNodes.push(node.val)

            if (node.left) {
                queue.push(node.left)
            }

            if (node.right) {
                queue.push(node.right)
            }
        }
        // 和层序遍历的唯一区别
        ans.unshift(levelNodes)
    }

    return ans
};
```