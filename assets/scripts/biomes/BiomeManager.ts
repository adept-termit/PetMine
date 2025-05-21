import {_decorator, CCFloat, CCInteger, Component, Node, Vec3} from 'cc';
import {poolService} from "db://assets/scripts/core/utils/PoolService";
import {Generate} from "db://assets/scripts/biomes/Generate";
import {loadJson} from "db://assets/scripts/core/utils/ResourcesLoader";
import {BiomeBlockMap} from "db://assets/scripts/biomes/WorldData";

const {ccclass, property} = _decorator;

@ccclass('BiomeManager')
export class BiomeManager extends Component {
    @property({type: Generate}) generate: Generate;
    @property({type: Vec3}) pos: Vec3;
    @property({type: Node}) blocks: Node;
    @property({type: Node}) chunk: Node;
    @property({type: CCInteger}) width: number = 7;
    @property({type: CCInteger}) height: number = 20;

    private biomeName: string;
    private blockRarity: object;

    start() {

    }

    update(deltaTime: number) {

    }

    async init(biomeName: string) {

        this.biomeName = biomeName;

        const blockRarity: BiomeBlockMap = await loadJson<BiomeBlockMap>('biomes/blockRarity');

        this.blockRarity = blockRarity[this.biomeName]

        //создаем пулл блоков
        poolService.init(this.blocks);

        //генерируем биом
        this.generate.init(this.chunk, this.blockRarity,this.biomeName, this.width, this.height);
    }
}


