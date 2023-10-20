import { Engine, Scene, type SceneActivationContext } from "excalibur";
import MenuUI from "src/ui/MenuUI.svelte"
import { Level } from "./level";
import { tileMaps } from "src/app/main";
import { DEFAULT_VOLUME, carrots_levels } from "src/common/constants";
import { resources } from "src/app/resources";

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
    }
    
    toggleMainMusic(toggle: boolean) {
        if(toggle) {
            resources.mp3Title.loop = true;
            resources.mp3Title.play(DEFAULT_VOLUME)
        } else {
            resources.mp3Title.stop()
        }
    }


    getLocalStorageCarrotsLevel() {
        return localStorage.getItem(carrots_levels)
    }

    startLevel(lvl: number) {
        this.engine.addScene('level', new Level(tileMaps, lvl))
        this.engine.goToScene('level');
    }

    continueGame() {
        const levels = this.getLocalStorageCarrotsLevel()
        if (levels) {
            const lvl = JSON.parse(levels)
            this.menu.$destroy();
            this.startLevel(lvl.at(-1).level + 1)
        }
        return false
    }

    startCarrotsNewGame () {
        this.menu.$destroy();
        localStorage.removeItem(carrots_levels);
        this.startLevel(0);
    }
}