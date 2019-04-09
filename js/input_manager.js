class InputManager{
    constructor() {
        this.events = {};

        this.listen();
    }

    on(event, cb) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(cb);
    }

    emit(event, data) {
        let cbs = this.events[event];

        if (cbs) {
            cbs.forEach(cb => {
                cb(data);
            });
        }
    }

    listen() {
        const map = {
            38: 0,  // up
            39: 1,  // right
            40: 2,  // down
            37: 3   //left
        };

        document.addEventListener('keydown', event => {
            let mapped = map[event.which];

            // 按下方向键，触发 move 事件
            if (mapped !== undefined) {
                event.preventDefault();
                this.emit('move', mapped);
            } 

            // 按下 r 键，重新开始
            if (event.which === 82) {
                this.restart(event);
            }
        });

        // 绑定按钮事件
        this.bindButtonPress('.replay', this.restart.bind(this));
    }

    restart(event) {
        event.preventDefault();
        this.emit('restart');
    }

    bindButtonPress(selector, fn) {
        let btn = document.querySelector(selector);
        btn.addEventListener('click', fn);
    }
}