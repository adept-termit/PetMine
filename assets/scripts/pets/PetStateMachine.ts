import { _decorator, Component, Node } from 'cc';

import {eventService} from "db://assets/scripts/core/utils/EventService";
import {PetFollowerSystem} from "db://assets/scripts/pets/states/PetFollowerSystem";
import {PetMinerSystem} from "db://assets/scripts/pets/states/PetMinerSystem";
const { ccclass, property } = _decorator;

@ccclass('PetStateMachine')
export class PetStateMachine extends Component {
    @property(Node) petsRoot: Node;

    private _currentSystem: PetFollowerSystem | PetMinerSystem = null;
    private _target: Node = null;

    onEnable() {
        eventService.eventEmitter.on("PETS_SET_STATE", this.setState, this);
    }

    onDisable() {
        eventService.eventEmitter.off("PETS_SET_STATE", this.setState, this);
    }

    setTarget(target: Node) {
        this._target = target;
    }

    setState(state: "follow" | "mine") {
        // console.log(state)
        // console.log(this.petsRoot.getWorldPosition())
        // console.log(this._target.getWorldPosition())
        // if (state === "follow") {
        //     this._currentSystem = new PetFollowerSystem(this.petsRoot, this._target);
        // } else {
        //     this._currentSystem = new PetMinerSystem(this.petsRoot);
        // }
    }

    update(dt: number) {
        this._currentSystem?.update(dt);
    }
}
