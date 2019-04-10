// 方块
class Tile{
    constructor(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;   // 方块内的数字大小，默认为 2

        this.previousPosition = null;  // 初始位置
        this.mergedFrom = null;
    }

    // 存入初始位置
    savePosition() {
        this.previousPosition = {
            x: this.x,
            y: this.y
        }
    }

    // 更新坐标
    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }

    // 返回 tile 数据属性
    serialize() {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    }
}
