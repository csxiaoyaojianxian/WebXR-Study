
import { _decorator, Component, Node, CCFloat, MeshRenderer, v2, Vec2 } from 'cc';
const { ccclass, property,executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = Scaling
 * DateTime = Tue Feb 22 2022 15:48:42 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = Scaling.ts
 * FileBasenameNoExtension = Scaling
 * URL = db://assets/components/Scaling.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('Scaling')
export class Scaling extends Component {
    // [1]
    // dummy = '';

    @property({type:[Vec2]})
    range = v2(0.0,1.0);

    @property({type:CCFloat})
    lifeTime = 1000;

    private _meshRenderer:MeshRenderer;

    start () {
        // [3]
        this._meshRenderer = this.node.getComponent(MeshRenderer);
    }

    private _lastTime = Date.now();
    update (deltaTime: number) {
         // [4]
         let factor = (Date.now() - this._lastTime) / this.lifeTime;
         if(factor > 1.0){
            this._lastTime = Date.now();
            factor = 1.0;
         }
         let scale = (this.range.y - this.range.x) * factor + this.range.x;
         this.node.setScale(scale,scale,scale);
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
