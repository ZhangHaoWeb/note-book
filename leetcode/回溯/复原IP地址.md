#### 复原IP地址 [LeetCode-93](https://leetcode.cn/problems/restore-ip-addresses/)
有效 IP 地址 正好由四个整数（每个整数位于 0 到 255 之间组成，且不能含有前导 0），整数之间用 '.' 分隔。

例如："0.1.2.201" 和 "192.168.1.1" 是 有效 IP 地址，
但是 "0.011.255.245"、"192.168.1.312" 和 "192.168@1.1" 是 无效 IP 地址。
给定一个只包含数字的字符串 s ，用以表示一个 IP 地址，返回所有可能的有效 IP 地址，这些地址可以通过在 s 中插入 '.' 来形成。你 不能 重新排序或删除 s 中的任何数字。你可以按 任何 顺序返回答案。

```
输入：s = "25525511135"
输出：["255.255.11.135","255.255.111.35"]
```

```
输入：s = "0000"
输出：["0.0.0.0"]
```

```
输入：s = "101023"
输出：["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]
```

```js
/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function(s) {
    const result = []
    const path = []

    function backtrack(s) {
        // s为空时，刚好将s分割为4个数字
        if (path.length == 4 && s == '') {
            result.push(path.join("."))
            return
        }
        // s不为空，虽然path也是4个数字，但是s还有剩余
        if (path.length == 4 && s != '') {
            return
        }

        for (let i = 1; i <= s.length; i++) {
            // 从下标1开始分割字符串
            let part = s.slice(0, i)

            if (parseInt(part) > 255 || part.startsWith("0") && part.length > 1) {
                continue
            }
            
            path.push(part);
            backtrack(s.slice(i));
            path.pop();
        }
    }
    
    backtrack(s)
    return result
};
```

