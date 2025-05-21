import {TPlayerProgress} from "db://assets/scripts/core/storage/TPlayerProgress";

const STORAGE_KEY = 'bp-save';

class GameLocalStorage {
    save(value: TPlayerProgress): void {
        const serializedValue = JSON.stringify(value);

        localStorage.setItem(STORAGE_KEY, serializedValue);
    }

    load() {
         localStorage.clear();
        const saves = localStorage.getItem(STORAGE_KEY);

        return saves ? JSON.parse(saves) as TPlayerProgress : null;
    }
}

export const gameLocalStorage = new GameLocalStorage();
