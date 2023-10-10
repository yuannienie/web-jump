import Stage from './objects/Stage';
import { setFrameAction } from './util/TweenUtil';
import BoxGroupManager from './objects/box/BoxGroupManager';

export default class Main {
    constructor() {
        // 舞台
        this.stage = null;
        // 游戏初始化
        this.init();
        // 盒子组管理类
        this.boxGroupManager = null;
    }

    init() {
        // 初始化舞台
        this.stage = new Stage();
        // 初始化盒子
        this.initBoxes();
        this.stage.scene.add(this.boxGroupManager.group);
        // 每次动画后都要渲染
        setFrameAction(this.stage.render.bind(this.stage));
    }

    initBoxes() {
        this.boxGroupManager = new BoxGroupManager();
        this.boxGroupManager.createBox();
        this.boxGroupManager.createBox();
        this.boxGroupManager.updatePosition({});
    }

    start() {
        this.stage.render();
    }

}
