import { Actor, CollisionType, Engine, vec, Animation, Keys, AnimationDirection, Vector } from "excalibur";
import { downAnim, idleAnim, leftAnim, rightAnim, upAnim, fadeOutAnim, deathAnim } from "src/animations/Bobby";
import { BLOCK_SIZE, type Level } from "src/scenes/level";
import { Directon } from "./types";
import { resources } from 'src/app/resources'
import { DEFAULT_VOLUME } from "src/common/constants";
const SPEED = 30;
type TypeAnimation = 'up' | 'down' | 'left' | 'right' | 'idle' | 'fadeOutAnim' | 'death';

const ListAnimation: Record<Exclude<TypeAnimation, 'start'>, Animation>  = {
    idle: idleAnim,
    fadeOutAnim: fadeOutAnim,
    up: upAnim,
    down: downAnim,
    left: leftAnim,
    right: rightAnim,
    death: deathAnim,
}

export class Bobby extends Actor {
    declare scene: Level
    direction!: Directon | null;
    blockX: number;
    blockY: number;
    playerConvertorCount: number;
    playerRotateCount: number;
    onRotatePlatform: string | number | null = null;
    currentAnimation: Animation;
    mobileDirection: Directon| 11 | null = null
    isFreeze: boolean;
    speedView: number;
    steps: number;
    constructor(x: number, y: number) {
        super({
            name: 'Bobby',
            width: 14,
            height: 14,
            pos: vec(x, y),
            z: 1_000,
            collisionType: CollisionType.Active
        })
        this.blockX = (x - 8) / BLOCK_SIZE;
        this.blockY = (y - 8) / BLOCK_SIZE;
        this.playerConvertorCount = 0;
        this.playerRotateCount = 0;
        this.currentAnimation = ListAnimation.fadeOutAnim;
        this.isFreeze = true;
        this.speedView = SPEED * 2;
        this.steps = 0;
    }

    onInitialize(engine: Engine): void {
        // Поднять немного скин чтоб он стоял на платформе
        this.graphics.offset = vec(0, -8)
        this.graphics.add('idle', ListAnimation.idle)
        this.graphics.add('fadeOut', ListAnimation.fadeOutAnim)
        this.graphics.add(`${Directon.UP}`, ListAnimation.up)
        this.graphics.add(`${Directon.DOWN}`,ListAnimation.down)
        this.graphics.add(`${Directon.LEFT}`, ListAnimation.left)
        this.graphics.add(`${Directon.RIGHT}`, ListAnimation.right)
        this.graphics.add('death', ListAnimation.death)
        // Останавливаем все анимации перед началом уровня
        for(const key in ListAnimation) {
            ListAnimation[key as keyof typeof ListAnimation].pause()
            ListAnimation[key as keyof typeof ListAnimation].goToFrame(3)
        }
        
        // Первая анимация когда пользователь появился, пока так
        this.graphics.use('fadeOut')
        this.currentAnimation.reset()
        if (this.currentAnimation.direction === AnimationDirection.Forward) {
            this.currentAnimation.reverse()
        }
        this.currentAnimation.play()

        // Снятие лока на движение и переход на другую анимацию
        engine.clock.schedule(() => {
            this.graphics.use(`${Directon.RIGHT}`)
            this.currentAnimation = ListAnimation.right
            this.currentAnimation.goToFrame(3)
            engine.clock.schedule(() => {
                // Установлено время начала уровня
                this.scene.startLevelTime = engine.clock.now()
                this.isFreeze = false;
            }, 1800)
        }, 700)


        this.scene.on('mobileButtonPressed', (key: unknown) => {
            this.mobileDirection = Number(key as Directon)
        })

        this.scene.on('mobileButtonWasReleased', () => {
            this.mobileDirection = null;
        })

        this.scene.on('levelComplete', () => {
            this.isFreeze = true
            engine.clock.schedule(() => {
                resources.mp3Clered.play(DEFAULT_VOLUME)
                this.graphics.use('fadeOut')
                this.currentAnimation = ListAnimation.fadeOutAnim
                if (this.currentAnimation.direction === AnimationDirection.Backward) {
                    this.currentAnimation.reverse()
                }
                this.currentAnimation.reset()
                this.currentAnimation.play()
            }, 500)
        })

        this.on('collisionstart', ({ other }) => {
            if (other.name === 'Carrot') {
                engine.clock.schedule(() => {
                    this.onTakeCarrot(other)
                }, 500)
            } else if (other.name === 'Finish' && !other.graphics.visible) {
                this.scene.emit('levelComplete', undefined)
            } else if (other.name === 'Trap' && !other.graphics.visible) {
                this.isFreeze = true;
                this.currentAnimation = ListAnimation.death
                this.currentAnimation.reset()
                this.currentAnimation.play()
                this.graphics.use('death')
                resources.mp3Death.play(DEFAULT_VOLUME)
                engine.clock.schedule(() => {
                    this.scene.emit('playerDied', undefined)
                }, 4000)
            } else if (other.name.startsWith('Convertor_Right')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(BLOCK_SIZE, 0, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockX = (this.pos.x - 8) / BLOCK_SIZE
                })
            } else if (other.name.startsWith('Convertor_Left')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(-BLOCK_SIZE, 0, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockX = (this.pos.x - 8) / BLOCK_SIZE
                })
            }  else if (other.name.startsWith('Convertor_Up')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(0, -BLOCK_SIZE, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockY = (this.pos.y - 8) / BLOCK_SIZE
                })
            }  else if (other.name.startsWith('Convertor_Down')) {
                // TODO: Работа с коллизиями на конверторе, пересмотреть подход, попробовать найти лучше
                this.playerConvertorCount += 1
                this.actions.moveBy(0, BLOCK_SIZE, SPEED).toPromise()
                .then(() => {
                    this.playerConvertorCount -= 1
                    this.blockY = (this.pos.y - 8) / BLOCK_SIZE
                })
            } else if (other.name.startsWith('2_Rotate') || other.name.startsWith('4_Rotate') ) {
                const platform = this.scene.rotatePlatform[`${other.pos.x / BLOCK_SIZE}x${other.pos.y / BLOCK_SIZE - 1}`]
                this.onRotatePlatform = platform.state;
                this.playerRotateCount += 1
            } else if (other.name.startsWith('ConvertorButton')) {
                engine.clock.schedule(() => this.scene.convertorControl(), 500)
            } else if (other.name.startsWith('RotateButton')) {
                engine.clock.schedule(() => this.scene.rotateControl(), 500)
            } else if (other.name.startsWith('Key')) {
                engine.clock.schedule(() => {
                    other.kill()
                    this.scene.emit('takeKey', other.name)
                }, 300)
                const arr = other.name.split('_')
                if (this.scene.locks) {
                    delete this.scene.collisionMap[this.scene.locks[`Lock_${arr[1]}`]]
                }
            } else if (other.name.startsWith('Lock')) {
                engine.clock.schedule(() => {
                    other.kill()
                    this.scene.emit('openLock', other.name)
                }, 150)
            }
        })


        this.on('collisionend', ({ other }) => {
            if (other.name === 'Trap') {
                other.graphics.visible = false
            } else if (other.name.startsWith('2_Rotate')) {
                this.playerRotateCount -= 1
                this.scene.rotate2Platform(other.pos.x, other.pos.y)
                if (this.playerRotateCount === 0) {
                    this.onRotatePlatform = null;
                }
            } else if (other.name.startsWith('4_Rotate')) {
                this.playerRotateCount -= 1
                this.scene.rotate4Platform(other.pos.x, other.pos.y)
                if (this.playerRotateCount === 0) {
                    this.onRotatePlatform = null;
                }
            }  else if (other.name === 'Nest') {
                this.onNestEgg(other)
            }
        })
    }

    update(engine: Engine): void {
        if (this.isFreeze) return;
        if (!this.scene.lockCamera) {
            if (this.mobileDirection === Directon.UP) {
                this.scene.camera.vel = vec(0, -this.speedView)
            } else if (this.mobileDirection === Directon.DOWN) {
                this.scene.camera.vel = vec(0, this.speedView)
            } else if (this.mobileDirection === Directon.LEFT) {
                this.scene.camera.vel = vec(-this.speedView, 0)
            } else if (this.mobileDirection === Directon.RIGHT) {
                this.scene.camera.vel = vec(this.speedView, 0)
            } else {
                this.scene.camera.vel = Vector.Zero
            }
            return
        }
        if(this.mobileDirection === 11 || engine.input.keyboard.wasPressed(Keys.R)) {
            this.scene.emit('playerDied', undefined)
        }

        const isOnPoint = this.oldPos.x === this.pos.x && this.oldPos.y === this.pos.y;
        if ((!this.playerConvertorCount || this.currentAnimation.isPlaying) && (this.oldPos.x !== this.pos.x || this.oldPos.y !== this.pos.y)) {
            if (this.oldPos.x < this.pos.x) {
                this.direction = Directon.RIGHT
                this.currentAnimation = ListAnimation.right
            } else if (this.oldPos.x > this.pos.x) {
                this.direction = Directon.LEFT
                this.currentAnimation = ListAnimation.left
            } else if (this.oldPos.y < this.pos.y) {
                this.currentAnimation = ListAnimation.down
                this.direction = Directon.DOWN
            } else if (this.oldPos.y > this.pos.y) {
                this.direction = Directon.UP
                this.currentAnimation = ListAnimation.up
            }
            if (!this.currentAnimation.isPlaying) {
                this.graphics.use(`${this.direction}`)
                this.currentAnimation.play()
            }
        } else if (isOnPoint && this.currentAnimation.isPlaying) {
            this.currentAnimation.goToFrame(3)
            this.currentAnimation.pause()
        } else if (this.playerConvertorCount && this.currentAnimation.isPlaying) {
                engine.clock.schedule(() => {
                    this.currentAnimation.goToFrame(3)
                    this.currentAnimation.pause()
                    // время расчитано из кол-ва кадров ходьбы (8) на 60мс на 1 кадр 6 * 8 = 48
                }, 480)
        }
        if (isOnPoint && !this.playerConvertorCount) {
            this.move(engine)
        }
    }

    move(engine: Engine) {
        if ((this.mobileDirection ===  Directon.UP || engine.input.keyboard.isHeld(Keys.ArrowUp)) && ((this.pos.y - 8) / BLOCK_SIZE === this.blockY)) {
            if (this.onRotatePlatform === 'X' || this.onRotatePlatform === 2 || this.onRotatePlatform === 1) {
                return
            }
            const coord = `${this.blockX}x${this.blockY - 1}`
            if (coord in this.scene.collisionMap || (coord in this.scene.rotatePlatform && ((this.scene.rotatePlatform[coord].state === 'X') ||
            ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 2) && this.blockY < this.scene.rotatePlatform[coord].y) ||
            ((this.scene.rotatePlatform[coord].state === 3 || this.scene.rotatePlatform[coord].state === 4) && this.blockY > this.scene.rotatePlatform[coord].y)
            ))) {
                return
            }
                this.actions.moveBy(0, -BLOCK_SIZE, SPEED)
                this.blockY -= 1
                this.steps += 1
        } else if ((this.mobileDirection ===  Directon.DOWN || engine.input.keyboard.isHeld(Keys.ArrowDown)) && (this.pos.y - 8) / BLOCK_SIZE === this.blockY) {
            if (this.onRotatePlatform === 'X' || this.onRotatePlatform === 3 || this.onRotatePlatform === 4) {
                return
            }
            const coord = `${this.blockX}x${this.blockY + 1}`
            if (coord in this.scene.collisionMap || (coord in this.scene.rotatePlatform && 
                ((this.scene.rotatePlatform[coord].state === 'X') ||
                ((this.scene.rotatePlatform[coord].state === 3 || this.scene.rotatePlatform[coord].state === 4)  && this.blockY > this.scene.rotatePlatform[coord].y) ||
                ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 2)  && this.blockY < this.scene.rotatePlatform[coord].y))
                )) {
                return
            }
            this.actions.moveBy(0, BLOCK_SIZE, SPEED)
            this.blockY += 1
            this.steps += 1
        } else if ((this.mobileDirection ===  Directon.RIGHT ||engine.input.keyboard.isHeld(Keys.ArrowRight)) && (this.pos.x - 8) / BLOCK_SIZE === this.blockX) {
            if (this.onRotatePlatform === 'Y'  || this.onRotatePlatform === 2 || this.onRotatePlatform === 3) {
                return
            }
            const coord = `${this.blockX + 1}x${this.blockY}`
            if (coord in this.scene.collisionMap || (coord in this.scene.rotatePlatform &&
                ((this.scene.rotatePlatform[coord].state === 'Y') ||
                ((this.scene.rotatePlatform[coord].state === 2 || this.scene.rotatePlatform[coord].state === 3) && this.blockX > this.scene.rotatePlatform[coord].x) ||
                ((this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 4) && this.blockX < this.scene.rotatePlatform[coord].x)))) {
                return
            }
            this.actions.moveBy(BLOCK_SIZE, 0, SPEED)
            this.blockX += 1
            this.steps += 1
        } else if ((this.mobileDirection ===  Directon.LEFT ||engine.input.keyboard.isHeld(Keys.ArrowLeft)) && (this.pos.x - 8) / BLOCK_SIZE === this.blockX) {
            if (this.onRotatePlatform === 'Y' || this.onRotatePlatform === 1 || this.onRotatePlatform === 4) {
                return
            }
            const coord = `${this.blockX - 1}x${this.blockY}`
            if (coord in this.scene.collisionMap || (coord in this.scene.rotatePlatform && 
            ((this.scene.rotatePlatform[coord].state === 'Y') || 
            (this.scene.rotatePlatform[coord].state === 1 || this.scene.rotatePlatform[coord].state === 4) && (this.blockX < this.scene.rotatePlatform[coord].x) || 
            (this.scene.rotatePlatform[coord].state === 2 || this.scene.rotatePlatform[coord].state === 3) && (this.blockX > this.scene.rotatePlatform[coord].x)
            ))) {
                return
            }
                this.actions.moveBy(-BLOCK_SIZE, 0, SPEED)
                this.blockX -= 1
                this.steps += 1
        }
    }

    onTakeCarrot(carrot: Actor) {
        carrot.kill();
        this.scene.emit('takeCarrot', undefined)
    }
    
    onNestEgg(nest: Actor) {
        nest.graphics.add(this.scene.levels[this.scene.currentLevel].getSpriteForGid(47))
        const lockPos = `${nest.pos.x / BLOCK_SIZE}x${nest.pos.y / BLOCK_SIZE - 1}` 
        this.scene.collisionMap[lockPos] = true
    }
}