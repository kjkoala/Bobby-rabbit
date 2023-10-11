import { Actor, Color, Engine, Scene, vec } from "excalibur";
import { resources } from "src/app/resources";

export class EndGame extends Scene {
    background: Actor
    constructor() {
        super()
        this.background = new Actor({
            name: 'EndGame',
        })
    }
    onInitialize(engine: Engine): void {
        engine.backgroundColor = Color.Black
        const sprite = resources.GameEnd.toSprite()
        this.background.graphics.use(sprite)
        this.background.pos = vec(0, engine. halfCanvasHeight)
        engine.add(this.background)
    }
}