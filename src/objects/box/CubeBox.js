import * as THREE from 'three';
import Box from "./Box";

/**
 * 普通的正方体盒子
 */
export default class CubeBox extends Box {
    constructor(prev) {
        super(prev);
    }

    initBox() {
        const geometry = new THREE.BoxGeometry(this.size, this.height, this.size);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        geometry.translate(0, this.height / 2, 0);
        this.mesh = new THREE.Mesh(geometry, material);
    }

}