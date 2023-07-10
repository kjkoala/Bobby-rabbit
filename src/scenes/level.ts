import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { Engine, Scene } from "excalibur";
import { Bobby } from "src/actors/Bobby";
import { convertorDownAnim, convertorLeftAnim, convertorRightAnim, convertorUpAnim } from "src/animations/Convertor";

export class Level extends Scene {
    levels: TiledMapResource[];
    currentLevel: number
    carrots!: number;
    mapWidth!: number;
    collisionMap!: Record<string, boolean>
    constructor(tileMaps: TiledMapResource[], currentLevel: number) {
        super()
        this.levels = tileMaps
        this.currentLevel = currentLevel
    }
    onInitialize(engine: Engine): void {
        const currentMap = this.levels[this.currentLevel]
        this.mapWidth = currentMap.data.width
        this.collisionMap = {}
        const wall = this.findIndexLayer(currentMap, 'Wall')
        this.createMapForCollision(wall)

        const carrots = currentMap.data.objectGroups.find(obj => obj.name === 'Carrots')?.objects.length
        if (carrots) {
            this.carrots = carrots;
        }
        const playerStart = currentMap.data.objectGroups.find(obj => obj.name === 'Camera')?.objects.find(obj => obj.name === 'player-start')
        if (playerStart && playerStart.x && playerStart.y) {
            engine.add(new Bobby(playerStart.x, playerStart.y))
        }

        currentMap.addTiledMapToScene(engine.currentScene);
        this.actors.forEach((actor) => {
            // TODO: Пересмотреть работу конвертеров под коллизии
            if (actor.name.startsWith('Convertor_Right')) {
                actor.graphics.use(convertorRightAnim)
                if (actor.name.startsWith('Convertor_Right_Block')) {
                    this.collisionMap[`${actor.pos.x / 16 + 1}x${actor.pos.y / 16}`] = true
                }
            } else if (actor.name.startsWith('Convertor_Left')) {
                actor.graphics.use(convertorLeftAnim)
                if (actor.name.startsWith('Convertor_Left_Block')) {
                    this.collisionMap[`${actor.pos.x / 16 + 1}x${actor.pos.y / 16}`] = true
                }
            }  else if (actor.name.startsWith('Convertor_Up')) {
                actor.graphics.use(convertorUpAnim)
                if (actor.name.startsWith('Convertor_Up_Block')) {
                    this.collisionMap[`${actor.pos.x / 16 + 1}x${actor.pos.y / 16}`] = true
                }
            }  else if (actor.name.startsWith('Convertor_Down')) {
                actor.graphics.use(convertorDownAnim)
                if (actor.name.startsWith('Convertor_Down_Block')) {
                    this.collisionMap[`${actor.pos.x / 16 + 1}x${actor.pos.y / 16}`] = true
                }
            }
        })

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
            const nextLevel = this.currentLevel + 1
            if (nextLevel >= this.levels.length) {
                engine.goToScene('endLevel')
            } else {
                engine.addScene('level', new Level(this.levels, nextLevel));
                engine.goToScene('level');
            }
        })

        this.on('playerDied', () => {
            engine.removeScene('level');
            engine.addScene('level', new Level(this.levels, this.currentLevel));
            engine.goToScene('level');
        })

    }

    createMapForCollision(wall: number[]) {
        for(var y = 1; y <= this.mapWidth; y++) {
            var yStart = y * this.mapWidth
            var yFinish = (y + 1) * this.mapWidth
            for(var x = 0; x < wall.length;x++) {
              if (wall[x] > yStart && wall[x] <= yFinish) {
                this.collisionMap[`${wall[x] - yStart}x${y + 1}`] = true
              }
            }
          } 
    }

    findIndexLayer(currentMap: TiledMapResource, name: string) {
        const layer = currentMap.data.layers.find(obj => obj.name === name);
        if (layer && Array.isArray(layer.data)) {
            return layer.data.reduce<number[]>((acc, item, index) => {
                if (item > 0) {
                    acc.push(index + 1)
                }
                return acc
            }, [])
        }
        return []
    }
}