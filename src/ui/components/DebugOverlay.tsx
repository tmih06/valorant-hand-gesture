import { useEffect, useRef } from 'react';
import { NormalizedLandmark, HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface DebugOverlayProps {
    width: number;
    height: number;
    results: HandLandmarkerResult | null;
}

export const DebugOverlay = ({ width, height, results }: DebugOverlayProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        if (results && results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawHand(ctx, landmarks, width, height);
            }
        }
    }, [results, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
        />
    );
};

const drawHand = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number) => {
    // Draw connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00FF00';

    const connections = [
        [0, 1, 2, 3, 4], // Thumb
        [0, 5, 6, 7, 8], // Index
        [0, 9, 10, 11, 12], // Middle
        [0, 13, 14, 15, 16], // Ring
        [0, 17, 18, 19, 20] // Pinky
    ];

    connections.forEach(points => {
        ctx.beginPath();
        points.forEach((idx, i) => {
            const x = landmarks[idx].x * width;
            const y = landmarks[idx].y * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    });

    // Draw points
    ctx.fillStyle = '#FF0000';
    landmarks.forEach(lm => {
        const x = lm.x * width;
        const y = lm.y * height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
};
