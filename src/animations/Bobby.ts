import { resources } from 'src/app/resources';
import { SpriteSheet, Animation, range, AnimationStrategy } from 'excalibur'

const idleImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_idle,
    grid: {
        rows: 1,
        columns: 3,
        spriteWidth: 18,
        spriteHeight: 26
    }
});
const leftImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_left,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 18,
        spriteHeight: 26
    }
});

const rightImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_right,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 18,
        spriteHeight: 26
    }
});
const upImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_up,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 18,
        spriteHeight: 26
    }
});
const downImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_down,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 18,
        spriteHeight: 25
    }
});
const fadeImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_fade,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 18,
        spriteHeight: 25
    }
});

const deathImage = SpriteSheet.fromImageSource({
    image: resources.Bobby_death,
    grid: {
        rows: 1,
        columns: 8,
        spriteWidth: 22,
        spriteHeight: 27
    }
});

export const idleAnim = Animation.fromSpriteSheet(idleImage, range(0, 3), 80, AnimationStrategy.Loop)
export const deathAnim = Animation.fromSpriteSheet(deathImage, range(0, 8), 80, AnimationStrategy.Freeze)
export const fadeOutAnim = Animation.fromSpriteSheet(fadeImage, range(0, 9), 90, AnimationStrategy.End)
export const leftAnim = Animation.fromSpriteSheet(leftImage, range(0, 8), 60, AnimationStrategy.Loop)
export const rightAnim = Animation.fromSpriteSheet(rightImage, range(0, 8), 60, AnimationStrategy.Loop)
export const upAnim = Animation.fromSpriteSheet(upImage, range(0, 8), 60, AnimationStrategy.Loop)
export const downAnim = Animation.fromSpriteSheet(downImage, range(0, 8), 60, AnimationStrategy.Loop)