// 游戏处理中心
class GameManager{
    constructor(size, InputManger, Actuator) {
        this.size = size;
        this.inputManger = new InputManager();
        this.actuator = new Actuator();

        this.startTiles = 2; // 初始格子数量

        this.inputManger.on('move', this.move.bind(this));
        this.inputManger.on('restart', this.restart.bind(this));

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

    // 移动格子,由键盘事件触发，移动完成后调用主程序
    // 遍历棋盘格子，当格子里有方块时，根据方块 value、position 给出移动方向及合并处理
    // 0: up, 1: right, 2: down, 3: left
    move(direction) {
        // 游戏结束后不做任何处理
        if (this.over || this.won) {
            return false;
        }

        let vector = this.getVector(direction); // 移动向量
        let traversals = this.buildTraversals(vector); // 遍历格子的顺序

        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                let cell = {x, y};
                let tile = this.grid.cellContent(cell);
            });
        });
    }

    // 添加初始格子
    addStartTiles() {
        for (var i = 0; i < this.startTiles; i++) {
            this.addRandomTile()
        }
    }

    // 添加格子
    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            // 生成格子数值（2:4 = 9:1）
            let value = Math.random() < 0.9 ? 2 : 4;
            let position = this.grid.randomAvailableCell();
            let tile = new Tile(position, value);

            this.grid.insertTile(tile);
        }
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
}
