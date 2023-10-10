import * as THREE from 'three';
import CubeBox from './CubeBox';
import { animateFrame } from '../../util/TweenUtil';
import TWEEN from '@tweenjs/tween.js';

/**
 * 管理 Box 的一个类，本质是一个 Group。
 * 因为新 Box 的放置位置是基于前面盒子的位置来移动的
 * 所以借助 BoxGroupManager 的双向链表结构维持前后盒子相互引用的关系，从而方便定位
 * 此外创建、更新 Box 皆借助该类实现。
 * 
 */
export default class BoxGroupManager {
    constructor() {
        // 上一个盒子引用
        this.last = null;
        this.group = new THREE.Group();
    }

    createBox() {
        let box;
        // 开始的两个盒子直接使用 CubeBox
        if (!this.last || !this.last.prev) {
            box = new CubeBox(this.last);
        }

        this.last = box;
        this.group.add(box.mesh);
        return this.last;
    }

    // 放置新盒子后需要改变观测位置：
    // 1. 盒子不动，改变相机的位置，保证相机位置始终看向两个盒子的中点
    // 2. 相机不动，改变盒子位置，根据相对运动移动整条链上的所有盒子
    // 这里采用的第二种方法
    updatePosition({ duration = 50 }) {
        // 找到最后两个盒子的中点
        const last = this.last;
        const secondLast = last.prev;
        const centerX = 0.5 * (last.position.x + secondLast.position.x);
        const centerZ = 0.5 * (last.position.z + secondLast.position.z);
        let lastX = 0;
        let lastZ = 0;
        // 配置动画参数并开始
        new TWEEN.Tween({ x: 0, z: 0 })
            .to({ x: centerX, z: centerZ }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(({ x, z }) => {
                const deltaX = x - lastX;
                const deltaZ = z - lastZ;
                // 更新盒子
                this.updateBoxPositionInChain(deltaX, deltaZ);
                lastX = x;
                lastZ = z;
            })
            .start();

        animateFrame();
    }

    // 根据入参改变链路上的所有 Box 的位置
    updateBoxPositionInChain(deltaX, deltaZ) {
        let tail = this.last;
        while (tail) {
            const { x, z } = tail.position;
            const position = {
                x: x - deltaX,
                z: z - deltaZ
            };

            tail.updateXZPosition(position);
            tail = tail.prev;
        }
    }
}