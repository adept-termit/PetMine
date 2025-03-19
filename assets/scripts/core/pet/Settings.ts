import {_decorator, CCInteger, Component, Node} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('settings')
export class settings extends Component {
    @property({type: CCInteger}) damage: number = 1;
}


