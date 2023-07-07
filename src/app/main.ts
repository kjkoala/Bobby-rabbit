import { Engine, Input, Loader } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { Level } from "src/scenes/level";
import { levels } from "./levels";

const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: 240,
    height: 256,
  },
  pointerScope: Input.PointerScope.Canvas,
  fixedUpdateFps: 60,
})
const tileMaps = levels.map(level => new TiledMapResource(level as  unknown as string))

engine.addScene('level', new Level(tileMaps, 0))

const loader = new Loader(tileMaps)
engine.start(loader).then(() => {
    engine.goToScene('level')
    // tiledMapResource.addTiledMapToScene(engine.currentScene);
    // const carrots = tiledMapResource.data.objectGroups.find(obj => obj.name === 'Carrots')
    // const playerStart = tiledMapResource.data.objectGroups[0].objects.find(obj => obj.name === 'player-start')
    // if (playerStart && playerStart.x && playerStart.y) {
    //   engine.add(new Bobby(playerStart.x, playerStart.y))
    // }

    // engine.currentScene.camera.zoom = 2;
});