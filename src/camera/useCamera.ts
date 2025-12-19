import { useState, useEffect, useRef } from 'react';

interface CameraState {
  stream: MediaStream | null;
  error: Error | null;
  permission: 'prompt' | 'granted' | 'denied';
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    stream: null,
    error: null,
    permission: 'prompt',
  });

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (mounted) {
          setCameraState({ stream, error: null, permission: 'granted' });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };
          }
        }
      } catch (err) {
        if (mounted) {
          setCameraState(prev => ({
            ...prev,
            error: err instanceof Error ? err : new Error('Failed to access camera'),
            permission: 'denied',
          }));
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (cameraState.stream) {
        cameraState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once on mount

  return { videoRef, ...cameraState };
};
