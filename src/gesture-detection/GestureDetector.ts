import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureType = 'None' | 'Open_Palm' | 'Fist' | 'Thumbs_Up' | 'Peace' | 'Pinch' | 'Pointing' | 'Snap';

export class GestureDetector {
    static detect(landmarks: NormalizedLandmark[]): GestureType {
        if (!landmarks || landmarks.length === 0) return 'None';

        const thumbIsOpen = GestureDetector.isThumbOpen(landmarks);
        const indexIsOpen = GestureDetector.isFingerOpen(landmarks, 8, 6, 5); // Index
        const middleIsOpen = GestureDetector.isFingerOpen(landmarks, 12, 10, 9); // Middle
        const ringIsOpen = GestureDetector.isFingerOpen(landmarks, 16, 14, 13); // Ring
        const pinkyIsOpen = GestureDetector.isFingerOpen(landmarks, 20, 18, 17); // Pinky

        const fingersOpenCount = [indexIsOpen, middleIsOpen, ringIsOpen, pinkyIsOpen].filter(Boolean).length;

        // Pinch vs Snap (Comparative Logic)
        const pinchDist = GestureDetector.getDistance(landmarks[4], landmarks[8]);
        const snapDist = GestureDetector.getDistance(landmarks[4], landmarks[12]);

        // Threshold for touching
        const TOUCH_THRESHOLD = 0.05;

        // Priority to the closer contact
        if (snapDist < TOUCH_THRESHOLD && snapDist < pinchDist) {
            return 'Snap';
        }

        if (pinchDist < TOUCH_THRESHOLD && pinchDist < snapDist) {
            return 'Pinch';
        }

        if (thumbIsOpen && fingersOpenCount === 4) return 'Open_Palm';
        if (!thumbIsOpen && fingersOpenCount === 0) return 'Fist';
        if (thumbIsOpen && fingersOpenCount === 0) return 'Thumbs_Up';
        if (!thumbIsOpen && indexIsOpen && middleIsOpen && !ringIsOpen && !pinkyIsOpen) return 'Peace';
        if (!thumbIsOpen && indexIsOpen && !middleIsOpen && !ringIsOpen && !pinkyIsOpen) return 'Pointing';

        // Fallback or specific combo not matched
        return 'None';
    }

    // Check if standard finger is open (Tip further from wrist than PIP joint is a simple heuristic, but checking pseudo-angle or relative y is often robust enough for basic cases)
    // Simple checks:
    // For non-thumb fingers: y coordinate of tip < y coordinate of pip (assuming hand is upright).
    // This fails if hand is inverted.
    // Better: Distance from wrist.
    private static isFingerOpen(landmarks: NormalizedLandmark[], tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
        const wrist = landmarks[0];
        const tip = landmarks[tipIdx];
        const pip = landmarks[pipIdx];

        // Distance check: Tip should be further from wrist than PIP
        // Also angle check can be added if needed
        return GestureDetector.dist(wrist, tip) > GestureDetector.dist(wrist, pip);
    }

    // Thumb is tricky. 
    private static isThumbOpen(landmarks: NormalizedLandmark[]): boolean {
        const wrist = landmarks[0];
        const tip = landmarks[4];
        const ip = landmarks[3];
        const mcp = landmarks[2];

        // Check if tip is further from 'little finger mcp' (17) than the thumb mcp (2) to determine extension laterally?
        // Or just simple distance from wrist again?
        // Thumb movement is complex. Let's use distance from index finger key points or simple extension.

        // Logic: Thumb tip is far from index MCP (5)
        return GestureDetector.dist(tip, landmarks[17]) > GestureDetector.dist(mcp, landmarks[17]);
    }

    private static dist(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    private static getDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
        return GestureDetector.dist(p1, p2);
    }
}
