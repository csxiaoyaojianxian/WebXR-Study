
import { _decorator, Component, Node, game } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Lock
 * DateTime = Thu Mar 10 2022 22:31:40 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = Lock.ts
 * FileBasenameNoExtension = Lock
 * URL = db://assets/components/Lock.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('LockFramerate')
export class LockFramerate extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        // [3]
        game.frameRate = 30;
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
