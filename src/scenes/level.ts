import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { Engine, Scene } from "excalibur";
import { Bobby } from "src/actors/Bobby";

export class Level extends Scene {
    levels: TiledMapResource[];
    currentLevel: number
    carrots!: number;
    constructor(tileMaps: TiledMapResource[], currentLevel: number) {
        super()
        this.levels = tileMaps
        this.currentLevel = currentLevel
    }
    onInitialize(engine: Engine): void {
        this.levels[this.currentLevel].addTiledMapToScene(engine.currentScene);
        const carrots = this.levels[this.currentLevel].data.objectGroups.find(obj => obj.name === 'Carrots')?.objects.length
        if (carrots) {
            this.carrots = carrots;
        }
        const playerStart = this.levels[this.currentLevel].data.objectGroups.find(obj => obj.name === 'Camera')?.objects.find(obj => obj.name === 'player-start')
        if (playerStart && playerStart.x && playerStart.y) {
            engine.add(new Bobby(playerStart.x, playerStart.y))
        }

        this.on('takeCarrot', () => {
            this.carrots -= 1
            if (this.carrots <= 0) {
                const finish = this.actors.find(obj => obj.name === 'Finish')
                if (finish) {
                    finish.graphics.visible = false
                }
            }
        })

        this.on('levelComplete', () => {
            engine.removeScene('level');
            engine.addScene('level', new Level(this.levels, this.currentLevel + 1));
            engine.goToScene('level');
        })

        this.on('playerDied', () => {
            engine.removeScene('level');
            engine.addScene('level', new Level(this.levels, this.currentLevel));
            engine.goToScene('level');
        })
        this.on('levelComplete', () => {
            engine.removeScene('level');
            engine.addScene('level', new Level(this.levels, this.currentLevel + 1));
            engine.goToScene('level');
        })
    }
}