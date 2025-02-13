
import { _decorator, Component, Node, RenderTexture, view, screen } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = RTReiszer
 * DateTime = Thu Mar 10 2022 22:42:34 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = RTReiszer.ts
 * FileBasenameNoExtension = RTReiszer
 * URL = db://assets/components/RTReiszer.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('RTReiszer')
export class RTReiszer extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property({type:RenderTexture})
    rt:RenderTexture;


    start () {
        let dpr = screen.devicePixelRatio;
        dpr = Math.min(dpr,1.5);
        let width = screen.windowSize.width * dpr;
        let height = screen.windowSize.height * dpr;
        let ratio = width / height;
        if(width > 2048){
            width = 2048;
            height = ~~width/ratio;
        }
        if(height > 2048){
            height = 2048;
            width = ~~height * ratio;
        }
        this.rt.resize(width,height);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
