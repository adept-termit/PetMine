import {Pet} from "db://assets/scripts/pets/Pet";

export abstract class PetStateBase {
    protected pet: Pet;

    constructor(pet: Pet) {
        this.pet = pet;
    }

    enter(): void {}
    update(dt: number): void {}
    exit(): void {}
}
