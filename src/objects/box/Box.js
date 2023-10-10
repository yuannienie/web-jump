import { BOX_COLORS, BOX_MAX_DISTANCE, BOX_MAX_SIZE, BOX_MIN_DISTANCE, BOX_MIN_SIZE } from "../../constants/constants";
import TWEEN from '@tweenjs/tween.js';
import { animateFrame } from '../../util/TweenUtil';

/**
 * Box 为小人跳跃时站立的盒子基类，具有随机的颜色和大小
 * 因为小人的移动总是沿着 X 正半轴或者 Z 负半轴，所以盒子的放置位置也仅限于此
 * Box 是一个双向链表的节点
 * 
 */
class Box {
    constructor(prev) {
        // 上一个盒子的引用
        this.prev = prev;
        if (prev) {
            prev.next = this;
        }
        // 盒子颜色
        this.color = 0x000000;
        // 盒子大小（长宽）
        this.size = 0;
        // 盒子高度，会随着小人蓄力弹跳而变化
        this.height = Box.defaultHeight;
        // 盒子位置
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        // 下一个盒子出现的方向 x | z，第一个盒子默认是 x 方向
        this.direction = 'x';
        // 下一个盒子与当前盒子的距离
        this.distance = 0.5 * (BOX_MAX_DISTANCE + BOX_MIN_SIZE);
        // 盒子网格
        this.mesh = null;

        this.init();
    }

    init() {
        this.initSize();
        this.initColor();
        this.initDirection();
        this.initDistance();
        this.initPosition();

        this.initBox();

        this.configBox();
    }

    // 初始化盒子大小
    initSize() {
        // 前两个盒子大小固定
        if (!this.prev || !this.prev.prev) {
            this.size = BOX_MAX_SIZE;
            return;
        }

        this.size = Math.round(Math.random() * (BOX_MAX_SIZE - BOX_MIN_SIZE)) + BOX_MIN_SIZE;
    }

    // 初始化盒子颜色
    initColor() {
        this.color = BOX_COLORS[Math.floor(Math.random() * BOX_COLORS.length)];
    }

    // 初始化盒子放置方向
    initDirection() {
        if (!this.prev) return;
        // 不是第一个盒子，随机方向
        const isEqualToZero = Math.round(Math.random()) === 0;
        if (isEqualToZero) this.direction = 'x';
        else this.direction = 'z';
    }

    // 距离
    initDistance() {
        if (!this.prev) return;
        // 不是第一个盒子，随机距离
        this.distance = Math.round(BOX_MIN_DISTANCE + Math.random() * (BOX_MAX_DISTANCE - BOX_MIN_SIZE));
    }

    // 位置
    initPosition() {
        if (!this.prev) return;
        const { size: prevSize, position: prevPosition, direction, distance } = this.prev;
        const { x, z } = prevPosition;

        // 盒子向 X 正半轴 或 Z 负半轴方向移动
        if (direction === 'x') {
            this.position.x = x + prevSize / 2 + distance + this.size / 2;
            this.position.z = z;
        } else {
            this.position.z = z - prevSize / 2 - distance - this.size / 2;
            this.position.x = x;
        }
    }

    updateXZPosition({ x, z }) {
        this.position.x = x;
        this.position.z = z;
        this.mesh.position.setX(x);
        this.mesh.position.setZ(z);
    }

    // 继承类实现的方法
    initBox() { }

    // 配置盒子属性
    configBox() {
        const { x, y, z } = this.position;
        // 阴影贴图
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // 设置位置
        this.mesh.position.setX(this.position.x);
        this.mesh.position.setZ(this.position.z);

        // 首个和第二个没有动画
        if (!this.prev || !this.prev.prev) {
            // 设置物体位置
            this.mesh.position.set(x, y, z);
        } else {
            // 盒子的入场动画
            new TWEEN.Tween({ y: 10 }).to({ y: 0 }, 400)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate(({ y }) => {
                    this.mesh.position.setY(y);
                })
                .start();

            animateFrame();
        }
    }
}

Box.defaultHeight = BOX_MAX_SIZE / 2;

export default Box;