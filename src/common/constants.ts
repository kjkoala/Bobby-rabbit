export const DEFAULT_VOLUME = 0.5;

export const carrots_levels = 'carrots_levels'
export const eggs_levels = 'eggs_levels'
export const BLOCK_SIZE = 0x10;


export const getLevelsLocalStorage = (storageLevelName: 'carrots_levels' | 'eggs_levels') => JSON.parse(localStorage.getItem(storageLevelName) ?? '[]') as { steps: number; time: number, level: number }[];
export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);