
import { _decorator, Component, Node, CCFloat, Vec2, v2, MeshRenderData, MeshRenderer, Vec4, v4 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = AlphaFading
 * DateTime = Tue Feb 22 2022 15:39:08 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = AlphaFading.ts
 * FileBasenameNoExtension = AlphaFading
 * URL = db://assets/components/AlphaFading.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('AlphaFading')
export class AlphaFading extends Component {
    // [1]
    // dummy = '';

    @property({type:[Vec2]})
    range = v2(0.0,1.0);

    @property({type:CCFloat})
    lifeTime = 1000;

    private _meshRenderer:MeshRenderer;

    private _lastTime = Date.now();
    start () {
        this._meshRenderer = this.node.getComponent(MeshRenderer);
    }

    private _mainColor:Vec4 = v4(1.0,1.0,1.0,1.0);
    update (deltaTime: number) {
         // [4]
         let alpha = (Date.now() - this._lastTime) / this.lifeTime;
         if(alpha > 1.0){
            this._lastTime = Date.now();
            alpha = 1.0;
         }
         alpha = (this.range.y - this.range.x) * alpha + this.range.x;
         this._mainColor.w = alpha;
         this._meshRenderer.material.setProperty('mainColor',this._mainColor);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
