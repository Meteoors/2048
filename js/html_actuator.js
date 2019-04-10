// 操作 DOM，把游戏数据映射到HTML
class HTMLActuator{
    constructor() {
        this.scoreContainer = document.querySelector('.score');
        this.bestContainer = document.querySelector('.best');        
        this.tileContainer = document.querySelector('.tile-container');
        this.messageContainer = document.querySelector('.message-container');
    }

    // 主程序，grid => 棋盘实例，  metadata => 其它信息(score、best、won、over)
    actuate(grid, metadata) {
        // 这里如果不用requestAnimationFrame方法，刷新页面后移动方块时 transition 动画失效
        window.requestAnimationFrame(() => {
            this.cleartContainer(this.tileContainer);
        
            // 遍历棋盘内格子，若格子内含有方块，则渲染方块
            grid.cells.forEach(row => {
                row.forEach(cell => {
                    if (cell) {
                        this.addTile(cell);
                    }
                });
            });
        
            // 更新分数
            this.updateScore(metadata.score);
            this.updateBest(metadata.best);
        
            // 游戏失败/成功，弹出信息
            if (metadata.won) {
                this.message(true);
            } else if (metadata.over) {
                this.message(false);
            }
        });
    }

    // 清空容器内节点
    cleartContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    // 渲染方块，接受 tile 实例
    addTile(tile) {
        let wrapper = document.createElement('div');
        let inner = document.createElement('div');
        // 先把方块渲染到移动前的位置 (previousPosition)
        let position = tile.previousPosition || {x: tile.x, y: tile.y};
        let positionClass = this.positionClass(position);

        // 处理包含块 class
        let classList = ['tile', `tile-${tile.value}`, positionClass];
        this.applyClasses(wrapper, classList);

        // 处理内层块 class 和内容
        inner.classList.add('tile-inner');
        inner.textContent = tile.value

        // 当方块被移动过，更新方块的位置（移动后）  （产生动画效果）
        if (tile.previousPosition) {
            // 延迟执行
            window.requestAnimationFrame(() => {
                classList[2] = this.positionClass({x: tile.x, y: tile.y});
                this.applyClasses(wrapper, classList);
            });
        } else if (tile.mergedFrom) {
            // 方块是由两个旧方块叠加产生的
            classList.push('tile-merged');
            this.applyClasses(wrapper, classList);

            // 渲染两个旧方块(产生动画效果)
            tile.mergedFrom.forEach(tile => {
                this.addTile(tile);
            });
        } else {
            // 新生成的方块
            classList.push('tile-new');
            this.applyClasses(wrapper, classList);
        }

        wrapper.appendChild(inner);
        this.tileContainer.appendChild(wrapper);
    }

    // 渲染分数
    updateScore(score) {
        this.scoreContainer.children[1].innerText = score;
    }

    // 渲染最高分
    updateBest(best) {
        this.bestContainer.children[1].innerText = best;
    }

    // 游戏结束弹出提示信息
    message(isWon) {
        let text = isWon ? 'You win!' : 'Game over!'

        this.messageContainer.children[0].innerText = text;
        this.messageContainer.style.display = 'block';
    }

    // 根据坐标生成对应 class
    positionClass(position) {
        position = {
            x: position.x + 1,
            y: position.y + 1
        }
        return `tile-position-${position.x}-${position.y}`;
    }

    // 给节点添加 class
    applyClasses(element, classList) {
        element.className = classList.join(' ');
    }

    // 清除提示信息
    clearMessage() {
        this.messageContainer.style.display = 'none';
    }
}
