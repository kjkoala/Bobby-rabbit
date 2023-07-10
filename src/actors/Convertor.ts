import { Actor, CollisionType, Engine, Vector, vec } from "excalibur";
import { convertorLeftAnim, convertorRightAnim } from "src/animations/Convertor";

export class Convertor extends Actor {
    direction: 'Left' | 'Right' | 'Up' | 'Down' | string;
    constructor(x: number, y: number, direction: 'Left' | 'Right' | 'Up' | 'Down' | string) {
        super({
            name: 'Convertor',
            width: 16,
            height: 16,
            pos: vec(x, y - 16),
            anchor: Vector.Zero,
            z: 9,
            collisionType: CollisionType.Passive,
        })
        this.direction = direction
    }

    onInitialize(_engine: Engine): void {
        this.graphics.add('Left', convertorLeftAnim)
        this.graphics.add('Right', convertorRightAnim)
        this.graphics.use(this.direction)
    }
}