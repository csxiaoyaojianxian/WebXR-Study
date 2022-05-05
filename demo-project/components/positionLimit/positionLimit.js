/*
 * @Author: victorsun
 * @Date: 2022-05-04 17:08:06
 * @LastEditors: victorsun
 * @LastEditTime: 2022-05-05 22:51:11
 * @Descripttion: 空间限制组件，建议加到 camera 上
 */
AFRAME.registerComponent('position-limit', {
  schema: {
    maxPos: {
      type: 'vec3',
      default: { x: 5, y: 10, z: 5 },
    },
    minPos: {
      type: 'vec3',
      default: { x: -5, y: 0, z: -5 },
    }
  },
  init() {
    // 摄像机边界
    this.update();

    // this.tick = AFRAME.utils.throttleTick(this.tick, 100, this);
  },
  update() {
    this.maxX = this.data.maxPos.x;
    this.minX = this.data.minPos.x;
    this.maxY = this.data.maxPos.y;
    this.minY = this.data.minPos.y;
    this.maxZ = this.data.maxPos.z;
    this.minZ = this.data.minPos.z;
  },
  tick: function () {
    if (this.el.object3D.position.x > this.maxX) {
      this.el.object3D.position.x = this.maxX;
      console.log('到达+X边界', this.el.object3D.position.x, this.maxX);
    } else if (this.el.object3D.position.x < this.minX) {
      this.el.object3D.position.x = this.minX;
      console.log('到达-X边界', this.el.object3D.position.x, this.minX);
    }
    if (this.el.object3D.position.y > this.maxY) {
      this.el.object3D.position.y = this.maxY;
      console.log('到达+Y边界', this.el.object3D.position.y, this.maxY);
    } else if (this.el.object3D.position.y < this.minY) {
      this.el.object3D.position.y = this.minY;
      console.log('到达-Y边界', this.el.object3D.position.y, this.minY);
    }
    if (this.el.object3D.position.z > this.maxZ) {
      this.el.object3D.position.z = this.maxZ;
      console.log('到达+Z边界', this.el.object3D.position.z, this.maxZ);
    } else if (this.el.object3D.position.z < this.minZ) {
      this.el.object3D.position.z = this.minZ;
      console.log('到达-Z边界', this.el.object3D.position.z, this.minZ);
    }
  }

});