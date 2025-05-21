import {EventEmitter} from "eventemitter3";

export class EventService {
    private readonly _eventEmitter: EventEmitter;

    constructor() {
        this._eventEmitter = new EventEmitter();
    }

    get eventEmitter(): EventEmitter {
        return this._eventEmitter;
    }
}

export const eventService = new EventService();
