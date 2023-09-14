import { Color, Engine, Loader } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { Level } from "src/scenes/level";
import { levels } from "./levels";
import { resources } from "./resources";
import { EndGame } from "src/scenes/endGame";

const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: 256,
    height: 256,
  },
  fixedUpdateFps: 60,
  backgroundColor: Color.Black,
})
const tileMaps = levels.map(level => new TiledMapResource(level))

engine.addScene('level', new Level(tileMaps, 0))
engine.addScene('endLevel', new EndGame)

const loader = new Loader([...tileMaps, ...Object.values(resources)])
engine.start(loader).then(() => {
    engine.goToScene('level')
    // engine.screen.goFullScreen('root')
});