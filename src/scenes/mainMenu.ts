import { Engine, Scene, type SceneActivationContext } from "excalibur";
import MenuUI from "src/ui/MenuUI.svelte"
import { Level } from "./level";
import { carrotsMaps, eggsMaps } from "src/app/main";
import { DEFAULT_VOLUME, carrots_levels, eggs_levels, getLevelsLocalStorage } from "src/common/constants";
import { resources } from "src/app/resources";
import type { TiledMapResource } from "@excaliburjs/plugin-tiled";

export class Menu extends Scene {
    menu!: MenuUI
    constructor() {
        super()
    }
    onInitialize(_engine: Engine): void {
        this.toggleMainMusic(true)
        this.menu = new MenuUI({
            target: document.querySelector('#root')!,
            props: {
                menu: this
            }
        })
    }
    
    onDeactivate(_context: SceneActivationContext<undefined>): void {
        this.toggleMainMusic(false);
        this.menu.$destroy();
        this.engine.removeScene(this);
    }
    
    toggleMainMusic(toggle: boolean) {
        if(toggle) {
            resources.mp3Title.loop = true;
            resources.mp3Title.play(DEFAULT_VOLUME)
        } else {
            resources.mp3Title.stop()
        }
    }

    startLevel(world: TiledMapResource[], lvl: number) {
        this.engine.addScene('level', new Level(world, lvl))
        this.engine.goToScene('level');
    }

    continueGame() {
        const levels = getLevelsLocalStorage(carrots_levels)
        if (levels.length > 0 && levels.at(-1)?.level) {
            this.startLevel(carrotsMaps, levels.at(-1)!.level + 1)
        }
        return false
    }

    startEggsNewGame() {
        localStorage.removeItem(eggs_levels)
        this.startLevel(eggsMaps, 0)
    }

    startCarrotsNewGame () {
        localStorage.removeItem(carrots_levels);
        this.startLevel(carrotsMaps, 0);
    }
}