#### 链表反转II [LeetCode-92](https://leetcode.cn/problems/reverse-linked-list-ii/)

给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。

输入：head = [1,2,3,4,5], left = 2, right = 4
输出：[1,4,3,2,5]

输入：head = [5], left = 1, right = 1
输出：[5]


##### 方法一 我当时也是这个思路
- 查找leftNode和前一个节点prev
- 查找rightNode和后一个节点next
- 切断链表 反转[left, right]
- prev.next = rightNode, leftNode.next = next

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
 * @param {number} left
 * @param {number} right
 * @return {ListNode}
 */
var reverseBetween = function(head, left, right) {
    const dummy = new ListNode(-1, head)

    // 找出leftNode和前一个节点prev
    let prev = dummy
    for (let i = 0; i < left - 1; i++) {
        prev = prev.next
    }
    let leftNode = prev.next

    // rightNode和后一个节点next
    let rightNode = leftNode
    for (let j = 0; j < right - left; j++) {
        rightNode = rightNode.next
    }
    let next = rightNode.next

    // 反转[left,right]节点
    prev.next = null
    rightNode.next = null

    reverseLinkedList(leftNode)

    prev.next = rightNode
    leftNode.next = next

    return dummy.next
};

const reverseLinkedList = (head) => {
    let pre = null;
    let cur = head;

    while (cur) {
        const next = cur.next;
        cur.next = pre;
        pre = cur;
        cur = next;
    }
}
```

##### 方法二 不用反转区间节点
- 找到leftNode和前一个节点prev
- 从leftNode循环往后查找，prev.next = leftNode.next, leftNode.next.next = leftNode
- 重复上一步，区间内的节点都插入到prev的后面