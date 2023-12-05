import { Engine, Scene, type SceneActivationContext } from "excalibur";
import MenuUI from "src/ui/MenuUI.svelte"
import { Level } from "./level";
import { carrotsMaps, eggsMaps } from "src/app/main";
import { DEFAULT_VOLUME, carrots_levels, eggs_levels, getLevelsLocalStorage } from "src/common/constants";
import { resources } from "src/app/resources";
import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { getMusicStatus } from "src/common/getMusicStatus";
import VKBridge from "src/common/VKBridge";

type TypeLevels = 'carrots_levels' | 'eggs_levels'
export class Menu extends Scene {
    menu!: MenuUI
    constructor() {
        super()
    }
    onInitialize(_engine: Engine): void {
        this.toggleMusic(getMusicStatus());
        this.menu = new MenuUI({
            target: document.querySelector('#root')!,
            props: {
                menu: this
            }
        })
    }
    
    onDeactivate(_context: SceneActivationContext<undefined>): void {
        resources.mp3Title.stop()
        this.menu.$destroy();
        this.engine.removeScene(this);
    }
    
    toggleMusic(enable?: boolean) {
        window.localStorage.setItem('enableMusic', `${Number(enable)}`)
        if (enable) {
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

    continueGame(lvl: TypeLevels) {
        const levels = getLevelsLocalStorage(lvl)
        if (levels.length > 0) {
            const nextlevel = levels.at(-1)!.level + 1
            if (lvl === carrots_levels) {
                this.startLevel(carrotsMaps, nextlevel)
                ym(95784994,'reachGoal', 'continue_carrots_levels');
            } else if (lvl === 'eggs_levels') {
                this.startLevel(eggsMaps, nextlevel)
                ym(95784994,'reachGoal','continue_eggs_levels')
            }
        }
    }

    startEggsNewGame() {
        localStorage.removeItem(eggs_levels);
        VKBridge.setSave(eggs_levels, '');
        ym(95784994,'reachGoal', 'eggs_levels');
        this.startLevel(eggsMaps, 0)
    }

    startCarrotsNewGame () {
        localStorage.removeItem(carrots_levels);
        VKBridge.setSave(carrots_levels, '');
        ym(95784994,'reachGoal', 'carrots_levels');
        this.startLevel(carrotsMaps, 0);
    }

    handleNextLevel(type: TypeLevels, level: number) {
        this.startLevel(type === carrots_levels ? carrotsMaps : eggsMaps, level)
      }
}