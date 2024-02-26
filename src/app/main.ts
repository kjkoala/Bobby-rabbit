import { Color, Engine, Loader, DisplayMode, type Loadable } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { eggs_levels, levels } from "./levels";
import { resources } from "./resources";
import { Menu } from "src/scenes/mainMenu";
import { isMobile, tileFinish, tilemap } from "src/common/constants";
import VKBridge from "src/common/VKBridge";
import LoaderUI from 'src/ui/Loader.svelte'

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


export class CustomLoader extends Loader {
  loaderUI!: LoaderUI
  constructor(loadables?: Loadable<any>[]) {
    super(loadables)

    this.playButtonText = "Запустить игру";
  }

  wireEngine(engine: Engine): void {
    this.loaderUI = new LoaderUI({
      target: document.querySelector('#root')!,
    })

    super.wireEngine(engine)
  }

  destroyUI() {
    this.loaderUI.$destroy()
  }
  draw(): void {
    this.loaderUI.$set({
      loader: this.progress
    })
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

const loader = new CustomLoader([...Object.values(resources), ...carrotsMaps, ...eggsMaps])

loader.areResourcesLoaded()
.then(() => {
  VKBridge.loadingComplete()
  VKBridge.getSave()
})

engine.start(loader).then(() => {
    // Баг движка, если изменится размер экрана то при загрузке сцены экран не обновится
    window.dispatchEvent(new Event('resize'));
    loader.destroyUI()
    engine.goToScene('menu')
});