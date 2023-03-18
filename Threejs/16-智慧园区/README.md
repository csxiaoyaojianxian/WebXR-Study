# 智慧园区

## 1. 场景搭建

导入hdr纹理，设置 scene 的 background 和 environment

注意使用圆柱体映射，默认为 cube

添加平行光

## 2. 导入相机模块

用于存储不同相机，便于切换

在 mesh 模块中从 gltf.cameras 中添加模型中定义的相机

## 3. 导入控制器

监听控制器模式切换：轨道预览模式、飞行预览模式、第一人称模式

设置垂直最大/最小旋转角度 PolarAngle，水平旋转角为 AzimuthAngle

## 4. 导入渲染器

注意设置：

logarithmicDepthBuffer 对数深度缓冲属性，避免草地、平面距离太近导致的闪烁

physicallyCorrectLights 使用物理正确光照，影响性能，但效果好

打开阴影计算并调节HDR场景的渲染曝光程度 toneMappingExposure

## 5. 初始化相关

监听尺寸更新，更新摄像机的投影矩阵

## 6. 模型导入

使用 GLTFLoader、DRACOLoader，注意glb模型需要设置draco加载器位置

设置 scene

场景子元素遍历 gltf.scene.traverse((child) => {});

播放相关动画、设置部分元素的 visible 状态

