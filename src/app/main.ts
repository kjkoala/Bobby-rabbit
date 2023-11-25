import { Color, Engine, Loader, DisplayMode } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { eggs_levels, levels } from "./levels";
import { resources } from "./resources";
import { Menu } from "src/scenes/mainMenu";
import { isMobile } from "src/common/constants";

const tilemap = `data:image/png;base64,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`
const tileFinish = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAMAAACROYkbAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAwUExURWB4cLDQ2NDg6Pj4+KiIYLiYcMCgcMiogNCwiNi4kLgwKMhAONhgWOiQgPC4qOgAADZfwF0AAAE2SURBVHjalFMLjoUgDBxBLA/53P+2O21xxWxM9jURnem0tFAhIscRIi2IfEQM10Gr73jRg4RBpw4V1NEVdYZMPG3iQBetmx6STWtEjHTn0UjQYmzDsPtMozjGK6HqofE3ET2+KbK3xfdZoWbw+JmQegQjpptdVC6z5kquVlV3ZmxdJTVES61GMgZYKq1Z3bp0dfgOzbbpXv38cHn19KSgr5vg43ytrhy+eFumMK9W5oq3BNdW/0nwbOGMawvxPGcj1kIb558WtuchbqWth9hKWQ6RsWV7HuIGPK8RGP2+xj6If69RCwGe1wgkrIOElCyDDxLjFS+DpHjdkOGy4x5l7EI8rlEeF77M8T3KxJC0AxtzBLaT+HcoLioo73jR45OzUmp7ypK/xZAjHUfaaUn8Z/0O/wgwANnwIcG9/pZKAAAAAElFTkSuQmCC`


const convertPath = (map: TiledMapResource) => {
  map.convertPath = (_originPath: string, relativePath: string): string => {
    if (relativePath === '1level.png') {
      return tilemap
    }
    if (relativePath === 'tile_finish.png') {
      return tileFinish
    }
    return 'levels/'+relativePath
  }
}


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

eggsMaps.forEach(convertPath)

carrotsMaps.forEach(convertPath)

const loader = new Loader([...Object.values(resources), ...carrotsMaps, ...eggsMaps])

loader.playButtonText = "Запустить игру";
engine.start(loader).then(() => {
    engine.goToScene('menu')
});