#### 二叉搜索树的第k个节点 [LeetCode-54](https://leetcode.cn/problems/er-cha-sou-suo-shu-de-di-kda-jie-dian-lcof/)

给定一棵二叉搜索树，请找出其中第 k 大的节点的值。

```
输入: root = [3,1,4,null,2], k = 1
   3
  / \
 1   4
  \
   2
输出: 4
```

```
输入: root = [5,3,6,2,4,null,null,1], k = 3
       5
      / \
     3   6
    / \
   2   4
  /
 1
输出: 4
```
##### 中序遍历
```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
var kthLargest = function(root, k) {
    // 中序遍历
    let arr = []

    function traverse(node) {
        if (!node) {
            return
        }

        traverse(node.left)
        arr.push(node.val)
        traverse(node.right)
    }

    traverse(root)

    return arr[arr.length - k]
};
```

##### 反向中序遍历
中序遍历：左-中-右，二叉搜索树从小到大
反向中序遍历： 右-中-左，二叉搜索树从大到小

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
var kthLargest = function(root, k) {
    let res;
    const dfs = (node) => {
        if (!node) {
            return;
        }
        dfs(node.right);
        if ( k ===0 ) {
            return;
        }
        if (--k === 0) {
            res=node.val;
            return;
        }
        dfs(node.left);
    }
    dfs(root);
    return res;
};
```