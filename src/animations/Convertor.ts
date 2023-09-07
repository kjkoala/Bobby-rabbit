import { resources } from 'src/app/resources';
import { SpriteSheet, Animation, range, AnimationStrategy } from 'excalibur'

const convertorLeftImage = SpriteSheet.fromImageSource({
    image: resources.ConvertorLeft,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 16,
        spriteHeight: 16
    }
});

const convertorRightImage = SpriteSheet.fromImageSource({
    image: resources.ConvertorRight,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 16,
        spriteHeight: 16
    }
});

const convertorUpImage = SpriteSheet.fromImageSource({
    image: resources.ConvertorUp,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 16,
        spriteHeight: 16
    }
});
const convertorDownImage = SpriteSheet.fromImageSource({
    image: resources.ConvertorDown,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 16,
        spriteHeight: 16
    }
});

export const convertorRightAnim = Animation.fromSpriteSheet(convertorRightImage, range(0, 4), 90, AnimationStrategy.Loop)
export const convertorLeftAnim = Animation.fromSpriteSheet(convertorLeftImage, range(0, 4), 90, AnimationStrategy.Loop)
export const convertorUpAnim = Animation.fromSpriteSheet(convertorUpImage, range(0, 4), 90, AnimationStrategy.Loop)
export const convertorDownAnim = Animation.fromSpriteSheet(convertorDownImage, range(0, 4), 90, AnimationStrategy.Loop)