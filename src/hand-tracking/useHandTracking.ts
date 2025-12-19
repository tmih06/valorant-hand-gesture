import { useEffect, useRef, useState, useCallback } from 'react';
import { VisionService, VisionConfig, DEFAULT_CONFIG } from './VisionService';
import { HandLandmarkerResult, GestureRecognizerResult } from '@mediapipe/tasks-vision';

export const useHandTracking = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    onResult: (result: HandLandmarkerResult | GestureRecognizerResult | null) => void,
    isEnabled: boolean = true
) => {
    const [isInitializing, setIsInitializing] = useState(true);
    const [currentConfig, setCurrentConfig] = useState<VisionConfig>(DEFAULT_CONFIG);

    const requestRef = useRef<number>(0);
    const serviceRef = useRef<VisionService>(VisionService.getInstance());
    const onResultRef = useRef(onResult);

    // Keep callback fresh without re-triggering effect
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    const lastVideoTimeRef = useRef<number>(-1);

    const animate = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
            // Optimization: Only process if video time has changed
            if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = videoRef.current.currentTime;

                const now = performance.now();
                const { result } = serviceRef.current.detect(videoRef.current, now);

                // Call back immediately, NO STATE SET HERE
                onResultRef.current(result);
            }
        }
        requestRef.current = requestAnimationFrame(animate);
    }, [videoRef]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setIsInitializing(true);
            await serviceRef.current.initialize(currentConfig);
            setIsInitializing(false);
        };
        init();
    }, []); // Run once

    // Reconfigure helper
    const updateConfig = useCallback(async (newConfig: Partial<VisionConfig>) => {
        setIsInitializing(true);
        const merged = { ...currentConfig, ...newConfig };
        setCurrentConfig(merged);
        await serviceRef.current.reconfigure(merged);
        setIsInitializing(false);
    }, [currentConfig]);

    useEffect(() => {
        if (!isEnabled || isInitializing) {
            cancelAnimationFrame(requestRef.current);
            return;
        }

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isEnabled, isInitializing, animate]);

    return { isInitializing, updateConfig, currentConfig };
};
