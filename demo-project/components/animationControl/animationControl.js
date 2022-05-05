/*
 * @Author: victorsun
 * @Date: 2022-05-05 16:55:28
 * @LastEditors: victorsun
 * @LastEditTime: 2022-05-05 17:19:42
 * @Descripttion: 
 */
AFRAME.registerComponent('animation-control', {
  schema: {
    target: { type: 'selector', default: '' },
    clip: { type: 'string', default: '' },
    duration: { type: 'string', default: '3' },
    loop: { type: 'string', default: 'once' },
  },
  init() {
    const { target, clip, duration, loop } = this.data;
    const model = target;
    this.el.addEventListener('click', () => {
      model.removeAttribute("animation-mixer");
      model.setAttribute("animation-mixer", AFRAME.utils.styleParser.stringify({clip, duration, loop}));
    });
  }
});