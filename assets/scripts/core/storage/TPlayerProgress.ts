export type TItems = {
    dynamite: number;
    boxOfTNT: number;
    zoneMagnet: number;
};

export type TGiftboxes = {
    item: number;
    gadget: number;
    super: number;
};

export type TWallet = {
    crystal: number;
    dollar: number;
    gold: number;
    epic: number;
};

export type TPets = {
    name: string;
    customName: string;
    count: number;
};

export type TSelected = {
    skin: string;
    pets: string[];
    pickaxe: string;
    gadgets: string[];
};

export type TPlayerProgress = {
    inventory: {
        items: TItems,
        giftboxes: TGiftboxes,
        misc: {
            goldKeys: number,
            epicKeys: number,
        }
    },
    wallet: TWallet;
    pets: TPets[];
    selected: TSelected,
    gadgets: string[];
    pickaxes: string[];
    biomes: string[];
    skin: string[];
    openSlotPets: number;
};

export const EMPTY_PLAYER_PROGRESS: TPlayerProgress = {
    inventory: {
        items: null,
        giftboxes: null,
        misc: {
            goldKeys: null,
            epicKeys: null,
        }
    },
    wallet: null,
    pets: null,
    selected: {
        skin: null,
        pets: ['default'],
        pickaxe: 'default',
        gadgets: []
    },
    gadgets: null,
    pickaxes: null,
    biomes: ['forest'],
    skin: null,
    openSlotPets: 3,
}