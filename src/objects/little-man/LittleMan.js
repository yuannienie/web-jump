import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { DEV, HIGH_JUMP, JUMP_TIME, LITTLE_MAN_COLOR, LITTLE_MAN_HEIGHT, LITTLE_MAN_WIDTH } from '../../constants/constants';
import { isMobile } from '../../util/common';
import TWEEN from '@tweenjs/tween.js';
import Box from '../box/Box';
import { animateFrame } from '../../util/TweenUtil';

/**
 * 跳跃小人类对象，需要注意几点：
 * 1. 蓄力跳跃的时候躯干会有压缩的动画，但是头部没有，所以头和躯干应该分开渲染
 * 2. 小人空中跳跃翻转身体需要以自身的中心翻转，需要临时变换坐标系
 */
class LittleMan {
    constructor(boxGroupManager, stage) {
        // boxGroupMananger 的引用，用于确认小人的初始位置
        this.boxGroupManager = boxGroupManager;
        this.stage = stage;
        // 站立的盒子
        this.box = null;
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
        // 小人此时的状态
        this.state = LittleMan.State.init;
        // 蓄力时头部位置
        this.headYPosition = LITTLE_MAN_HEIGHT / 2;
        // 蓄力时躯干向下压缩比
        this.trunkScaleY = 1;
        // 蓄力时躯干横向扩张比
        this.trunkScaleXZ = 1;
        // 蓄力时盒子向下压缩比
        this.boxScaleY = 1;
        this.init();
    }

    init() {
        this.initHead();
        this.initTrunk();
        this.initBody();
        this.initPosition();
        this.initEventListener();
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

    initEventListener() {
        const upEvent = isMobile ? 'touchend' : 'mouseup';
        const downEvent = isMobile ? 'touchstart' : 'mousedown';
        const container = this.stage.renderer.domElement;
        // 松开事件
        container.addEventListener(upEvent, (e) => {
            e.preventDefault();
            if (this.state === LittleMan.State.accumulation) {
                this.state = LittleMan.State.jump;
                // TODO: 跳跃
                this.jump();
            }
        }, false);

        // 按下事件
        container.addEventListener(downEvent, (e) => {
            e.preventDefault();
            if (this.state === LittleMan.State.init) {
                this.state = LittleMan.State.accumulation;
                // TODO 脚下粒子聚集特效
                // 小人蓄力形变
                this.accmulate();
            }
        }, false);
    }

    accmulate() {
        const tween = new TWEEN.Tween({
            // 因为翻转中心设置过头和躯干的参考系，这里的高度为 LITTLE_MAN_HEIGHT / 2
            headYPosition: LITTLE_MAN_HEIGHT / 2,
            trunkScaleXZ: 1,
            trunkScaleY: 1,
            boxScaleY: 1
        }).to({
            headYPosition: LITTLE_MAN_HEIGHT / 2 - this.trunkHeight * 0.4,
            trunkScaleXZ: 1.3,
            trunkScaleY: 0.6,
            boxScaleY: 0.6
        }, 1500)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(({
                headYPosition,
                trunkScaleXZ,
                trunkScaleY,
                boxScaleY,
            }) => {
                if (this.state !== LittleMan.State.accumulation) {
                    tween.stop();
                }
                // 记录下躯干的缩放程度，用于计算跳跃初始速度
                this.trunkScaleY = trunkScaleY;
                this.headYPosition = headYPosition;
                this.trunkScaleXZ = trunkScaleXZ;
                this.boxScaleY = boxScaleY;
                // 盒子缩放
                this.box.scaleY(boxScaleY);
                // 躯干缩放
                this.trunk.scale.set(trunkScaleXZ, trunkScaleY, trunkScaleXZ);
                // 身体下移
                this.body.position.setY(Box.defaultHeight * boxScaleY);
                // 头部下移
                this.head.position.setY(headYPosition);
            })
            .start();

        animateFrame();
    }

    /**
     * TODO：待补充
     * 小人跳跃的整个动画与逻辑包含以下几点：
     * 1. 小人向下一个盒子方向的初速度，其初速度大小决定于 Y 轴压缩比，空中跳跃时间为固定值，这样就可以计算其着落点
     * 2. 小人 Y 轴上的初速度，跳跃的高度是个定值，并且分为「上升」阶段和「下降」阶段
     */
    jump() {
        console.log('Jumping!')
        this.moveInXZ();
        this.moveInY();
    }

    /** 跳跃时 XZ 平面的移动 */
    moveInXZ() {
        // 初速度
        const velocityXZ = Math.max(1 - this.trunkScaleY, 0.03);
        let distance;
        if (DEV) {
            // 测试用，每次都跳到中央
            distance = this.box.distance + this.box.size / 2 + this.box.next.size / 2;
        } else {
            distance = velocityXZ * JUMP_TIME;
        }

        let [targetX, targetZ] = [0, 0];
        const { finalX: x, finalZ: z } = this.body;
        if (this.box.direction === 'z') {
            targetX = this.body.position.x;
            targetZ = z - distance;
        } else {
            targetZ = this.body.position.z;
            targetX = x + distance;
        }

        // 匀速运动
        new TWEEN.Tween({ x: this.body.position.x, z: this.body.position.z })
            .to({ x: targetX, z: targetZ }, JUMP_TIME)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(({ x, z }) => {
                this.body.position.setX(x);
                this.body.position.setZ(z);
            })
            .start();

        animateFrame();

        return distance;
    }

    /** 跳跃时 Y 轴方向的移动 */
    moveInY() {
        const { y } = this.body.position;
        // y 方向向上的时间
        const upTime = JUMP_TIME * 0.5;
        // y 方向向下的时间
        const downTime = JUMP_TIME - upTime;
        // 跳跃达到的高度
        const height = Box.defaultHeight + HIGH_JUMP;

        // 上升阶段，Quartic 表示平方
        const up = new TWEEN.Tween({ y })
            .to({ y: height }, upTime)
            .easing(TWEEN.Easing.Quartic.Out)
            .onUpdate(({ y }) => {
                this.body.position.setY(y);
            });

        // 下降阶段
        const down = new TWEEN.Tween({ y: height })
            .to({ y: Box.defaultHeight }, downTime)
            .easing(TWEEN.Easing.Quartic.In)
            .onComplete(() => { })
            .onUpdate(({ y }) => {
                this.body.position.setY(y);
            });

        // 上升 -> 下降
        up.chain(down).start();

        animateFrame();
    }
}

// TODO: 后续可以通过一个状态机来改造
LittleMan.State = {
    // 初始状态
    init: 1,
    // 蓄力
    accumulation: 1 << 1,
    // 跳跃
    jump: 1 << 2,
}

export default LittleMan