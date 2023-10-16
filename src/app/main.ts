import { Color, Engine, Loader, DisplayMode } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { levels } from "./levels";
import { resources } from "./resources";
import { EndGame } from "src/scenes/endGame";
import { Menu } from "src/scenes/mainMenu";

const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: 256,
    height: 256,
  },

  displayMode: DisplayMode.FitScreenAndFill,
  fixedUpdateFps: 60,
  maxFps: 60,
  backgroundColor: Color.Black,
})

export const tileMaps = levels.map(level => new TiledMapResource(level))
engine.addScene('menu', new Menu)
engine.addScene('endLevel', new EndGame)

const loader = new Loader([...tileMaps, ...Object.values(resources)])
engine.start(loader).then(() => {
    engine.goToScene('menu')
});