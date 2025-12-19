import { NormalizedLandmark } from '@mediapipe/tasks-vision';

// Load Fireball Asset Lazily
let fireballImg: HTMLImageElement | null = null;
const isProd = process.env.NODE_ENV === 'production';
const FIREBALL_IMG_URL = isProd ? '/valorant-hand-gesture/assets/phoenix fireball.png' : '/assets/phoenix fireball.png';

export const drawHand = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number, debugInfo?: string[]) => {
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

    // Draw Debug Info
    if (debugInfo && debugInfo.length > 0) {
        ctx.save();
        ctx.scale(-1, 1); // Flip text back so it's readable (since canvas is mirrored)
        ctx.translate(-width, 0); // Re-align after flip

        ctx.font = '16px monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 250, 20 + (debugInfo.length * 20));

        ctx.fillStyle = '#00FFFF';
        debugInfo.forEach((line, i) => {
            ctx.fillText(line, 20, 30 + (i * 20));
        });

        ctx.restore();
    }
};

export const drawEffects = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number, hasFireball: boolean) => {
    if (hasFireball) {
        if (!fireballImg && typeof window !== 'undefined') {
            fireballImg = new Image();
            fireballImg.src = FIREBALL_IMG_URL;
        }

        // Calculate Centroid of Thumb(4), Index(8), Middle(12)
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];

        const cx = ((thumb.x + index.x + middle.x) / 3) * width;
        const cy = ((thumb.y + index.y + middle.y) / 3) * height;

        const size = 150; // Increased size slightly for bloom

        ctx.save();
        ctx.translate(cx, cy);

        // --- Bloom Effect ---
        // 1. Outer Glow (Large, soft orange)
        const outerGlow = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.8);
        outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
        outerGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');

        ctx.globalCompositeOperation = 'screen'; // Use screen blend mode for glowing effect
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, 2 * Math.PI);
        ctx.fill();

        // 2. High Intensity Core (Small, bright yellow/white)
        const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
        coreGlow.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
        coreGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.5)');
        coreGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, 2 * Math.PI);
        ctx.fill();

        // Reset Composite Operation for Image
        ctx.globalCompositeOperation = 'source-over';

        // Draw Image
        if (fireballImg && fireballImg.complete && fireballImg.naturalWidth !== 0) {
            // Pulsating effect
            const time = Date.now() / 200;
            const pulse = 1 + Math.sin(time) * 0.05;
            const pulseSize = size * pulse;

            ctx.drawImage(fireballImg, -pulseSize / 2, -pulseSize / 2, pulseSize, pulseSize);
        } else {
            // Fallback
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.restore();
    }
};
