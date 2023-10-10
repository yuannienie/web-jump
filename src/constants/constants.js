// 为了方便计算，任何大小的屏幕下，宽度都是基础宽
export const BASE_WIDTH = 100;

// canvas 大小
export const CLIENT_HEIGHT = window.innerHeight;
export const CLIENT_WIDTH = CLIENT_HEIGHT * 3 / 5;

// 视图的大小
export const WIDTH = BASE_WIDTH;
export const HEIGHT = CLIENT_HEIGHT / CLIENT_WIDTH * BASE_WIDTH;

// 远近值取宽高中大的那个
export const FAR = WIDTH > HEIGHT ? WIDTH : HEIGHT;

// 开发模式
export const DEV = true;
