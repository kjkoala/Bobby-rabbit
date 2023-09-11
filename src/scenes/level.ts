import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { Actor, CollisionType, Engine, Scene } from "excalibur";
import { Bobby } from "src/actors/Bobby";
import { convertorDownAnim, convertorLeftAnim, convertorRightAnim, convertorUpAnim } from "src/animations/Convertor";

export class Level extends Scene {
    declare player: Bobby
    levels: TiledMapResource[];
    currentLevel: number
    carrots!: number;
    mapWidth!: number;
    collisionMap!: Record<string, boolean>
    rotatePlatform!: Record<string, {state: string | number; actors: Record<string, Actor>; x: number; y: number}>
    convertorButtons!: Record<string, boolean> | null;
    rotateButtons!: Record<string, boolean> | null;
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
        this.convertorButtons = null;
        this.rotateButtons = null;
        const rotatePlatform = currentMap.data.objectGroups.filter(object => object.name === '2_Rotate' || object.name === '4_Rotate');
        const convertorButtons = currentMap.data.objectGroups.find(object => object.name === 'ConvertorButtons');
        const rotateButtons = currentMap.data.objectGroups.find(object => object.name === 'RotateButtons');

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

        if (convertorButtons) {
            this.convertorButtons = Object.fromEntries((convertorButtons.properties[0].value as string).split(',').map((el: string) => {
                const els = el.split('=')
                els[1] = JSON.parse(els[1])
                return els
            }));
        }

        if (rotateButtons) {
            this.rotateButtons = Object.fromEntries((rotateButtons.properties[0].value as string).split(',').map((el: string) => {
                const els = el.split('=')
                els[1] = JSON.parse(els[1])
                return els
            }));
        }

        this.player = this.actors.find(actor => actor.name === 'Bobby') as Bobby;

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
            } else if (actor.name.startsWith('Convertor')) {
                this.convertorControl(actor)
            } else if (actor.name.startsWith('RotateButton')) {
                this.rotateControl(actor)
            }
        })

        if (rotatePlatform.length > 0) {
            rotatePlatform.forEach(platform => {
                const coords = platform.properties.find(prop => prop.name === 'coords') 
                const state = platform.properties.find(prop => prop.name === 'state') 
                const array = platform.properties.find(prop => prop.name === 'array')
                const x = platform.properties.find(prop => prop.name === 'x')
                const y = platform.properties.find(prop => prop.name === 'y')

                const elements = (array?.value as string).split(',').map((el: string) => el.split('='));
                this.rotatePlatform[coords?.value as string] = {
                    state: state!.value as string,
                    x: x!.value as number,
                    y: y!.value as number, 
                    actors: this.actors.reduce<Record<string, Actor>>((acc, actor) => {
                        elements.find(([name, axis]) => {
                            if (name.includes(actor.name)) {
                                acc[axis] = actor
                                return true
                            }
                            return false;
                        })
                        return acc
                    }, {} )
                }
            })
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

    convertorControl(actor?: Actor) {
        if (this.convertorButtons && actor && actor.name in this.convertorButtons) {
            if (this.convertorButtons[actor.name]) {
                actor.graphics.visible = true
                actor.body.collisionType = CollisionType.Passive
            } else {
                actor.graphics.visible = false
                actor.body.collisionType = CollisionType.PreventCollision
            }
        } else {
            this.actors.forEach(actor => {
                if (actor.name.startsWith('Convertor')) {
                    if (actor.body.collisionType === CollisionType.PreventCollision) {
                        actor.graphics.visible = true
                        actor.body.collisionType = CollisionType.Passive
                    } else if (actor.body.collisionType === CollisionType.Passive) {
                        actor.graphics.visible = false
                        actor.body.collisionType = CollisionType.PreventCollision
                    }
                }
            })
        }
    }

    rotateControl(actor?: Actor) {
        if (this.rotateButtons && actor && actor.name in this.rotateButtons) {
            if (this.rotateButtons[actor.name]) {
                actor.graphics.visible = true
                actor.body.collisionType = CollisionType.Passive
            } else {
                actor.graphics.visible = false
                actor.body.collisionType = CollisionType.PreventCollision
            }
        } else {
            this.actors.forEach(actor => {
                if (actor.name.startsWith('RotateButton')) {
                    if (actor.body.collisionType === CollisionType.PreventCollision) {
                        actor.graphics.visible = true
                        actor.body.collisionType = CollisionType.Passive
                    } else if (actor.body.collisionType === CollisionType.Passive) {
                        actor.graphics.visible = false
                        actor.body.collisionType = CollisionType.PreventCollision
                    }
                }
            })
            for(const key in this.rotatePlatform) {
                if(this.rotatePlatform[key].state === 'X' || this.rotatePlatform[key].state === 'Y' ) {
                    this.rotate2Platform(key)
                } else {
                    this.rotate4Platform(key)
                }
            }
        }
    }
    rotate2Platform(x: string): void;
    rotate2Platform(x: number, y: number): void;
    rotate2Platform(x: string | number, y?: number) {
        const platform = typeof x === 'string' ? this.rotatePlatform[x] : this.rotatePlatform[`${x / 16 + 1}x${y! / 16}`]
        if (platform.state === 'Y') {
            platform.state = 'X'
            platform.actors.X.graphics.visible = true
            platform.actors.Y.graphics.visible = false
        } else {
            platform.state = 'Y'
            platform.actors.Y.graphics.visible = true
            platform.actors.X.graphics.visible = false
        }
    }

    rotate4Platform(x: string): void;
    rotate4Platform(x: number, y: number): void;
    rotate4Platform(x: string | number, y?: number) {
        const platform = typeof x === 'string' ? this.rotatePlatform[x] : this.rotatePlatform[`${x / 16 + 1}x${y! / 16}`]
        if (platform.state === 4) {
            platform.state = 1
        } else if (typeof platform.state === 'number') {
            platform.state += 1
        }
        
        for (const index in platform.actors) {
            platform.actors[index].graphics.visible = false
        }
        platform.actors[platform.state].graphics.visible = true
    }

    createMapForCollision(wall: number[]) {
        for(var y = 0; y <= this.mapWidth; y++) {
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