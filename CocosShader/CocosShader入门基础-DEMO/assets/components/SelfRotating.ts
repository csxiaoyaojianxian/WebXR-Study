
import { _decorator, Component, Node, Details, Vec3, v3 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = SelfRotating
 * DateTime = Sun Feb 13 2022 22:46:57 GMT+0800 (China Standard Time)
 * Author = 麒麟子
 * FileBasename = SelfRotating.ts
 * FileBasenameNoExtension = SelfRotating
 * URL = db://assets/tutorial/components/SelfRotating.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('SelfRotating')
export class SelfRotating extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property({ type: Vec3 })
    rotationalSpeed: Vec3 = v3(0, 0, 0);

    start() {
        // [3]
    }

    update(deltaTime: number) {
        let euler = this.node.eulerAngles;
        let rx = (euler.x + deltaTime * this.rotationalSpeed.x) % 360;
        let ry = (euler.y + deltaTime * this.rotationalSpeed.y) % 360;
        let rz = (euler.z + deltaTime * this.rotationalSpeed.z) % 360;
        this.node.setRotationFromEuler(rx, ry, rz);
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
