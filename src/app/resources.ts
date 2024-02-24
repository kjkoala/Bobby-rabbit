import { ImageSource, Sound } from "excalibur";
import BobbyFade from '/bobby/bobby_fade.png'
import BobbyIdle from '/bobby/bobby_idle.png'
import BobbyDown from '/bobby/bobby_down.png'
import BobbyRight from '/bobby/bobby_right.png'
import BobbyLeft from '/bobby/bobby_left.png'
import BobbyUp from '/bobby/bobby_up.png'
import BobbyDeath from '/bobby/bobby_death.png'
import ConvertorRight from '/levels/tile_conveyor_right.png'
import ConvertorLeft from '/levels/tile_conveyor_left.png'
import ConvertorUp from '/levels/tile_conveyor_up.png'
import ConvertorDown from '/levels/tile_conveyor_down.png'
import End from '/end.png'
import HUD from '/hud.png'
import mp3Death from '/music/death.mp3'
import mp3Title from '/music/title.mp3'
import mp3Clered from '/music/cleared.mp3'
import mp3End from '/music/end.mp3'
import Restart from '/restart.png'
import Title from '/title.webp'
import Menu from '/menu.png'
import Arrows from '/arrows.png'

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
    mp3Death: new Sound(mp3Death),
    mp3Clered: new Sound(mp3Clered),
    mp3End: new Sound(mp3End),
    mp3Title: new Sound(mp3Title),
    Arrows: new ImageSource(Arrows),
    Restart: new ImageSource(Restart),
    Menu: new ImageSource(Menu),
    Title: new ImageSource(Title),
}