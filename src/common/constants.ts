export const DEFAULT_VOLUME = 0.5;

export const carrots_levels = 'carrots_levels'

export const getCarrotsLevelsLocalStorage = () => JSON.parse(localStorage.getItem(carrots_levels) ?? '[]') as { steps: number; time: number, level: number }[];
export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);