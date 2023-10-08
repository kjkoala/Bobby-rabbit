import { ImageSource } from "excalibur";
import BobbyFade from 'public/bobby/bobby_fade.png'
import BobbyIdle from 'public/bobby/bobby_idle.png'
import BobbyDown from 'public/bobby/bobby_down.png'
import BobbyRight from 'public/bobby/bobby_right.png'
import BobbyLeft from 'public/bobby/bobby_left.png'
import BobbyUp from 'public/bobby/bobby_up.png'
import BobbyDeath from 'public/bobby/bobby_death.png'
import ConvertorRight from 'public/levels/tile_conveyor_right.png'
import ConvertorLeft from 'public/levels/tile_conveyor_left.png'
import ConvertorUp from 'public/levels/tile_conveyor_up.png'
import ConvertorDown from 'public/levels/tile_conveyor_down.png'
import End from 'public/end.png'
import HUD from 'public/hud.png'
import Arrow from 'public/arrow.png'

export const resources = {
    Bobby_idle: new ImageSource(BobbyIdle),
    Bobby_fade: new ImageSource(BobbyFade),
    Bobby_death: new ImageSource(BobbyDeath),
    Bobby_left: new ImageSource(BobbyLeft),
    Bobby_right: new ImageSource(BobbyRight),
    Bobby_up: new ImageSource(BobbyUp),
    Bobby_down: new ImageSource(BobbyDown),
    ConvertorRight: new ImageSource(ConvertorRight),
    ConvertorLeft: new ImageSource(ConvertorLeft),
    ConvertorUp: new ImageSource(ConvertorUp),
    ConvertorDown: new ImageSource(ConvertorDown),
    GameEnd: new ImageSource(End),
    HUD: new ImageSource(HUD),
    Arrow: new ImageSource(Arrow),
}