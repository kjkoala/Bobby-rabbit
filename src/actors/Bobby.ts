import { Actor, CollisionType, Color, Engine, vec, Animation, Keys } from "excalibur";
import { downAnim, idleAnim, leftAnim, rightAnim, upAnim, fadeAnim, deathAnim } from "src/animations/Bobby";
import type { Level } from "src/scenes/level";
import { Directon } from "./types";
const SPEED = 45;
const BLOCK_SIZE = 16;
type TypeAnimation = 'up' | 'down' | 'left' | 'right' | 'idle' | 'fade' | 'death';

const ListAnimation: Record<Exclude<TypeAnimation, 'start'>, Animation>  = {
    idle: idleAnim,
    fade: fadeAnim,
    up: upAnim,
    down: downAnim,
    left: leftAnim,
    right: rightAnim,
    death: deathAnim,
}

export class Bobby extends Actor {
    declare scene: Level
    direction!: Directon;
    blockX: number;
    blockY: number;
    playerConvertorCount: number;
    playerRotateCount: number;
    onRotatePlatform: string | number | null = null;
    constructor(x: number, y: number) {
        super({
            name: 'Bobby',
            width: 14,
            height: 14,
            pos: vec(x, y),
            color: Color.Red,
            z: 9,
            collisionType: CollisionType.Active
        })
        this.blockX = (x - 8) / BLOCK_SIZE + 1;
        this.blockY = (y - 8) / BLOCK_SIZE + 1;
        this.playerConvertorCount = 0;
        this.playerRotateCount = 0;
    }

    onInitialize(engine: Engine): void {
        // Поднять немного скин чтоб он стоял на платформе
        this.graphics.offset = vec(0, -8)
        this.graphics.add('idle', ListAnimation.idle)
        this.graphics.add('fade', ListAnimation.fade)
        this.graphics.add(`${Directon.UP}`, ListAnimation.up)
        this.graphics.add(`${Directon.DOWN}`,ListAnimation.down)
        this.graphics.add(`${Directon.LEFT}`, ListAnimation.left)
        this.graphics.add(`${Directon.RIGHT}`, ListAnimation.right)
        this.graphics.add('death', ListAnimation.death)
    
        this.graphics.use('idle')
        // this.direction = 'fade';

        // _engine.currentScene.camera.strategy.lockToActor(this)
        this.on('collisionstart', ({ other }) => {
            if (other.name === 'Carrot') {
                engine.clock.schedule(() => {
                    this.onTakeCarrot(other)
                }, 300)
            } else if (other.name === 'Finish' && !other.graphics.visible) {
                this.scene.emit('levelComplete', undefined)
            } else if (other.name === 'Trap' && !other.graphics.visible) {
                // this.graphics.use('death')
                this.scene.emit('playerDied', undefined)
            } else if (other.name.startsWith('Convertor_Right')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(BLOCK_SIZE, 0, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockX = (this.pos.x - 8) / BLOCK_SIZE + 1
                })
            } else if (other.name.startsWith('Convertor_Left')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(-BLOCK_SIZE, 0, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockX = (this.pos.x - 8) / BLOCK_SIZE + 1
                })
            }  else if (other.name.startsWith('Convertor_Up')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(0, -BLOCK_SIZE, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockY = (this.pos.y - 8) / BLOCK_SIZE + 1
                })
            }  else if (other.name.startsWith('Convertor_Down')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(0, BLOCK_SIZE, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockY = (this.pos.y - 8) / BLOCK_SIZE + 1
                })
            } else if (other.name.startsWith('2_Rotate') || other.name.startsWith('4_Rotate') ) {
                const platform = this.scene.rotatePlatform[`${other.pos.x / 16 + 1}x${other.pos.y / 16}`]
                this.onRotatePlatform = platform.state;
                this.playerRotateCount += 1
            }
        })
        this.on('collisionend', ({ other }) => {
            if (other.name === 'Trap') {
                other.graphics.visible = false
            } else if (other.name.startsWith('2_Rotate')) {
                this.playerRotateCount -= 1
                const platform = this.scene.rotatePlatform[`${other.pos.x / 16 + 1}x${other.pos.y / 16}`]
                if (platform.state === 'Y') {
                    platform.state = 'X'
                    platform.actors.X.graphics.visible = true
                    platform.actors.Y.graphics.visible = false
                } else {
                    platform.state = 'Y'
                    platform.actors.Y.graphics.visible = true
                    platform.actors.X.graphics.visible = false
                }
                if (this.playerRotateCount === 0) {
                    this.onRotatePlatform = null;
                }
            } else if (other.name.startsWith('4_Rotate')) {
                this.playerRotateCount -= 1
                const platform = this.scene.rotatePlatform[`${other.pos.x / 16 + 1}x${other.pos.y / 16}`]
                if (platform.state === 1) {
                    platform.state = 2
                    platform.actors['2'].graphics.visible = true
                    platform.actors['1'].graphics.visible = false
                    platform.actors['3'].graphics.visible = false
                    platform.actors['4'].graphics.visible = false
                } else if (platform.state === 2) {
                    platform.state = 3
                    platform.actors['3'].graphics.visible = true
                    platform.actors['2'].graphics.visible = false
                    platform.actors['1'].graphics.visible = false
                    platform.actors['4'].graphics.visible = false
                } else if (platform.state === 3) {
                    platform.state = 4
                    platform.actors['4'].graphics.visible = true
                    platform.actors['3'].graphics.visible = false
                    platform.actors['2'].graphics.visible = false
                    platform.actors['1'].graphics.visible = false
                } else if (platform.state === 4) {
                    platform.state = 1
                    platform.actors['1'].graphics.visible = true
                    platform.actors['2'].graphics.visible = false
                    platform.actors['3'].graphics.visible = false
                    platform.actors['4'].graphics.visible = false
                }
                if (this.playerRotateCount === 0) {
                    this.onRotatePlatform = null;
                } 
            }
        })
    }

    update(engine: Engine): void {
        if(engine.input.keyboard.wasPressed(Keys.R)) {
            this.scene.emit('playerDied', undefined)
        }
        if (this.oldPos.x !== this.pos.x || this.oldPos.y !== this.pos.y) {
            if (this.oldPos.x < this.pos.x) {
                this.direction = Directon.RIGHT
            } else if (this.oldPos.x > this.pos.x) {
                this.direction = Directon.LEFT
            } else if (this.oldPos.y < this.pos.y) {
                this.direction = Directon.DOWN
            } else {
                this.direction = Directon.UP
            }
            this.graphics.use(`${this.direction}`)
        }
        this.move(engine)
    }

    move(engine: Engine) {
        if (this.playerConvertorCount) return;
        if (engine.input.keyboard.isHeld(Keys.ArrowUp) && (this.pos.y - 8) / BLOCK_SIZE + 1 === this.blockY) {
            if (this.onRotatePlatform === 'X' || this.onRotatePlatform === 2 || this.onRotatePlatform === 1) {
                return
            }
            const coord = `${this.blockX}x${this.blockY - 1}`
            if (coord in this.scene.rotatePlatform && ((typeof this.scene.rotatePlatform[coord].state === 'string' && this.scene.rotatePlatform[coord].state === 'X') ||
            ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 2) && this.blockY < this.scene.rotatePlatform[coord].y) ||
            ((this.scene.rotatePlatform[coord].state === 3 || this.scene.rotatePlatform[coord].state === 4) && this.blockY > this.scene.rotatePlatform[coord].y)
            )) {
                return
            }
            if (!(coord in this.scene.collisionMap)) {
            this.actions.moveBy(0, -BLOCK_SIZE, SPEED)
            this.blockY -= 1
            }
        } else if (engine.input.keyboard.isHeld(Keys.ArrowDown) && (this.pos.y - 8) / BLOCK_SIZE + 1 === this.blockY) {
            if (this.onRotatePlatform === 'X' || this.onRotatePlatform === 3 || this.onRotatePlatform === 4) {
                return
            }
            const coord = `${this.blockX}x${this.blockY + 1}`
            if (coord in this.scene.rotatePlatform && 
                ((typeof this.scene.rotatePlatform[coord].state === 'string' && this.scene.rotatePlatform[coord].state === 'X') ||
                ((this.scene.rotatePlatform[coord].state === 3 || this.scene.rotatePlatform[coord].state === 4)  && this.blockY > this.scene.rotatePlatform[coord].y) ||
                ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 2)  && this.blockY < this.scene.rotatePlatform[coord].y))
                ) {
                return
            }
            if (!(coord in this.scene.collisionMap)) {
                this.actions.moveBy(0, BLOCK_SIZE, SPEED)
                this.blockY += 1
            }
        } else if (engine.input.keyboard.isHeld(Keys.ArrowRight) && (this.pos.x - 8) / BLOCK_SIZE + 1 === this.blockX) {
            if (this.onRotatePlatform === 'Y'  || this.onRotatePlatform === 2 || this.onRotatePlatform === 3) {
                return
            }
            const coord = `${this.blockX + 1}x${this.blockY}`
            if (coord in this.scene.rotatePlatform && ((typeof this.scene.rotatePlatform[coord].state === 'string' && this.scene.rotatePlatform[coord].state === 'Y') ||
                ((this.scene.rotatePlatform[coord].state === 2 || this.scene.rotatePlatform[coord].state === 3) && this.blockX > this.scene.rotatePlatform[coord].x) ||
                ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 4) && this.blockX < this.scene.rotatePlatform[coord].x))) {
                return
            }
            if (!(coord in this.scene.collisionMap) ) {
                this.actions.moveBy(BLOCK_SIZE, 0, SPEED)
                this.blockX += 1
            }
        } else if (engine.input.keyboard.isHeld(Keys.ArrowLeft) && (this.pos.x - 8) / BLOCK_SIZE + 1 === this.blockX) {
            if (this.onRotatePlatform === 'Y' || this.onRotatePlatform === 1 || this.onRotatePlatform === 4) {
                return
            }
            const coord = `${this.blockX - 1}x${this.blockY}`
            if (coord in this.scene.rotatePlatform && ((typeof this.scene.rotatePlatform[coord].state === 'string' && this.scene.rotatePlatform[coord].state === 'Y') || 
            (this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 4) && (this.blockX < this.scene.rotatePlatform[coord].x) || 
            (this.scene.rotatePlatform[coord].state === 2 || this.scene.rotatePlatform[coord].state === 3) && (this.blockX > this.scene.rotatePlatform[coord].x)
            )) {
                return
            }
            if (!(coord in this.scene.collisionMap)) {
                this.actions.moveBy(-BLOCK_SIZE, 0, SPEED)
                this.blockX -= 1
            }
        }
    }

    onTakeCarrot(carrot: Actor) {
        carrot.kill();
        this.scene.emit('takeCarrot', undefined)
    }
}