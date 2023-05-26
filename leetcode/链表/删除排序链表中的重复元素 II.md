#### 删除排序链表中的重复元素 II [LeetCode-643](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/)

给定一个已排序的链表的头 head ， 删除原始链表中所有重复数字的节点，只留下不同的数字 。返回 已排序的链表 。

输入：head = [1,2,3,3,4,4,5]
输出：[1,2,5]

输入：head = [1,1,1,2,3]
输出：[2,3]

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {
    // 创建一个假head
    let dummy = new ListNode(0, head)
    let cur = dummy

    while (cur.next && cur.next.next) {
        // 判断后两个节点值是否一样
        if (cur.next.val == cur.next.next.val) {
            // 记录下重复的值x
            let x = cur.next.val

            // 删除所有重复的
            while (cur.next.val && cur.next.val == x) {
                cur.next = cur.next.next
            }
        } else {
            cur = cur.next
        }
    }

    return dummy.next
};
```