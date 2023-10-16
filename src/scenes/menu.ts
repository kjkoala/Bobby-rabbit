import { Engine, Scene } from "excalibur";
import MenuUI from "src/ui/Menu.svelte"
import { Level } from "./level";
import { tileMaps } from "src/app/main";

export class Menu extends Scene {
    menu!: MenuUI
    constructor() {
        super()
    }
    onInitialize(_engine: Engine): void {
        this.menu = new MenuUI({
            target: document.querySelector('#root')!,
            props: {
                menu: this
            }
        })
    }


    getLocalStorageCarrotsLevel() {
        return localStorage.getItem('carrots_levels')
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
        localStorage.removeItem('carrots_levels');
        this.startLevel(0);
    }
}