
import { _decorator, Component, Node, MeshRenderer, v4, CCFloat, Mesh } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = ClipPlaneCtrl
 * DateTime = Mon Feb 21 2022 23:24:17 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = ClipPlaneCtrl.ts
 * FileBasenameNoExtension = ClipPlaneCtrl
 * URL = db://assets/tutorial_6/ClipPlaneCtrl.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('ClipPlaneCtrl')
@executeInEditMode(true)
export class ClipPlaneCtrl extends Component {
    // [1]
    // dummy = '';

    @property({type:[MeshRenderer]})
    targets: MeshRenderer[] = [];

    // [2]
    @property({type:CCFloat})
    clipPlaneBase = 0;

    @property({type:CCFloat})
    timeScale = 1;


    @property({type:CCFloat})
    clipScale = 1;

    start () {

    }

    private _clipPlane = v4(0.0,1.0,0.0,0.0);
    update (deltaTime: number) {
        this._clipPlane.w = this.clipPlaneBase + Math.sin(Date.now() * 0.001 * this.timeScale) * this.clipScale;
        for(let i = 0; i < this.targets.length; ++i){
            let meshRenderer = this.targets[i];
            meshRenderer.sharedMaterial.setProperty('clipPlane',this._clipPlane);
        }
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
