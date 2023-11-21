import { Directon } from "src/actors/types";
import { BLOCK_SIZE } from "./constants";

export const moveDirectionOnConvertor: Record<Directon, [number, number]> = {
    [Directon.DOWN]: [0, BLOCK_SIZE],
    [Directon.UP]: [0, -BLOCK_SIZE],
    [Directon.LEFT]: [-BLOCK_SIZE, 0],
    [Directon.RIGHT]: [BLOCK_SIZE, 0],
}

export const getNextPosition = (Dir: Directon, x: number, y: number) => {
    const types = {
        [Directon.DOWN]: `${x}x${y + 1}`,
        [Directon.UP]: `${x}x${y - 1}`,
        [Directon.LEFT]: `${x - 1}x${y}`,
        [Directon.RIGHT]: `${x + 1}x${y}`,
    }

    return types[Dir] || `${x}x${y}`
}