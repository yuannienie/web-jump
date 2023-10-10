import * as THREE from 'three';
import Stage from './objects/Stage';
// import { setFrameAction } from './util/TweenUtil';

export default class Main {
    constructor() {
        // 舞台
        this.stage = null;
        // 游戏初始化
        this.init();
    }

    init() {
        // 初始化舞台
        this.stage = new Stage();
        // 初始化盒子
        this.initBoxes();
    }

    initBoxes() {
        const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshLambertMaterial({ color: 0xadadad });
        const boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(0, 0, 0);
        boxMesh.translateY(5);
        boxMesh.castShadow = true;
        this.stage.scene.add(boxMesh);
    }

    start() {
        this.stage.render();
    }

}
