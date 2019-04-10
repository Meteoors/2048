// 游戏数据处理中心
class GameManager{
    constructor(size, InputManager, Actuator) {
        this.size = size;
        this.inputManager = new InputManager();
        this.actuator = new Actuator();

        this.startTiles = 2; // 初始格子数量

        this.inputManager.on('move', this.move.bind(this));
        this.inputManager.on('restart', this.restart.bind(this));

        this.setup();
    }

    // 初始化
    setup() {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;

        this.addStartTiles();
        this.actuate();
    }

    // 主程序，把数据传给 Actuator 进行映射
    actuate() {
        this.best = this.score;

        this.actuator.actuate(this.grid, {
            score: this.score,
            best: this.best,
            won: this.won,
            over: this.over
        });
    }

    // 移动方块,由键盘事件触发，移动完成后调用主程序
    // 遍历棋盘格子，当格子里有方块时，根据方块 value、position 给出移动方向及合并处理
    // 0: up, 1: right, 2: down, 3: left
    move(direction) {
        // 游戏结束后不做任何处理
        if (this.over || this.won) {
            return false;
        }

        let vector = this.getVector(direction); // 移动向量
        let traversals = this.buildTraversals(vector); // 遍历格子的顺序
        let moved = false; // 有方块移动过 

        this.prepareTiles();

        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                let cell = {x, y};
                let tile = this.grid.cellContent(cell); // 当前格子里的方块
                

                if (tile) {
                    let positions = this.findFarthestPosition(cell, vector); // 取出当前方块可移动的最远位置信息
                    let next = this.grid.cellContent(positions.next); // 取出最远格子下一格子的内容

                    // 下一格子在棋盘内，且下一格子与当前格子里方块的 value 相等，且下一格子里方块没有被合并过
                    if (next && tile.value === next.value && !next.mergedFrom) {
                        // 合并当前格子与下一格子,在下一格子生成新方块，并添加到棋盘
                        let merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next]; // 生成合并方块的两个旧方块

                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);

                        // 从棋盘移除当前方块后，更新方块的位置信息
                        tile.updatePosition(positions.next);

                        // 更新分数
                        this.score += tile.value * 2;
                        
                        // 判断赢否
                        if (merged.value === 2048) {
                            this.won = true;
                        }
                    } else {
                        // 将方块移到最远位置
                        this.moveTile(tile, positions.farthest);
                    }
                    

                    if (!this.positionsEqual(tile)) {
                        moved = true;
                    }
                }
            });
        });

        // 只要有方块移动过，就添加新方块
        if (moved) {
            this.addRandomTile();

            // 判断是否有可移动方块，否则游戏失败
            if (!this.movesAvailable()) {
                this.over = true;
            }

            this.actuate();
        }
    }

    // 重新开始，由鼠标事件触发，初始化游戏数据
    restart() {
        this.actuator.clearMessage();
        this.setup();
    }

    // 添加初始方块
    addStartTiles() {
        for (var i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    // 添加方块
    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            // 生成格子数值（2:4 = 9:1）
            let value = Math.random() < 0.9 ? 2 : 4;
            let position = this.grid.randomAvailableCell();
            let tile = new Tile(position, value);

            this.grid.insertTile(tile);
        }
    }

    // 记录下所有方块的初始位置，且移除上次移动产生的合并信息
    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tile.savePosition();
                tile.mergedFrom = null;
            }
        });
    }

    // 根据移动方向返回移动向量
    getVector(direction) {
        let map = {
            0: {x: 0,  y: -1}, // up
            1: {x: 1,  y: 0},  // right
            2: {x: 0,  y: 1},  // down
            3: {x: -1, y: 0}   // left
        }
        return map[direction];
    }

    // 返回格子遍历方向
    buildTraversals(vector) {
        let traversals = {x: [], y: []};

        // 默认遍历方向为 x：左 —> 右, y：上 —> 下
        for (var i = 0; i < this.size; i++) {
            traversals.x.push(i);
            traversals.y.push(i);
        }

        // 当格子向右移动时，水平遍历方向应为 从右往左
        if (vector.x === 1) {
            traversals.x.reverse();
        }
        // 当格子向下移动时，垂直遍历方向应为 从下往上
        if (vector.y === 1) {
            traversals.y.reverse();
        }

        return traversals;
    }

    // 返回方块可移动的最远位置信息，参数为坐标、移动向量
    findFarthestPosition(cell, vector) {
        let previous;

        // 从当前位置往移动方向前进，直到棋盘边界/前面有方块
        do {
            previous = cell;
            cell = {
                x: cell.x + vector.x,
                y: cell.y + vector.y
            };
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous, // 最远位置坐标
            next: cell  // 最远位置下一个格子的坐标
        };
    }

    // 移动方块
    moveTile(tile, position) {
        this.grid.removeTile(tile);

        tile.updatePosition(position);
        this.grid.insertTile(tile);
    }

    // 返回方块是否在初始位置
    positionsEqual(tile) {
        return tile.previousPosition.x === tile.x && tile.previousPosition.y === tile.y;
    }

    // 是否有可移动方块
    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchable();
    }

    // 是否有相邻的方块 value 相等
    tileMatchable() {
        // 这里不用 grid 的 eachCell 方法遍历，因为forEach无法跳出循环
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                let tile = this.grid.cellContent({x, y});

                for (var direction = 0; direction < 4; direction++) {
                    let vector = this.getVector(direction);
    
                    let cell = {x: x + vector.x, y: y + vector.y};
                    let next = this.grid.cellContent(cell);
    
                    if (next && next.value === tile.value) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
