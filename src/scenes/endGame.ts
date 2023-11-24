import { Actor, Color, Engine, Scene, vec } from "excalibur";
import { resources } from "src/app/resources";
import { DEFAULT_VOLUME } from "src/common/constants";
import { getMusicStatus } from "src/common/getMusicStatus";
import EndGameSceneGUI from "src/ui/EndGameGUI.svelte";
import { Menu } from "./mainMenu";

export class EndGameScene extends Scene {
    background: Actor
    endScene!: EndGameSceneGUI
    constructor() {
        super()
        this.background = new Actor({
            name: 'EndGame',
        })
    }
    onInitialize(engine: Engine): void {
        this.endScene = new EndGameSceneGUI({
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
        resources.mp3End.stop();
        this.endScene.$destroy();
        this.engine.removeScene(this);
      }

      goToMenu() {
          this.engine.addScene('menu', new Menu)
          this.engine.goToScene('menu')
      }
}