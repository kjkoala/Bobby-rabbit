import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import {
  Actor,
  CollisionType,
  Engine,
  Scene,
  BoundingBox,
  Graphic,
} from "excalibur";
import { Bobby } from "src/actors/Bobby";
import HUD from "src/ui/HUD.svelte";
import {
  convertorDownAnim,
  convertorLeftAnim,
  convertorRightAnim,
  convertorUpAnim,
} from "src/animations/Convertor";
import {
  DEFAULT_VOLUME,
  carrots_levels,
  eggs_levels,
  getLevelsLocalStorage,
  isMobile,
} from "src/common/constants";
import VK from "src/common/VKBridge";
import { Menu } from "./mainMenu";
import { getMusicStatus } from "src/common/getMusicStatus";
import { resources } from "src/app/resources";

export const BLOCK_SIZE = 16;

export class Level extends Scene {
  declare player: Bobby;
  levels: TiledMapResource[];
  currentLevel: number;
  carrots: number | undefined;
  nests: number | undefined;
  mapWidth!: number;
  convertorPlatform!: Map<any, any>;
  collisionMap!: Map<string, boolean>;
  rotatePlatform!: Map<
    string,
    { state: string | number; actor: Actor; x: number; y: number }
  >;
  convertorButtons!: Map<string, boolean> | null;
  rotateButtons!: Map<string, boolean> | null;
  locks!: Record<string, string> | null;
  hud!: HUD;
  lockCamera: boolean;
  startLevelTime: number;
  constructor(carrotsMaps: TiledMapResource[], currentLevel: number) {
    super();
    this.levels = carrotsMaps;
    this.currentLevel = currentLevel;
    this.lockCamera = true;
    this.startLevelTime = 0;
  }
  onInitialize(engine: Engine): void {
    const currentMap = this.levels[this.currentLevel];
    this.mapWidth = currentMap.data.width;
    this.collisionMap = new Map();
    this.rotatePlatform = new Map();
    this.convertorPlatform = new Map();
    this.convertorButtons = null;
    this.rotateButtons = null;
    this.locks = null;
    const rotatePlatform = currentMap.data.objectGroups.find(
      (object) => object.name === "Rotate"
    );
    const convertorButtons = currentMap.data.objectGroups.find(
      (object) => object.name === "ConvertorButtons"
    );
    const rotateButtons = currentMap.data.objectGroups.find(
      (object) => object.name === "RotateButtons"
    );
    const traps = currentMap.data.objectGroups.find(
      (object) => object.name === "Traps"
    );

    const wall = this.findIndexLayer(currentMap, "Wall");
    this.createMapForCollision(wall);

    this.carrots =
      currentMap.data.objectGroups.find((obj) => obj.name === "Carrots")
        ?.objects.length;

    if (!this.carrots) {
      this.nests = currentMap.data.objectGroups.find(
        (obj) => obj.name === "Nests"
      )?.objects.length;
    }

    const playerStart = currentMap.data.objectGroups
      .find((obj) => obj.name === "Camera")
      ?.objects.find((obj) => obj.name === "player-start");
    if (playerStart && playerStart.x && playerStart.y) {
      engine.add(new Bobby(playerStart.x, playerStart.y));
    }
    currentMap.addTiledMapToScene(engine.currentScene);

    if (convertorButtons) {
      this.convertorButtons = new Map(
        (convertorButtons.properties[0].value as string)
          .split(",")
          .map((el: string) => {
            const els = el.split("=");
            els[1] = JSON.parse(els[1]);
            return els;
          }) as [string, boolean][]
      );
    }

    if (rotateButtons) {
      this.rotateButtons = new Map(
        (rotateButtons.properties[0].value as string)
          .split(",")
          .map((el: string) => {
            const els = el.split("=");
            els[1] = JSON.parse(els[1]);
            return els;
          }) as [string, boolean][]
      );
    }

    this.player = this.actors.find((actor) => actor.name === "Bobby") as Bobby;
    if (isMobile) {
      this.lockCameraOnActor(this.lockCamera);
    }
    this.actors.forEach((actor) => {
      if (actor.name.startsWith("Convertor_Right")) {
        this.changeRotation(actor, "", "Convertor_Right", convertorRightAnim);
      } else if (actor.name.startsWith("Convertor_Left")) {
        this.changeRotation(actor, "", "Convertor_Left", convertorLeftAnim);
      } else if (actor.name.startsWith("Convertor_Up")) {
        this.changeRotation(actor, "", "Convertor_Up", convertorUpAnim);
      } else if (actor.name.startsWith("Convertor_Down")) {
        this.changeRotation(actor, "", "Convertor_Down", convertorDownAnim);
      } else if (actor.name.startsWith("Convertor")) {
        this.convertorControl(actor);
      } else if (actor.name.startsWith("RotateButton")) {
        this.rotateControl(actor);
      } else if (actor.name.startsWith("Lock")) {
        const lockPos = `${actor.pos.x / BLOCK_SIZE}x${
          actor.pos.y / BLOCK_SIZE - 1
        }`;
        this.collisionMap.set(lockPos, true);
        if (this.locks) {
          this.locks[actor.name] = lockPos;
        } else {
          this.locks = {
            [actor.name]: lockPos,
          };
        }
      } else if (actor.name === 'Trap') {
        const trap = traps?.objects.find(trap => trap.x === actor.pos.x && trap.y === actor.pos.y)
        const hide = trap?.properties.find((prop) => prop.name === 'hide')
        if (hide?.value) {
          actor.graphics.visible = false
        }
      } else if (actor.name === '2_Rotate' || actor.name === '4_Rotate') {
        const platform = rotatePlatform?.objects.find(rotate => rotate.x === actor.pos.x && rotate.y === actor.pos.y)
        if (platform) {
          const state = platform.properties.find((prop) => prop.name === "state");
          const x = actor.pos.x / BLOCK_SIZE;
          const y = actor.pos.y / BLOCK_SIZE - 1;
          this.rotatePlatform.set(`${x}x${y}`, {
          state: state!.value as string,
          x,
          y,
          actor,
        });
        }
      }
    });

    this.on("takeCarrot", () => {
      this.countEntity("carrots");
    });

    this.on("nestEgg", () => {
      this.countEntity("nests");
    });

    this.on("levelComplete", () => {
      engine.clock.schedule(() => {
        VK.countLevel().finally(() => {
          engine.removeScene(this);
          const nextLevel = this.currentLevel + 1;
          if (nextLevel >= this.levels.length) {
            engine.goToScene("endLevel");
          } else {
            engine.addScene("level", new Level(this.levels, nextLevel));
            engine.goToScene("level");
          }
        });
      }, 5000);
    });

    this.on("playerDied", () => {
      // engine.clock.schedule(() => {
      engine.removeScene(this);
      engine.addScene("level", new Level(this.levels, this.currentLevel));
      engine.goToScene("level");
      // }, 1000)
    });

    this.hud = new HUD({
      target: document.querySelector("#root")!,
      props: {
        scene: this,
      },
    });
  }

  goToMenu() {
    if (!this.player.isFreeze) {
      this.engine.addScene('menu', new Menu)
      this.engine.goToScene('menu')
    }
  }

  onDeactivate() {
    this.engine.removeScene(this);
    this.hud.$destroy();
  }

  countEntity(name: "carrots" | "nests") {
      this[name]! -= 1;
      if (this[name]! <= 0) {
        const finish = this.actors.find((obj) => obj.name === "Finish");
        if (finish) {
          finish.graphics.visible = false;
        }
      }
  }

  lockCameraOnActor(lock: boolean) {
    if (lock) {
      this.camera.strategy.lockToActor(this.player);
    } else {
      this.camera.clearAllStrategies();
    }
    this.camera.zoom = 2.3;
    this.camera.strategy.limitCameraBounds(new BoundingBox(0, 0, 256, 256));
    this.lockCamera = lock;
  }

  convertorControl(actor?: Actor) {
    if (this.convertorButtons && actor) {
      if (this.convertorButtons.get(actor.name)) {
        actor.graphics.visible = true;
        actor.body.collisionType = CollisionType.Passive;
      } else {
        actor.graphics.visible = false;
        actor.body.collisionType = CollisionType.PreventCollision;
      }
    } else {
      this.actors.forEach((actor) => {
        if (actor.name.startsWith("Convertor")) {
          if (actor.hasTag("Convertor_Left")) {
            this.changeRotation(
              actor,
              "Convertor_Left",
              "Convertor_Right",
              convertorRightAnim
            );
          } else if (actor.hasTag("Convertor_Right")) {
            this.changeRotation(
              actor,
              "Convertor_Right",
              "Convertor_Left",
              convertorLeftAnim
            );
          } else if (actor.hasTag("Convertor_Up")) {
            this.changeRotation(
              actor,
              "Convertor_Up",
              "Convertor_Down",
              convertorDownAnim
            );
          } else if (actor.hasTag("Convertor_Down")) {
            this.changeRotation(
              actor,
              "Convertor_Down",
              "Convertor_Up",
              convertorUpAnim
            );
          }
          if (actor.name.startsWith("ConvertorButton")) {
            if (actor.body.collisionType === CollisionType.PreventCollision) {
              actor.graphics.visible = true;
              actor.body.collisionType = CollisionType.Passive;
            } else if (actor.body.collisionType === CollisionType.Passive) {
              actor.graphics.visible = false;
              actor.body.collisionType = CollisionType.PreventCollision;
            }
          }
        }
      });
    }
  }

  changeRotation(
    actor: Actor,
    prevName: string,
    nextName: string,
    animation: Graphic
  ) {
    this.convertorPlatform.set(
      `${actor.pos.x / BLOCK_SIZE}x${actor.pos.y / BLOCK_SIZE - 1}`,
      nextName
    );
    actor.removeTag(prevName);
    actor.addTag(nextName);
    actor.graphics.use(animation);
  }

  rotateControl(actor?: Actor) {
    if (this.rotateButtons && actor) {
      if (this.rotateButtons.get(actor.name)) {
        actor.graphics.visible = true;
        actor.body.collisionType = CollisionType.Passive;
      } else {
        actor.graphics.visible = false;
        actor.body.collisionType = CollisionType.PreventCollision;
      }
    } else {
      this.actors.forEach((actor) => {
        if (actor.name.startsWith("RotateButton")) {
          if (actor.body.collisionType === CollisionType.PreventCollision) {
            actor.graphics.visible = true;
            actor.body.collisionType = CollisionType.Passive;
          } else if (actor.body.collisionType === CollisionType.Passive) {
            actor.graphics.visible = false;
            actor.body.collisionType = CollisionType.PreventCollision;
          }
        }
      });
      this.rotatePlatform.forEach((platformState, name) => {
        if (platformState.state === "X" || platformState.state === "Y") {
          this.rotate2Platform(name);
        } else {
          this.rotate4Platform(name);
        }
      });
    }
  }
  rotate2Platform(x: string): void;
  rotate2Platform(x: number, y: number): void;
  rotate2Platform(x: string | number, y?: number) {
    const platform =
      typeof x === "string"
        ? this.rotatePlatform.get(x)
        : this.rotatePlatform.get(`${x / BLOCK_SIZE}x${y! / BLOCK_SIZE - 1}`);
    if (platform) {
      if (platform.state === "Y") {
        platform.state = "X";
        platform.actor.graphics.use(this.getSprite(29));
      } else {
        platform.state = "Y";
        platform.actor.graphics.use(this.getSprite(30));
      }
    }
  }

  rotate4Platform(x: string): void;
  rotate4Platform(x: number, y: number): void;
  rotate4Platform(x: string | number, y?: number) {
    const platform =
      typeof x === "string"
        ? this.rotatePlatform.get(x)
        : this.rotatePlatform.get(`${x / BLOCK_SIZE}x${y! / BLOCK_SIZE - 1}`);
    if (platform) {
      if (platform.state === 1) {
        platform.state = 2;
        platform.actor.graphics.use(this.getSprite(26));
      } else if (platform.state === 2) {
        platform.state = 3;
        platform.actor.graphics.use(this.getSprite(27));
      } else if (platform.state === 3) {
        platform.state = 4;
        platform.actor.graphics.use(this.getSprite(28));
      } else if (platform.state === 4) {
        platform.state = 1;
        platform.actor.graphics.use(this.getSprite(25));
      }
    }
  }

  getSprite(gid: number) {
    return this.levels[this.currentLevel].getSpriteForGid(gid);
  }

  createMapForCollision(wall: number[]) {
    for (var y = 0; y <= this.mapWidth; y++) {
      var yStart = y * this.mapWidth;
      var yFinish = (y + 1) * this.mapWidth;
      for (var x = 0; x < wall.length; x++) {
        if (wall[x] >= yStart && wall[x] <= yFinish) {
          this.collisionMap.set(`${wall[x] - yStart}x${y}`, true);
        }
      }
    }
  }

  findIndexLayer(currentMap: TiledMapResource, name: string) {
    const layer = currentMap.data.layers.find((obj) => obj.name === name);
    if (layer && Array.isArray(layer.data)) {
      return layer.data.reduce<number[]>((acc, item, index) => {
        if (item > 0) {
          acc.push(index);
        }
        return acc;
      }, []);
    }
    return [];
  }

  playSound(title: 'mp3Death' | 'mp3Clered') {
    if (getMusicStatus()) {
      resources[title].play(DEFAULT_VOLUME)
    }
  }

  computedTime() {
    const finishTime = this.engine.clock.now() - this.startLevelTime;
    const nameStorage = this.carrots !== undefined ? carrots_levels : eggs_levels;
      const stogareLevels = getLevelsLocalStorage(nameStorage);
      stogareLevels.push({
        time: finishTime,
        steps: this.player.steps,
        level: this.currentLevel,
      });
      localStorage.setItem(nameStorage, JSON.stringify(stogareLevels));
    return finishTime;
  }

  // TODO: Только для дебага
  handleNextLevel() {
    if (this.currentLevel + 1 < this.levels.length) {
      this.engine.removeScene(this);
      this.engine.addScene(
        "level",
        new Level(this.levels, this.currentLevel + 1)
      );
      this.engine.goToScene("level");
    }
  }

  handlePrevLevel() {
    if (this.currentLevel > 0) {
      this.engine.removeScene(this);
      this.engine.addScene(
        "level",
        new Level(this.levels, this.currentLevel - 1)
      );
      this.engine.goToScene("level");
    }
  }
}
