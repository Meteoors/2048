// 棋盘
class Grid{
    constructor(size) {
        this.size = size;
        this.cells = this.empty();  // 二维数组，存放棋盘内格子
    }

    // 初始化空棋盘
    empty() {
        let cells = [];

        for (let x = 0; x < this.size; x++) {
            let row = cells[x] = [];
            for (let y = 0; y < this.size; y++) {
                row.push(null);
            }
        }

        return cells;
    }

    // 返回棋盘内空格子(由坐标组成的一维数组 [{x, y}, ...] )
    availableCells() {
        let cells = [];

        this.eachCell((x, y, cell) => {
            if (cell === null) {
                cells.push({x, y})
            }
        });

        return cells;
    }

    // 遍历格子
    eachCell(cb) {
        this.cells.forEach((row, x) => {
            row.forEach((item, y) => {
                cb(x, y, item);
            })
        })
    }

    // 随机取出一个空格子,返回 position ({x, y})
    randomAvailableCell() {
        let cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
    }

    // 方块插入格子
    insertTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    // 格子移除方块
    removeTile(tile) {
        this.cells[tile.x][tile.y] = null;
    }

    // 判断是否当前位置是否在4*4棋盘内，接收tile实例/position对象
    withinBounds(position) {
        return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
    }

    // 获取棋盘格子内容
    cellContent(cell) {
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        } else {
            return null;
        }
    }

    // 返回格子是否被方块占用
    cellOccupied(cell) {
        return !!this.cellContent(cell);
    }

    // 返回棋盘是否有空格子
    cellsAvailable() {
        return !!this.availableCells().length;
    }

    // 返回格子是否空置
    cellAvailable(cell) {
        return !this.cellOccupied(cell);
    }

    // 返回 grid 数据属性
    serialize() {
        let cells = [];

        for (var x = 0; x < this.size; x++) {
            let row = cells[x] = [];
            for(var y = 0; y < this.size; y++) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
        }

        return {cells, size};
    }
}