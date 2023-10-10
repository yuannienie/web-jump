import Stage from './objects/Stage';
import { setFrameAction } from './util/TweenUtil';
import BoxGroupManager from './objects/box/BoxGroupManager';
import LittleMan from './objects/little-man/LittleMan';

export default class Main {
    constructor() {
        // 舞台
        this.stage = null;
        // 游戏初始化
        this.init();
        // 盒子组管理类
        this.boxGroupManager = null;
        // 小人
        this.littleMan = null;
    }

    init() {
        // 初始化舞台
        this.stage = new Stage();
        // 初始化盒子
        this.initBoxes();
        // 初始化小人
        this.initLittleMan();
        // 更新盒子和小人的位置
        this.boxGroupManager.updatePosition({});
        // 每次动画后都要渲染
        setFrameAction(this.stage.render.bind(this.stage));
    }

    initBoxes() {
        this.boxGroupManager = new BoxGroupManager();
        this.boxGroupManager.createBox();
        this.boxGroupManager.createBox();
        this.stage.scene.add(this.boxGroupManager.group);
    }

    initLittleMan() {
        this.littleMan = new LittleMan(this.boxGroupManager);
        this.boxGroupManager.setLittleMan(this.littleMan);
        this.stage.scene.add(this.littleMan.body);
    }

    start() {
        this.stage.render();
    }

}
