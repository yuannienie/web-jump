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

// 盒子大小
export const BOX_MAX_SIZE = WIDTH > HEIGHT ? HEIGHT / 3 : WIDTH / 3;
export const BOX_MIN_SIZE = WIDTH > HEIGHT ? HEIGHT / 8 : WIDTH / 8;

// 两个盒子之间距离
export const BOX_MAX_DISTANCE = WIDTH > HEIGHT ? HEIGHT / 2 : WIDTH / 2;
export const BOX_MIN_DISTANCE = WIDTH > HEIGHT ? HEIGHT / 8 : WIDTH / 8;

// 盒子颜色集合
export const BOX_COLORS = [0Xfa541c, 0xfaad14, 0x13c2c2, 0x1890ff, 0x722ed1, 0xFFFFFF, 0xa0d911];
