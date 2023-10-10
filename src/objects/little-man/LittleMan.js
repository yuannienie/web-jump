import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LITTLE_MAN_COLOR, LITTLE_MAN_HEIGHT, LITTLE_MAN_WIDTH } from '../../constants/constants';
/**
 * 跳跃小人类对象，需要注意几点：
 * 1. 蓄力跳跃的时候躯干会有压缩的动画，但是头部没有，所以头和躯干应该分开渲染
 * 2. 小人空中跳跃翻转身体需要以自身的中心翻转，需要临时变换坐标系
 */
export default class LittleMan {
    constructor(boxGroupManager) {
        // boxGroupMananger 的引用，用于确认小人的初始位置
        this.boxGroupManager = boxGroupManager;
        // 定义小人材质
        this.roleMaterial = new THREE.MeshLambertMaterial({ color: LITTLE_MAN_COLOR });
        // 头部
        this.head = null;
        // 躯干 跳跃的时候躯干被压缩，而头部不会被压缩
        this.trunk = null;
        // 记录躯干的高度
        this.trunkHeight = 0;
        // 头部 + 躯干
        this.body = null;
        // 控制旋转的部分
        // 和 body 的区别在于坐标基点不同，也就导致旋转的中心不同
        this.bodyRotate = null;
        this.init();
    }

    init() {
        this.initHead();
        this.initTrunk();
        this.initBody();
        this.initPosition();
    }

    initHead() {
        const headGeometry = new THREE.SphereGeometry(LITTLE_MAN_WIDTH / 2, 40, 40);
        this.head = new THREE.Mesh(headGeometry, this.roleMaterial);
        this.head.castShadow = true;
        this.head.translateY(LITTLE_MAN_HEIGHT);
    }

    initTrunk() {
        // 躯干的高度是总的高度减去头部的大小，和头部稍微离开一些
        const trunkHeight = LITTLE_MAN_HEIGHT - 1.2 * LITTLE_MAN_WIDTH;

        this.trunkHeight = trunkHeight;
        // 上方球体
        const trunkTopGeometry = new THREE.SphereGeometry(LITTLE_MAN_WIDTH / 2, 40, 40);
        trunkTopGeometry.translate(0, trunkHeight, 0);

        // 中间圆柱，和上方球体相切
        const trunkCenterGeometry = new THREE.CylinderGeometry(
            LITTLE_MAN_WIDTH / 2,
            LITTLE_MAN_WIDTH / 2 * .8,
            trunkHeight / 4,
            40
        );
        // 向上移动到和球体相切
        trunkCenterGeometry.translate(0, trunkHeight / 8 * 7, 0);

        // 下方圆柱
        const trunkBottomGeometry = new THREE.CylinderGeometry(
            LITTLE_MAN_WIDTH / 2 * .8,
            LITTLE_MAN_WIDTH / 2 * 1.3,
            trunkHeight / 4 * 3,
            40
        );
        // 向上移动到和上方圆柱相切
        trunkBottomGeometry.translate(0, 3 / 8 * trunkHeight, 0);

        // 三者合成躯干
        const trunkGeometry = BufferGeometryUtils.mergeBufferGeometries([trunkTopGeometry, trunkCenterGeometry, trunkBottomGeometry]);
        this.trunk = new THREE.Mesh(trunkGeometry, this.roleMaterial);
        this.trunk.castShadow = true;
        this.trunk.receiveShadow = true;
    }

    initBody() {
        // bodyRotate 将旋转中心点移动到物体的中间部分
        this.bodyRotate = new THREE.Group();
        this.bodyRotate.translateY(LITTLE_MAN_HEIGHT / 2);

        this.bodyRotate.add(this.head);
        this.head.translateY(-LITTLE_MAN_HEIGHT / 2);

        this.bodyRotate.add(this.trunk);
        this.trunk.translateY(-LITTLE_MAN_HEIGHT / 2);

        // body 的中心点还是在坐标原点，也就是小人的脚下
        this.body = new THREE.Group();
        this.body.add(this.bodyRotate);
    }

    initPosition() {
        // 当前小人站立的盒子
        this.box = this.boxGroupManager.last.prev;
        this.body.translateY(this.box.height);
    }
}