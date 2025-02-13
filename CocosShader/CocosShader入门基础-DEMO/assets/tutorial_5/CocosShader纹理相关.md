![](https://files.mdnice.com/user/21366/eaf4f594-5f67-4808-b3f5-783cdf30e391.png)
<center><font size=2 color=#9f9f9f>图片来自雪中悍刀行</font></center>

##  一、废话
*不想看废话的，可跳到第二节，从正文内容开始。*

麒麟子用于娱乐的时间不多，最喜欢做的事情就是看仙侠、古装剧。不为别的，就是喜欢那种花里胡哨的特效，还有仙气十足的主角们（当然，有些配角也挺好的）。

不难发现，影视领域的后期特效，也是大量的使用了图形算法的。

麒麟子保证，学完这个Shader教程，你也可以做出五毛以上的特效。

比如，在掌握本文的基础知识后，只需几行Shader代码，就可以写出下面这样效果：

![](https://files.mdnice.com/user/21366/8440efd1-88d5-4b0e-be62-cce834bcf6dd.gif)


时光飞逝，离上一篇文章《Cocos Shader入门基础四：Uniform与材质参数控制》的发布，仿佛就在15个月前。

本来以为，大家学完前四篇基础，就可以上手Cocos Shader了，后面的内容鸽掉也无所谓。

但就在这周，接到一个小姑娘的咨询，她需要使用Cubemap、多层纹理混合、UV流动以及边缘光等技术组合出一个渲染效果。

在交流的过程中，我感觉她对于一些概念没有完全理清，对Cocos Shader的effect文件语法以及Cocos Creator的材质系统不熟悉，导致在编写此Shader的时候，无法干净利落的排查故障和实现最终效果。

教一个人也是教，教一群人也是教。于是，打算补上这个基础篇的最后一篇。

>备注：她在网上也看了不少相关的文章和教程，但由于不是使用Cocos Creator进行教学，在学习完之后，使用过程中依然需要大量的时间进行摸索和验证。<br>这更印证了我之前设想的：使用Cocos Creator来教Shader编写，会更好。

不瞒大家说，终于要续写Shader系列了，我自己想想都激动。

基础篇之后，会按效果进行文章组织，由一篇或者多篇文章循序渐近完成一个效果的实现。

意思就是：开新坑了，敬请期待。

## 二、主要内容
在上一篇文章中，麒麟子就预告了本文内容。但是15个月前定的内容，显然是不适合这个高速发展的世界，况且Cocos Creator都3.4版本了，且即将发布3.4.1。

从本文开始，所有文章内容编写会切换到Cocos Creator 3.4版本。

结合了那位小姑娘需要的知识点，本文内容最终规划如下：

- Cocos Shader支持的纹理类型
- 在Cocos Shader中使用smapler2D
- 在Cocos Shader中使用smaplerCube
- 纹理采样方式
- 纹理过滤方式
- 纹理寻址方式
- 纹理流动
- 多重纹理混合
- 纹理扰动效果

最后我们会得到一个这样的东西


## 三、Cocos Shader支持的纹理类型
打开Cocos Creator官方文档`https://docs.cocos.com/creator/manual/zh/`，进入`图形渲染`->`材质系统`->`Pass Params`页面。滚动到底部，我们可以找到Cocos Shader编写时所支持的Uniform类型，如下图所示：

![](https://files.mdnice.com/user/21366/1fff3c8e-ebc9-47be-875a-3d432bca2640.png)

从截图中可以看出，我们支持`sampler2D`和`samplerCube`。
### 3.1 sampler2D
顾名思义，它可以用来声明一个2D纹理采样器。在Cocos Shader中，如果我们声明了这个类型的Uniform，就可以将一个2D纹理资源传递给它。
2D纹理资源的理解起来非常简单，我们常见的JPG,PNG图片，都是2D纹理资源。
也可以简单的理解为`普通纹理`。


### 3.2 samplerCube
它对应的是`Cubemap`（立方体贴图），用一个更贴切的描述叫：`立方体盒子贴图`。

可以想象一下，使用6张正方形的`2D纹理`，拼接成一个立方体盒子的样子。就得到了一个`Cubemap`。但是，为了便于查看，我们的Cubemap的显示方式，一般是以六面展开方式出现的。如下图所示：

![](https://files.mdnice.com/user/21366/e66ee96c-cf15-4eec-b226-228d29feeca8.png)

这个特征非常好记，下次再看到这样的图的时候，大家肯定都能识别啦。

## 四、在Cocos Shader中使用smapler2D
### 4.1、创建一个默认的Cocos Shader
新建一个Cocos Creator 3.4的项目，并在assets目录下，点击鼠标右键，在弹出的菜单中选择创建`着色器(Effect)`。如下图所示：

![](https://files.mdnice.com/user/21366/3192419e-e834-4552-9943-5fa3e589e551.png)

友情提示：新建的时候，建议选择`HelloWorld`模板，此模板提供了静态模型、带动画的模型、Cubemap等素材，方便大家学习使用。如下图所示：

![](https://files.mdnice.com/user/21366/453f7ac2-b144-4e1d-8fc5-48d47db316ca.png)

![](https://files.mdnice.com/user/21366/7304d1db-345e-44a0-b333-94ea220185c9.png)

### 4.2、创建一个材质，并使用刚创建的Effect
如下图所示，右键菜单中创建一个`材质`。
>额：有朋友问，物理材质是不是基于物理渲染的材质。不是的，物理材质是物理系统使用的材质，用于描述物体的物理属性。

![](https://files.mdnice.com/user/21366/591309ed-3fb7-4576-89f8-1e31247a693a.png)

选中新建的材质，在右边的属性面板（Inspector）中，将Effect切换为刚刚新建的。如下图所示：
![](https://files.mdnice.com/user/21366/1480962b-00b2-4fbd-b568-70620075b632.png)

切换后，右边的材质面板会多出一个绿色的勾，点击后将保存更改。

### 4.3、使用2D纹理
将一个2D纹理拖到MainTexture参数，会发现材质预览中的模型也会跟着改变外观。这里我使用了HelloWorld模板项目中自带的盾牌贴图，如下图所示：
![](https://files.mdnice.com/user/21366/5f9b6080-5d75-466e-accc-caf6fa8aad86.png)


### 4.4、Shader解析
默认的Shader中，在`properties`区域我们定义了一个`mainTexture`属性，此属性会出现在Inspector面板上。如下图所示：

![](https://files.mdnice.com/user/21366/c57ec16f-fe55-48f9-ae6d-507cc834b02d.png)

默认值为white，表示在我们不赋值的时候，它将是白色。

在fs中，使用语句`uniform sampler2D mainTexture`定义了一个类型为sampler2D的uniform。没错，这个`mainTexture`就是一个2D纹理。

最后我们使用`texture(mainTexture,v_uv)`在获取对应位置的像素颜色RGBA值。
![](https://files.mdnice.com/user/21366/bc49cce3-1db3-4924-bbe8-939abe31c555.png)

有人会问，v_uv是什么？它从哪里来的？。这个在本文最后几个小节中会讲，为了不影响理解，在这里先简单介绍一下。

![](https://files.mdnice.com/user/21366/b0fb0a00-89d0-4996-8ffe-4a26da76ee71.png)

如上图所示，我们使用[0,1]来表示纹理坐标。不管这个纹理的宽高是多少，我们永远使用[0,1]来表示。这样可使我们的运算可以和纹理分辨率脱离关系。

- 当v_uv为(0.5,0.5)的时候，刚好获取到中间的像素。
- 当v_uv为(0.0,0.0)的时候，刚好取到左上角的像素。
- 当v_uv为(1.0,1.0)的时候，刚好取到右下角的像素。

每一个顶点除了拥有位置颜色等信息，它还有一个纹理坐标信息。它表示此顶点对应的纹理位置。

>可能还有朋友会问，为什么新建的默认Shader没有unlit-vs呢？
>这是因为，大部分情况下，我们不需要改动vs，所以Cocos引擎提供了内置的general-vs供大家使用。路径为 `internal/chunks/general-vs.chunk`。
><br>下图中`general-vs:vert #builtin header`就是对它的引用。
>![](https://files.mdnice.com/user/21366/e769e562-03ff-4ffb-a4b5-ab350864c6c0.png)

如果我们想要自定义顶点Shader，只需将其复制过来修改即可。

## 五、在Cocos Shader中使用smaplerCube
为了节省时间，我们直接在默认Shader的基础上进行。
### 5.1 在properties中新增一个cubeTexture属性
![](https://files.mdnice.com/user/21366/a19310cf-c5f7-48e0-b314-5d2eccc7cbba.png)

### 5.2 在unlit-fs中新增一个samplerCube
在`uniform sampler2D mainTexture`的下方，增加`uniform samplerCube cubeTexture`，见下图中红色方框标记：

### 5.3 引入法线数据
添加`in vec3 v_normal`使我们可以使用法线数据。（法线是一个三维向量，用于表示顶点的朝向）
>注：这里添加一行代码就可以使用法线数据，是因为在general-vs中，已经输出了法线数据，详情请查看：`internal/chunks/general-vs.chunk`

### 5.4 获取Cubemap数据
在前面的知识介绍中，我们讲到了，Cubemap其实就是一个空心的立方体盒子。那我们如何获取它的信息呢？

假如我们的立方体盒子很大，我们在盒子中，朝某个方向发射出一条射线。射线最终会与立方体盒子形成交点。交点处的颜色值，就是我们想要的颜色值。

因此，立方体纹理采样函数的原型为`vec4 texture(samperCube cubemap,vec3 coord)`。
注：Shader中的`texture`函数有许多个重载，它会根据我们传入的数据类型挑选适合的函数原型。

最终采样函数见下图黄色标记。

![](https://files.mdnice.com/user/21366/e678fea8-29f3-47cc-81e9-4bf0026ce2df.png)

>补充说明：这里只是为了演示Cubemap的采样方式，并不是说实际项目中Cubemap就是使用法线进行采样的。常见的反射采样，是一般是采用视线的反射方向去采样。

### 5.5 使用材质
将`assets/skybox/sunnySkyBox`拖到材质的`CubeTexture`参数上。

![](https://files.mdnice.com/user/21366/b5368265-546e-400c-8784-65a8bc26b018.png)

在场景中新建一个球，并使用此材质，最终我们得到的效果如下：

![](https://files.mdnice.com/user/21366/afa881f6-ab3f-4458-97a3-019b8efe3cf5.png)

## 六、纹理采样方式
在assets窗口中，选择任意纹理，可在右边属性窗口中看到纹理相关的属性。

其中，`MinFilter`、`MagFilter`和`MipFilter`就是我们要讲的采样方式。如下图所示：

![](https://files.mdnice.com/user/21366/bf5a3547-99e3-40ef-8340-6bbe9f5f2e28.png)

在网上搜索不难发现，它们的含义如下：

`MinFilter`

- 缩小采样，用于纹理分辨率大于实际所需时

`MagFilter`
  - 放大时采样，用于纹理分辨经小于实际所需时

`MipFilter`
  -  Mipmap采样，用于Mipmap各级之间过渡时

不过，光有概念依然是较难理解的。我们用一个示例详细解释一下。

如下图所示，图1是正常视角，图2是摄像机拉远的视角，图3是摄像机拉近的视角。
![](https://files.mdnice.com/user/21366/68da7021-9d75-4d99-86b9-329ac47dd3b2.png)

现在我们把目光集中到角色上，可以很明显的发现，图2中，角色变小了，图3中角色变大了。
但是，我们图2和图3的角色，依然使用的是同一张贴图。也就是说，同样的纹理区域，在屏幕上显示大小是不同的。

假如角色纹理尺寸为512x512，图1是它的最佳视角。那么在图2中，由于纹理所占屏幕比例缩小了，为了保证较好的效果，纹理采样的时候就需要做缩小采样处理。在图3中，纹理所占屏幕比例变大了，纹理采样的时候就需要放大采样处理。

## 七、纹理过滤方式
采样过滤方式有两种
- 最近点过滤(`nearest`)
- 线性过滤(`linear`)。

**最近点过滤**就是选择最近的像素使用。如下图所示：

![](https://files.mdnice.com/user/21366/c86f5dd5-cd2a-4a56-92ba-9e42d41f6790.png)
<center><font size=2 color=#9f9f9f>最近点过滤（图片来源于网络）</font></center>

可以把纹理想象成一个由像素组成的格子，采样的时候，uv坐标落到哪个格子，就取哪个格子。

最近点过滤采样的优点是：性能好，没有额外运算。

有得必有失，最近点过滤采样的缺点是：不管是放大还是缩小，效果都不好。

**线性过滤**就是选择最近像素的2x2像素区域，进行加权混合。

![](https://files.mdnice.com/user/21366/4eac25ee-5d74-463d-b059-5e3a457bc832.png)
<center><font size=2 color=#9f9f9f>线性过滤（图片来源于网络）</font></center>

线性过滤相对于最近点采样过滤的优缺点，刚好相反。 线性过滤效果更好，但性能较低。

>经验：虽然线性过滤比最近点过滤性能低一点，但是大部分情况下都是采用线性过滤的。 因为最近点采样在很多时候是满足不了视觉要求的。


![](https://files.mdnice.com/user/21366/45f7ab03-8f95-4d3b-ba5f-f05bc8caa174.png)
<center><font size=2 color=#9f9f9f>两种方式比较（图片来源于网络）</font></center>


那`Mipmap`采样的意义何在呢？

说来也是尴尬，`Mipmap`出现的主要原因，是因为缩小过滤采样不能达到很好的效果。

当缩小不多的时候，`MinFilter`可以工作得很好。

但当`缩小达到一定比例`的时候，`MinFilter`就无能为力了。

缩小过多的像素会因为‘挤压’而产生摩尔纹。

`Mipmap`则是通过预先的较好的过滤采样算法，逐级生成小分辨率的纹理，从而避免像素‘挤压’问题。

>经验：一般用于2D Sprite的纹理不开启Mipmap，用于3D渲染的纹理需要开启Mipmap

## 八、纹理寻址方式
纹理寻址方式，主要是为uv坐标大于1.0的时候，提供相应的寻址策略。

Cocos提供了以下三种纹理寻址方式：
- 重复（`repeat`）
  - 可简单理解为，大于1.0的部分会被模除，仅保留小数部分。
- 边缘约束（`clamp-to-edge`）
  - 可以简单理解为，小于0.0时取0.0，大于1.0时取1.0。
- 镜像重复(`mirrored-repeat`)
  - 可以简单理解为，整数部分为偶数时，取小数部分。整数部分为奇数时，取 1.0减去小数部分。
  

三种纹理寻址的效果如下图所示：
![](https://files.mdnice.com/user/21366/25107bda-e99c-4f23-a2e9-c229aa157243.png)
<center><font size=2 color=#9f9f9f>左:repeat,中:clamp-to-edge,右:mirrored-repeat</font></center>

>经验：<br>
>1、当需要大面积的地砖、玻璃窗等重复效果时。使用`repeat`模式，并且调节`uv` tilling，可以有效降低纹理分辨率，节省显存。<br>
>2、clamp-to-edge可确保边缘干净。<br>
>3、mirrred-repeat是一个特殊的repeat，使用场合不多，可按需使用。<br>
>4、3D纹理默认为repeat。<br>
>5、repeat在一些低端API上（如WebGL 1.0)要求纹理尺寸为2幂。所以，尽可能使用2幂，以增强兼容性。

这里补充说明一个标准材质上与寻址有关的属性TilingOffset，如下图所示：
![](https://files.mdnice.com/user/21366/53aa3e4b-98eb-46ab-8f55-84e19a23c426.png)
TilingOffset顾名思义，它负责调节UV的Tiling和Offset。

其中，xy分量用于调节Tiling，xy的值会和uv相乘，使得uv值变大或者变小。

如上图所示，我将它们设置为3，在repeat模式下，就会重复3次。

zw分量用于调节Offset，zw的值会和uv相加，值得uv值产生偏移。

下图是我将zw都设置为了0.3的效果。

![](https://files.mdnice.com/user/21366/d9120b7a-01df-43f6-8dc1-e266ba5aaaa0.png)

可能一些认真学习的小伙伴就要问了：那在Cocos中，如何修改一个纹理的寻址方式呢？

如果是用于3D的纹理，在assets中选中后，右边的Inspector属性窗口就会显示出纹理相关属性。修改`Wrap Mode S`和`Wrap Mode T`即可。这个`S`和`T`就是我们说的`UV`。

![](https://files.mdnice.com/user/21366/aba70aa7-c6d4-4e04-979f-aab1e520f004.png)

>经验：如果想要修改`sprite`的纹理寻址方式，只需在`assets`窗口中展开`sprite`的资源内容，并选中`sprite`内容中的`texture`即可。

## 九、纹理流动

## 十、多重纹理混合

## 十一、纹理扰动效果

## 十二、一个完整的材质
