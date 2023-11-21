import { Color, Engine, Loader, DisplayMode } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { eggs_levels, levels } from "./levels";
import { resources } from "./resources";
import { EndGame } from "src/scenes/endGame";
import { Menu } from "src/scenes/mainMenu";
import { isMobile } from "src/common/constants";

const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: 256,
    height: 256,
  },

  displayMode: isMobile ? DisplayMode.FitScreenAndFill : undefined,
  fixedUpdateFps: 60,
  maxFps: 60,
  backgroundColor: Color.Black,
})

export const carrotsMaps = levels.map(level => new TiledMapResource(level))
export const eggsMaps = eggs_levels.map(level => new TiledMapResource(level))
engine.addScene('menu', new Menu)
engine.addScene('endLevel', new EndGame)

const loader = new Loader([...carrotsMaps, ...eggsMaps, ...Object.values(resources)])
engine.start(loader).then(() => {
    engine.goToScene('endLevel')
});