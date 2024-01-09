import {
  Actor,
  CollisionType,
  Engine,
  vec,
  Animation,
  Keys,
  AnimationDirection,
  Vector,
} from "excalibur";
import {
  downAnim,
  idleAnim,
  leftAnim,
  rightAnim,
  upAnim,
  fadeOutAnim,
  deathAnim,
} from "src/animations/Bobby";
import { type Level } from "src/scenes/level";
import { Directon } from "./types";
import { BLOCK_SIZE, isMobile } from "src/common/constants";
import { getNextPosition, moveDirectionOnConvertor } from "src/common/getNextPosition";
const SPEED = 30;
type TypeAnimation =
  | "up"
  | "down"
  | "left"
  | "right"
  | "idle"
  | "fadeOutAnim"
  | "death";

const ListAnimation: Record<Exclude<TypeAnimation, "start">, Animation> = {
  idle: idleAnim,
  fadeOutAnim: fadeOutAnim,
  up: upAnim,
  down: downAnim,
  left: leftAnim,
  right: rightAnim,
  death: deathAnim,
};

const MoveKeys = {
  Up: [Keys.W, Keys.ArrowUp],
  Left: [Keys.A, Keys.ArrowLeft],
  Right: [Keys.D, Keys.ArrowRight],
  Down: [Keys.S, Keys.ArrowDown],
}
export class Bobby extends Actor {
  declare scene: Level;
  direction!: Directon | null;
  blockX: number;
  blockY: number;
  playerConvertorCount: number;
  playerRotateCount: number;
  onRotatePlatform: string | number | null = null;
  currentAnimation: Animation;
  mobileDirection: Directon | 11 | null = null;
  isFreeze: boolean;
  speedView: number;
  steps: number;
  idleFrame: number;
  isSendRestartMessage: boolean
  constructor(x: number, y: number) {
    super({
      name: "Bobby",
      width: 14,
      height: 14,
      pos: vec(x, y),
      z: 1_000,
      collisionType: CollisionType.Active,
    });
    this.blockX = (x - 0x8) / BLOCK_SIZE;
    this.blockY = (y - 0x8) / BLOCK_SIZE;
    this.playerConvertorCount = 0;
    this.playerRotateCount = 0;
    this.currentAnimation = ListAnimation.fadeOutAnim;
    this.isFreeze = true;
    this.speedView = SPEED * 2;
    this.steps = 0;
    this.idleFrame = 0;
    this.isSendRestartMessage = false;
  }

  onInitialize(engine: Engine): void {
    // Поднять немного скин чтоб он стоял на платформе
    this.graphics.offset = vec(0, - 0x8);
    this.graphics.add("idle", ListAnimation.idle);
    this.graphics.add("fadeOut", ListAnimation.fadeOutAnim);
    this.graphics.add(`${Directon.UP}`, ListAnimation.up);
    this.graphics.add(`${Directon.DOWN}`, ListAnimation.down);
    this.graphics.add(`${Directon.LEFT}`, ListAnimation.left);
    this.graphics.add(`${Directon.RIGHT}`, ListAnimation.right);
    this.graphics.add("death", ListAnimation.death);
    // Останавливаем все анимации перед началом уровня
    for (const key in ListAnimation) {
      ListAnimation[key as keyof typeof ListAnimation].pause();
      ListAnimation[key as keyof typeof ListAnimation].goToFrame(3);
    }

    // Первая анимация когда кролик появился, пока так
    this.graphics.use("fadeOut");
    this.currentAnimation.reset();
    if (this.currentAnimation.direction === AnimationDirection.Forward) {
      this.currentAnimation.reverse();
    }
    this.currentAnimation.play();

    // Снятие лока на движение и переход на другую анимацию
    engine.clock.schedule(() => {
      this.graphics.use(`${Directon.RIGHT}`);
      this.currentAnimation = ListAnimation.right;
      this.currentAnimation.goToFrame(3);
      engine.clock.schedule(() => {
        // Установлено время начала уровня
        this.scene.startLevelTime = engine.clock.now();
        this.isFreeze = false;
      }, 500);
    }, 700);

    this.scene.on("mobileButtonPressed", (key: unknown) => {
      this.mobileDirection = Number(key as Directon);
    });

    this.scene.on("mobileButtonWasReleased", () => {
      this.mobileDirection = null;
    });

    this.scene.on("levelComplete", () => {
      this.isFreeze = true;
      engine.clock.schedule(() => {
        this.scene.playSound('mp3Clered');
        this.graphics.use("fadeOut");
        this.currentAnimation = ListAnimation.fadeOutAnim;
        if (this.currentAnimation.direction === AnimationDirection.Backward) {
          this.currentAnimation.reverse();
        }
        this.currentAnimation.reset();
        this.currentAnimation.play();
      }, 480);
    });

    this.on("collisionstart", ({ other }) => {
      if (other.name === "Carrot") {
        engine.clock.schedule(() => {
          this.onTakeCarrot(other);
        }, 480);
      } else if (other.name === "Nest") {
        engine.clock.schedule(() => {
          this.onNestEgg(other);
        }, 480);
      } else if (other.name === "Finish" && !other.graphics.visible) {
        this.scene.emit("levelComplete");
      } else if (other.name === "Trap" && !other.graphics.visible) {
        this.isFreeze = true;
        this.currentAnimation = ListAnimation.death;
        this.currentAnimation.reset();
        this.currentAnimation.play();
        this.graphics.use("death");
        this.scene.playSound("mp3Death")
        engine.clock.schedule(() => {
          this.scene.emit("playerDied");
        }, 4000);
      } else if (other.hasTag("Convertor_Right")) {
        this.checkNextConvertorCollision(other, Directon.RIGHT)
      } else if (other.hasTag("Convertor_Left")) {
        this.checkNextConvertorCollision(other, Directon.LEFT)
      } else if (other.hasTag("Convertor_Up")) {
        this.checkNextConvertorCollision(other, Directon.UP)
      } else if (other.hasTag("Convertor_Down")) {
        this.checkNextConvertorCollision(other, Directon.DOWN)
      } else if (
        other.name === '2_Rotate' ||
        other.name === '4_Rotate'
      ) {
        const platform = this.scene.rotatePlatform.get(
          `${other.pos.x / BLOCK_SIZE}x${other.pos.y / BLOCK_SIZE - 1}`
        );
        this.onRotatePlatform = platform!.state;
        this.playerRotateCount += 1;
      } else if (other.name.startsWith("ConvertorButton")) {
        engine.clock.schedule(() => this.scene.convertorControl(), 480);
      } else if (other.name.startsWith("RotateButton")) {
        engine.clock.schedule(() => this.scene.rotateControl(), 480);
      } else if (other.name.startsWith("Key")) {
        engine.clock.schedule(() => {
          other.kill();
          this.scene.emit("takeKey", other.name);
        }, 300);
        const arr = other.name.split("_");
        if (this.scene.locks) {
          this.scene.collisionMap.delete(this.scene.locks[`Lock_${arr[1]}`]);
        }
      } else if (other.name.startsWith("Lock")) {
        engine.clock.schedule(() => {
          other.kill();
          this.scene.emit("openLock", other.name);
        }, 150);
      }
    });

    this.on("collisionend", ({ other }) => {
      if (other.name === "Trap") {
        other.graphics.visible = false;
      } else if (other.name === '2_Rotate') {
        this.playerRotateCount -= 1;
        this.scene.rotate2Platform(other.pos.x, other.pos.y);
        if (this.playerRotateCount === 0) {
          this.onRotatePlatform = null;
        }
      } else if (other.name === '4_Rotate') {
        this.playerRotateCount -= 1;
        this.scene.rotate4Platform(other.pos.x, other.pos.y);
        if (this.playerRotateCount === 0) {
          this.onRotatePlatform = null;
        }
      } else if ((other.hasTag("Convertor_Up") || other.hasTag('Convertor_Down') || other.hasTag("Convertor_Right") || other.hasTag('Convertor_Left')) && this.playerConvertorCount > 0) {
        this.playerConvertorCount -= 1;
        this.blockX = this.pos.x / BLOCK_SIZE ^ 0;
        this.blockY = this.pos.y / BLOCK_SIZE ^ 0;
      }
    });
  }

  update(engine: Engine): void {
    if (this.isFreeze) return;
    if (
      this.mobileDirection === 11 ||
      engine.input.keyboard.wasPressed(Keys.R)
    ) {
      this.scene.emit("playerDied", undefined);
    }
    if (!this.scene.lockCamera) {
      if (this.mobileDirection === Directon.UP) {
        this.scene.camera.vel = vec(0, -this.speedView);
      } else if (this.mobileDirection === Directon.DOWN) {
        this.scene.camera.vel = vec(0, this.speedView);
      } else if (this.mobileDirection === Directon.LEFT) {
        this.scene.camera.vel = vec(-this.speedView, 0);
      } else if (this.mobileDirection === Directon.RIGHT) {
        this.scene.camera.vel = vec(this.speedView, 0);
      } else {
        this.scene.camera.vel = Vector.Zero;
      }
      return;
    }

    const isOnPoint =
      this.oldPos.x === this.pos.x && this.oldPos.y === this.pos.y;
    if (!isOnPoint) {
      if (this.oldPos.x < this.pos.x) {
        this.direction = Directon.RIGHT;
        this.currentAnimation = ListAnimation.right;
      } else if (this.oldPos.x > this.pos.x) {
        this.direction = Directon.LEFT;
        this.currentAnimation = ListAnimation.left;
      } else if (this.oldPos.y < this.pos.y) {
        this.currentAnimation = ListAnimation.down;
        this.direction = Directon.DOWN;
      } else if (this.oldPos.y > this.pos.y) {
        this.direction = Directon.UP;
        this.currentAnimation = ListAnimation.up;
      }
      this.graphics.use(`${this.direction}`);
      if (!this.currentAnimation.isPlaying && !this.playerConvertorCount) {
        this.currentAnimation.play();
      }
      if (!isMobile && this.isSendRestartMessage) {
        this.isSendRestartMessage = false;
        this.scene.emit('hideRestartMessage');
      }
    } else if (this.currentAnimation.isPlaying) {
      this.idleFrame = 0;
      this.currentAnimation.goToFrame(3);
      this.currentAnimation.pause();
    } else {
      // Эта ветка активируется когда кролик афк
      if (this.idleFrame <= 300) {
        this.idleFrame += 1
      }
      if (this.idleFrame === 300) {
        ListAnimation.idle.reset()
        ListAnimation.idle.play()
        this.graphics.use('idle')
        if (!isMobile) {
          this.scene.emit('showRestartMessage')
          this.isSendRestartMessage = true;
        }
      }
    }
    if (isOnPoint && !this.playerConvertorCount) {
      this.move(engine);
    }
  }

  move(engine: Engine) {
    if (
      (this.mobileDirection === Directon.UP ||
      MoveKeys.Up.find(key => engine.input.keyboard.isHeld(key))) &&
      (this.pos.y - 0x8) / BLOCK_SIZE === this.blockY
    ) {
      if (
        this.onRotatePlatform === "X" ||
        this.onRotatePlatform === 2 ||
        this.onRotatePlatform === 1
      ) {
        return;
      }
      const coord = `${this.blockX}x${this.blockY - 1}`;
      const platform = this.scene.rotatePlatform.get(coord);
      if (
        this.scene.collisionMap.has(coord) ||
        (platform &&
          (platform.state === "X" ||
            ((platform.state === 1 || platform.state === 2) &&
              this.blockY < platform.y) ||
            ((platform.state === 3 || platform.state === 4) &&
              this.blockY > platform.y)) ||
              this.scene.convertorPlatform.get(coord) === "Convertor_Down")
      ) {
        return;
      }
      this.actions.moveBy(0, -BLOCK_SIZE, SPEED);
      this.blockY -= 1;
      this.steps += 1;
    } else if (
      (this.mobileDirection === Directon.DOWN ||
        MoveKeys.Down.find(key => engine.input.keyboard.isHeld(key))) &&
      (this.pos.y - 0x8) / BLOCK_SIZE === this.blockY
    ) {
      if (
        this.onRotatePlatform === "X" ||
        this.onRotatePlatform === 3 ||
        this.onRotatePlatform === 4
      ) {
        return;
      }
      const coord = `${this.blockX}x${this.blockY + 1}`;
      const platform = this.scene.rotatePlatform.get(coord);
      if (
        this.scene.collisionMap.has(coord) ||
        (platform &&
          (platform.state === "X" ||
            ((platform.state === 3 || platform.state === 4) &&
              this.blockY > platform.y) ||
            ((platform.state === 1 || platform.state === 2) &&
              this.blockY < platform.y)) ||
              this.scene.convertorPlatform.get(coord) === "Convertor_Up")
      ) {
        return;
      }
      this.actions.moveBy(0, BLOCK_SIZE, SPEED);
      this.blockY += 1;
      this.steps += 1;
    } else if (
      (this.mobileDirection === Directon.RIGHT ||
        MoveKeys.Right.find(key => engine.input.keyboard.isHeld(key))) &&
      (this.pos.x - 0x8) / BLOCK_SIZE === this.blockX
    ) {
      if (
        this.onRotatePlatform === "Y" ||
        this.onRotatePlatform === 2 ||
        this.onRotatePlatform === 3
      ) {
        return;
      }
      const coord = `${this.blockX + 1}x${this.blockY}`;
      const platform = this.scene.rotatePlatform.get(coord);
      if (
        this.scene.collisionMap.has(coord) ||
        (platform &&
          (platform.state === "Y" ||
            ((platform.state === 2 || platform.state === 3) &&
              this.blockX > platform.x) ||
            ((platform.state === 1 || platform.state === 4) &&
              this.blockX < platform.x))) ||
        this.scene.convertorPlatform.get(coord) === "Convertor_Left"
      ) {
        return;
      }
      this.actions.moveBy(BLOCK_SIZE, 0, SPEED);
      this.blockX += 1;
      this.steps += 1;
    } else if (
      (this.mobileDirection === Directon.LEFT ||
        MoveKeys.Left.find(key => engine.input.keyboard.isHeld(key))) &&
      (this.pos.x - 0x8) / BLOCK_SIZE === this.blockX
    ) {
      if (
        this.onRotatePlatform === "Y" ||
        this.onRotatePlatform === 1 ||
        this.onRotatePlatform === 4
      ) {
        return;
      }
      const coord = `${this.blockX - 1}x${this.blockY}`;
      const platform = this.scene.rotatePlatform.get(coord);
      if (
        this.scene.collisionMap.has(coord) ||
        (platform &&
          (platform.state === "Y" ||
            ((platform.state === 1 || platform.state === 4) &&
              this.blockX < platform.x) ||
            ((platform.state === 2 || platform.state === 3) &&
              this.blockX > platform.x))) ||
        this.scene.convertorPlatform.get(coord) === "Convertor_Right"
      ) {
        return;
      }
      this.actions.moveBy(-BLOCK_SIZE, 0, SPEED);
      this.blockX -= 1;
      this.steps += 1;
    }
  }

  onTakeCarrot(carrot: Actor) {
    carrot.kill();
    this.scene.emit("takeCarrot");
  }

  checkNextConvertorCollision(actor: Actor, Dir: Directon) {
    if (this.scene.carrots === undefined) {
      const x = actor.pos.x / BLOCK_SIZE,
        y = actor.pos.y / BLOCK_SIZE - 1;

      if (this.scene.collisionMap.get(getNextPosition(Dir, x, y))) {
        return 
      }
    }
      this.playerConvertorCount += 1;
      this.actions
      .moveBy(...moveDirectionOnConvertor[Dir], SPEED)
  }

  onNestEgg(nest: Actor) {
    nest.graphics.use(this.scene.getSprite(47));
    const lockPos = `${nest.pos.x / BLOCK_SIZE}x${nest.pos.y / BLOCK_SIZE - 1}`;
    this.scene.collisionMap.set(lockPos, true);
    this.scene.emit("nestEgg");
  }
}
