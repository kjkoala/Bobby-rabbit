import { Actor, CollisionType, Color, Engine, vec, Animation, Input } from "excalibur";
import { downAnim, idleAnim, leftAnim, rightAnim, upAnim, fadeAnim, deathAnim } from "src/animations/Bobby";
import type { Level } from "src/scenes/level";
const SPEED = 30;
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
    direction!: TypeAnimation;
    blockX: number;
    blockY: number;
    playerConvertorCount: number;
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
    }

    onInitialize(engine: Engine): void {
        // Поднять немного скин чтоб он стоял на платформе
        this.graphics.offset = vec(0, -8)
        this.graphics.add('idle', ListAnimation.idle)
        this.graphics.add('fade', ListAnimation.fade)
        this.graphics.add('up', ListAnimation.up)
        this.graphics.add('down',ListAnimation.down)
        this.graphics.add('left', ListAnimation.left)
        this.graphics.add('right', ListAnimation.right)
        this.graphics.add('death', ListAnimation.death)
    
        this.graphics.use('idle')
        this.direction = 'fade';

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
            }
        })
        this.on('collisionend', ({ other }) => {
            if (other.name === 'Trap') {
                other.graphics.visible = false
            }
        })
    }

    update(engine: Engine): void {
        if(engine.input.keyboard.wasPressed(Input.Keys.R)) {
            this.scene.emit('playerDied', undefined)
        }
        if (this.oldPos.x !== this.pos.x || this.oldPos.y !== this.pos.y) {
            if (this.oldPos.x < this.pos.x) {
                this.direction = 'right'
            } else if (this.oldPos.x > this.pos.x) {
                this.direction = 'left'
            } else if (this.oldPos.y < this.pos.y) {
                this.direction = 'down'
            } else {
                this.direction = 'up'
            }
            this.graphics.use(this.direction)
        }
        this.move(engine)
    }

    move(engine: Engine) {
        if (this.playerConvertorCount) return;

        if (engine.input.keyboard.isHeld(Input.Keys.ArrowUp) && (this.pos.y - 8) / BLOCK_SIZE + 1 === this.blockY) {
            if (!(`${this.blockX}x${this.blockY - 1}` in this.scene.collisionMap)) {
            this.actions.moveBy(0, -BLOCK_SIZE, SPEED)
            this.blockY -= 1
            }
        }
        if (engine.input.keyboard.isHeld(Input.Keys.ArrowDown) && (this.pos.y - 8) / BLOCK_SIZE + 1 === this.blockY) {
            if (!(`${this.blockX}x${this.blockY + 1}` in this.scene.collisionMap)) {
                this.actions.moveBy(0, BLOCK_SIZE, SPEED)
                this.blockY += 1
            }
        } 
        
        if (engine.input.keyboard.isHeld(Input.Keys.ArrowRight) && (this.pos.x - 8) / BLOCK_SIZE + 1 === this.blockX) {
            if (!(`${this.blockX + 1}x${this.blockY}` in this.scene.collisionMap)) {
                this.actions.moveBy(BLOCK_SIZE, 0, SPEED)
                this.blockX += 1
            }
        } 
        
        if (engine.input.keyboard.isHeld(Input.Keys.ArrowLeft) && (this.pos.x - 8) / BLOCK_SIZE + 1 === this.blockX) {
            if (!(`${this.blockX - 1}x${this.blockY}` in this.scene.collisionMap)) {
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