import { Engine, Input, Loader } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { Level } from "src/scenes/level";
import { levels } from "./levels";
import { resources } from "./resources";

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
const tileMaps = levels.map(level => new TiledMapResource(level))

engine.addScene('level', new Level(tileMaps, 0))

const loader = new Loader([...tileMaps, ...Object.values(resources)])
engine.start(loader).then(() => {
    engine.goToScene('level')
});