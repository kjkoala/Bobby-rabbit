import { Actor, Color, Engine, Scene, vec } from "excalibur";
import { resources } from "src/app/resources";
import { DEFAULT_VOLUME } from "src/common/constants";
import { getMusicStatus } from "src/common/getMusicStatus";
import EndGameScene from "src/ui/EndGame.svelte";

export class EndGame extends Scene {
    background: Actor
    endScene: EndGameScene
    constructor() {
        super()
        this.background = new Actor({
            name: 'EndGame',
        })
    }
    onInitialize(engine: Engine): void {
        this.endScene = new EndGameScene({
            target: document.querySelector('#root')!,
            props: {
                scene: this
            }
        })
        engine.backgroundColor = Color.Black
        const sprite = resources.GameEnd.toSprite()
        this.background.graphics.use(sprite)
        this.background.pos = vec(engine.halfDrawWidth, engine.halfDrawWidth)
        engine.add(this.background)

        if (getMusicStatus()) {
            resources.mp3End.play(DEFAULT_VOLUME)
          }
    }

    onDeactivate() {
        this.engine.removeScene(this);
        resources.mp3End.stop();
      }
}