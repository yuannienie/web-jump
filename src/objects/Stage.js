import * as THREE from 'three';
import { CLIENT_HEIGHT, CLIENT_WIDTH, DEV, FAR, HEIGHT, WIDTH } from '../constants/constants';
// DEBUG 时候用的视角控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';

export default class Stage {
  constructor() {
    // 渲染器
    this.renderer = null;
    // 场景
    this.scene = null;
    // 平行光
    this.shadowLight = null;
    // 相机
    this.camera = null;
    // 平面
    this.plane = null;
    // 轨道控制器
    this.controls = null;
    // 性能监控
    this.stats = null;
    this.init();
  }

  init() {
    this.createScene();
    this.createRenderer();
    this.createLight();
    this.createCamera();
    this.createPlane();
    if (DEV) this.createStats();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(CLIENT_WIDTH, CLIENT_HEIGHT);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xD6DBDF);
    this.scene.updateMatrixWorld(true);
    if (DEV) {
      // 坐标辅助线
      this.scene.add(new THREE.AxesHelper(FAR))
    }
  }

  createLight() {
    // 环境光会均匀的照亮场景中的所有物体，它不能用来投射阴影，因为它没有方向
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    // 平行光，平行光可以投射阴影
    this.shadowLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    // 设定光照源方向，目标默认是原点
    // 这个大小无意义，只代表方向
    this.shadowLight.position.set(FAR / 6, FAR / 2, FAR / 6);
    // 开启阴影投射
    this.shadowLight.castShadow = true;

    // 定义可见域的投射阴影
    this.shadowLight.shadow.camera = new THREE.OrthographicCamera(-WIDTH * 1.5, WIDTH * 1.5, HEIGHT, -HEIGHT, 0, 2 * FAR);
    this.shadowLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

    this.scene.add(ambientLight);
    this.scene.add(this.shadowLight);
  }

  createCamera() {
    // 相机使用正交相机
    // 相机是椎体的宽度和高度尽量和界面大小一致
    this.camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, -FAR / 4, FAR * 2);

    // 相机位置超过最大物体
    // 斜向右下看
    // FAR 表示 WIDTH 和 HEIGHT 的最大值，作为场景深度
    this.camera.position.set(-FAR / 2, FAR / 2, FAR / 2);
    this.camera.lookAt(0, 0, 0);
    if (DEV) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.autoRotate = true;
    }
  }

  createPlane() {
    // 创建一个足够大的地面
    // 由于视角是 45 度向下看，地面会比实际的大，这里简单处理下
    const geometry = new THREE.PlaneGeometry(2 * FAR, 2 * FAR, 1, 1);
    // ShadowMaterial 阴影材质, 此材质可以接收阴影
    // transparent：透明，在非透明对象之后渲染
    // opacity: 透明度
    const material = new THREE.ShadowMaterial({ transparent: true, opacity: 0.5 });
    this.plane = new THREE.Mesh(geometry, material);
    // 接收阴影
    this.plane.receiveShadow = true;
    // 旋转 -90，此时地面处在 x-z 平面
    this.plane.rotation.x = -Math.PI / 2;
    if (DEV) {
      const box = new THREE.BoxHelper(this.plane);
      this.scene.add(box);
    }
    this.scene.add(this.plane)
  }

  // 性能监控
  createStats() {
    this.stats = new Stats();
    //设置统计模式
    // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.showPanel(0);
    //将统计对象添加到 body 元素中
    document.body.appendChild(this.stats.dom);
  }

  render() {
    const { scene, camera, renderer, stats } = this;
    function animate() {
      if (DEV) stats.begin();
      renderer.render(scene, camera);
      if (DEV) stats.end();
      requestAnimationFrame(animate);
    }
    animate();
  }
}