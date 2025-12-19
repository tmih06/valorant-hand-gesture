export type Point = {
    x: number;
    y: number;
    z: number;
};

export interface GestureResult {
    name: string;
    score: number;
    handedness: 'Left' | 'Right';
}
