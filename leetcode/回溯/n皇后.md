#### n皇后 [LeetCode-51](https://leetcode.cn/problems/n-queens/)

按照国际象棋的规则，皇后可以攻击与之处在同一行或同一列或同一斜线上的棋子。

n 皇后问题 研究的是如何将 n 个皇后放置在 n×n 的棋盘上，并且使皇后彼此之间不能相互攻击。

给你一个整数 n ，返回所有不同的 n 皇后问题 的解决方案。

每一种解法包含一个不同的 n 皇后问题 的棋子放置方案，该方案中 'Q' 和 '.' 分别代表了皇后和空位。

![n皇后](https://assets.leetcode.com/uploads/2020/11/13/queens.jpg)
```
输入：n = 4
输出：[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
解释：如上图所示，4 皇后问题存在两个不同的解法。
```

```
输入：n = 1
输出：[["Q"]]
```  

##### 回溯瓜皮写法(确实是挺难的😈)
```js
/**
 * @param {number} n
 * @return {string[][]}
 */
var solveNQueens = function(n) {
    let result = []
    let box = new Array(n).fill(".").map(() => new Array(n).fill("."))
    
    function backtrack(box, row) {
        if (row >= n) {
            result.push(box)
            return
        }

        // 枚举第row行放置皇后的情况, 当前row不能喝之前的放置在同一列
        outLoop: for (let i = 0; i < box[row].length; i++) {
            let b = [...box.map((i) => [...i])]

            // 对之前row的校验
            for (let j = 0; j < row; j++) {
                // 要判断前面的列是否有Q
                if (b[j][i] == "Q") {
                    continue outLoop
                }
                
                //检查左上角到右下角是否放置过
                if (i - (row - j) >= 0 && b[j][i - (row - j)] === 'Q') {
                    continue outLoop
                }

                 //检查右上角到左下角是否放置过
                if (i + (row - j) < n && b[j][i + (row - j)] === 'Q') {
                    continue outLoop
                }
            }
            
            b[row][i] = "Q"

            // 递归调用
            backtrack(b, row + 1)
        }
    }

    backtrack(box, 0)

    return result.map(i => i.map(j => j.join("")))
};
```

##### gpt回溯写法
```js
/**
 * @param {number} n
 * @return {string[][]}
 */
function solveNQueens(n) {
  const result = [];
  const board = new Array(n).fill('.').map(() => new Array(n).fill('.'));

  backtrack(0);

  return result;

  function backtrack(row) {
    if (row === n) {
      result.push([...board.map(row => row.join(''))]);
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
      }
    }
  }

  function isValid(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') {
        return false;
      }
      if (col - (row - i) >= 0 && board[i][col - (row - i)] === 'Q') {
        return false;
      }
      if (col + (row - i) < n && board[i][col + (row - i)] === 'Q') {
        return false;
      }
    }
    return true;
  }
}
```