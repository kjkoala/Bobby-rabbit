import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { Actor, Engine, Scene } from "excalibur";
import { Bobby } from "src/actors/Bobby";
import { convertorDownAnim, convertorLeftAnim, convertorRightAnim, convertorUpAnim } from "src/animations/Convertor";

export class Level extends Scene {
    levels: TiledMapResource[];
    currentLevel: number
    carrots!: number;
    mapWidth!: number;
    collisionMap!: Record<string, boolean>
    rotatePlatform!: Record<string, {state: string; actors: Record<string, Actor>}>
    constructor(tileMaps: TiledMapResource[], currentLevel: number) {
        super()
        this.levels = tileMaps
        this.currentLevel = currentLevel
    }
    onInitialize(engine: Engine): void {
        const currentMap = this.levels[this.currentLevel];
        this.mapWidth = currentMap.data.width;
        this.collisionMap = {};
        this.rotatePlatform = {};
        const isRotateFindOnMap = currentMap.data.objectGroups.find(object => object.name === '2_Rotate');
        const wall = this.findIndexLayer(currentMap, 'Wall')
        this.createMapForCollision(wall)

        console.log('currentMap', currentMap.data.objectGroups)

        const carrots = currentMap.data.objectGroups.find(obj => obj.name === 'Carrots')?.objects.length
        if (carrots) {
            this.carrots = carrots;
        }
        const playerStart = currentMap.data.objectGroups.find(obj => obj.name === 'Camera')?.objects.find(obj => obj.name === 'player-start')
        if (playerStart && playerStart.x && playerStart.y) {
            engine.add(new Bobby(playerStart.x, playerStart.y))
        }
        currentMap.addTiledMapToScene(engine.currentScene);
        console.log('[actors]',this.actors)
        this.actors.forEach((actor) => {
            // TODO: Пересмотреть работу конвертеров под коллизии
            if (actor.name.startsWith('Convertor_Right')) {
                actor.graphics.use(convertorRightAnim)
            } else if (actor.name.startsWith('Convertor_Left')) {
                actor.graphics.use(convertorLeftAnim)
            }  else if (actor.name.startsWith('Convertor_Up')) {
                actor.graphics.use(convertorUpAnim)
            }  else if (actor.name.startsWith('Convertor_Down')) {
                actor.graphics.use(convertorDownAnim)
            } else if (isRotateFindOnMap && actor.name === 'X' || actor.name === 'Y') {
                // TODO: Дописать логику, в объект положить начальное значение, актеров из движка
                this.rotatePlatform[(isRotateFindOnMap!.properties as any).find((prop: any) => prop.name === 'coords')!.value] = {
                    state: (isRotateFindOnMap!.properties as any).find((prop: any) => prop.name === 'state')!.value,
                    actors: Object.fromEntries(isRotateFindOnMap?.objects.map(obj => {
                        if (obj.name) {
                            return [obj.name, this.actors.find(actor => actor.name === obj.name)]
                        }
                    }) as any)
                }
            }
        })
        console.log(this.rotatePlatform)
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