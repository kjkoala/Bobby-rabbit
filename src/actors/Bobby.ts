import { Actor, CollisionType, Color, Engine, Vector, vec } from "excalibur";
const SPEED = 50;
export class Bobby extends Actor {
    constructor(x: number, y: number) {
        super({
            name: 'Bobby',
            width: 10,
            height: 10,
            color: Color.Red,
            pos: vec(x, y),
            z: 9,
            collisionType: CollisionType.Active
        })
    }

    onInitialize(_engine: Engine): void {
        // _engine.currentScene.camera.strategy.elasticToActor(this, .8, .9)
        this.on('collisionstart', ({ other }) => {
            if (other.name === 'Carrot') {
                this.onTakeCarrot(other);
            } else if (other.name === 'Finish' && !other.graphics.visible) {
                this.scene.emit('levelComplete', undefined)
            } else if (other.name === 'Trap' && !other.graphics.visible) {
                this.scene.emit('playerDied', undefined)
            }
        })

        this.on('collisionend', ({ other }) => {
            if (other.name === 'Trap') {
                other.graphics.visible = false
            }
        })

        _engine.input.keyboard.on('hold', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.vel = vec(0, -SPEED)
                    break
                case 'ArrowDown':
                    this.vel = vec(0, SPEED)
                    break;
                case 'ArrowLeft':
                    this.vel = vec(-SPEED, 0);
                    break;
                case 'ArrowRight':
                    this.vel = vec(SPEED, 0);
                    break;
            }
        })

        _engine.input.keyboard.on('release', () => {
            this.vel = Vector.Zero;
        })
    }

    onTakeCarrot(carrot: Actor) {
        carrot.kill();
        this.scene.emit('takeCarrot', undefined)
    }
}