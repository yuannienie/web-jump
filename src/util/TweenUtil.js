import TWEEN from '@tweenjs/tween.js'

// 每次动画 update 都要做的事情
// 本例中绑定了 render 函数
let frameAction = () => { };

/** 
 * 这里设置一个简单的锁标记位 running，防止多个动画多次调用 raf
 * TWEEN 是个全局变量 update 方法会作用于所有动画
 * 
 * */
const animateFrame = function () {
  if (animateFrame.running) return;
  animateFrame.running = true;

  const animate = () => {
    const id = requestAnimationFrame(animate);
    const success = TWEEN.update();
    if (success) {
      frameAction?.();
    } else {
      animateFrame.running = false;
      cancelAnimationFrame(id);
    }
  };
  animate()
};

const setFrameAction = (cb) => {
  frameAction = cb;
};

export {
  animateFrame,
  setFrameAction
}
