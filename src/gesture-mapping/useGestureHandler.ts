import { useEffect, useRef, useState } from 'react';
import { GestureType } from '../gesture-detection/GestureDetector';

type GestureCallback = () => void;

interface GestureMap {
    [key: string]: GestureCallback;
}

export const useGestureHandler = (
    currentGesture: GestureType,
    handlers: GestureMap,
    cooldownMs: number = 1000,
    minConfidenceFrames: number = 3
) => {
    const [lastTriggered, setLastTriggered] = useState<number>(0);
    const [triggerHistory, setTriggerHistory] = useState<GestureType[]>([]);

    // Maintain a history of frames to ensure stability
    // e.g., must see 'Fist' for 3 consecutive frames before triggering

    useEffect(() => {
        if (currentGesture === 'None') {
            setTriggerHistory([]);
            return;
        }

        setTriggerHistory(prev => {
            const newHistory = [...prev, currentGesture].slice(-minConfidenceFrames);

            // Check if we have enough consistent frames
            if (newHistory.length === minConfidenceFrames && newHistory.every(g => g === currentGesture)) {

                // Check cooldown
                const now = Date.now();
                if (now - lastTriggered > cooldownMs) {
                    const handler = handlers[currentGesture];
                    if (handler) {
                        handler();
                        setLastTriggered(now);
                    }
                }
            }

            return newHistory;
        });
    }, [currentGesture, handlers, cooldownMs, lastTriggered, minConfidenceFrames]);

    return { lastTriggered };
};
