'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useCamera } from '@/camera/useCamera';
import { useHandTracking } from '@/hand-tracking/useHandTracking';
import { GestureDetector, GestureType } from '@/gesture-detection/GestureDetector';
import { useGestureHandler } from '@/gesture-mapping/useGestureHandler';
import { ControlPanel } from '@/ui/components/ControlPanel';
import { SettingsPanel } from '@/ui/components/SettingsPanel';
import { drawHand, drawEffects } from '@/ui/drawingUtils';
import { AGENTS, Agent } from '@/agents/AgentDefinitions';
import { AgentSelector } from '@/ui/components/AgentSelector';

export default function Home() {
  const { videoRef, permission } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDebug, setIsDebug] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Agent State
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  // Flash State
  const [flashActive, setFlashActive] = useState(false);
  const [flashPosition, setFlashPosition] = useState<{ x: number, y: number } | null>(null);

  const selectedAgentRef = useRef<Agent | null>(null);
  const hasFireballRef = useRef(false);

  useEffect(() => { selectedAgentRef.current = selectedAgent; }, [selectedAgent]);

  // These states update at UI frequency, not frame frequency (ideally)
  const [currentGesture, setCurrentGesture] = useState<GestureType>('None');
  const [fps, setFps] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  // Refs for loop variables to avoid closures capturing old state
  const isDebugRef = useRef(isDebug);
  useEffect(() => { isDebugRef.current = isDebug; }, [isDebug]);

  const framesRef = useRef(0);
  const lastGestureRef = useRef<GestureType>('None');
  const lastAccuracyUpdateRef = useRef(0);

  // FPS Counter Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(framesRef.current);
      framesRef.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Gesture Filters
  const [enabledGestures, setEnabledGestures] = useState<Record<GestureType, boolean>>({
    'None': true,
    'Open_Palm': true,
    'Fist': true,
    'Thumbs_Up': true,
    'Peace': true,
    'Pinch': true,
    'Pointing': true,
    'Snap': true
  });
  const enabledGesturesRef = useRef(enabledGestures);
  useEffect(() => { enabledGesturesRef.current = enabledGestures; }, [enabledGestures]);

  // Frame Callback - Runs at 60fps+
  const onFrame = useCallback((results: any) => {
    framesRef.current++;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Clear Canvas
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Always clear
    }

    if (results && results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      let detected: GestureType = GestureDetector.detect(landmarks);

      // ML Gesture Override
      if ('gestures' in results && results.gestures.length > 0) {
        const mlGesture = results.gestures[0][0];
        if (mlGesture && mlGesture.score > 0.5) {
          switch (mlGesture.categoryName) {
            case 'Closed_Fist': detected = 'Fist'; break;
            case 'Open_Palm': detected = 'Open_Palm'; break;
            case 'Pointing_Up': detected = 'Pointing'; break;
            case 'Victory': detected = 'Peace'; break;
            case 'Thumb_Up': detected = 'Thumbs_Up'; break;
          }
          const geometricCheck = GestureDetector.detect(landmarks);
          if (geometricCheck === 'Pinch' || geometricCheck === 'Snap') {
            detected = geometricCheck;
          }
        }
      }

      // Filter: If detected gesture is NOT enabled, reset to None
      if (detected !== 'None' && !enabledGesturesRef.current[detected]) {
        detected = 'None';
      }

      // --- AGENT SKILL LOGIC ---
      if (selectedAgentRef.current?.id === 'phoenix') {
        // Snap -> Fireball
        if (detected === 'Snap' && !hasFireballRef.current) {
          hasFireballRef.current = true;
        }

        // Open Palm (w/ Fireball) -> Flash
        if (detected === 'Open_Palm' && hasFireballRef.current) {
          hasFireballRef.current = false;

          // Calculate centroid for flash origin
          const thumb = landmarks[4];
          const index = landmarks[8];
          const middle = landmarks[12];
          // Use video/canvas dimensions if available, otherwise normalize
          // Coordinates are 0-1, so we'll multiply by 100% in CSS or pixel values later
          // Let's store normalized 0-1 for state simplicity
          const cx = (thumb.x + index.x + middle.x) / 3;
          const cy = (thumb.y + index.y + middle.y) / 3;

          setFlashPosition({ x: 1 - cx, y: cy });
          setFlashActive(true);
          setTimeout(() => setFlashActive(false), 2000); // 2s flash fade
        }
      } else {
        hasFireballRef.current = false;
      }

      // Draw Loop
      if (canvas && ctx) {
        // Draw Effects
        if (selectedAgentRef.current?.id === 'phoenix') {
          drawEffects(ctx, landmarks, canvas.width, canvas.height, hasFireballRef.current);
        }

        if (isDebugRef.current) {
          const thumbTip = landmarks[4];
          const middleTip = landmarks[12];
          const indexTip = landmarks[8];

          const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          const snapDist = getDist(thumbTip, middleTip).toFixed(4);
          const pinchDist = getDist(thumbTip, indexTip).toFixed(4);

          const debugInfo = [
            `Snap Dist: ${snapDist} < 0.05?`,
            `Pinch Dist: ${pinchDist} < 0.05?`,
            `Agent: ${selectedAgentRef.current?.name || 'None'}`,
            `Fireball: ${hasFireballRef.current}`
          ];
          drawHand(ctx, landmarks, canvas.width, canvas.height, debugInfo);
        }
      }

      // Throttle accuracy updates to avoid React render spam (every 200ms)
      const now = Date.now();
      if (now - lastAccuracyUpdateRef.current > 200) {
        const score = results.handedness?.[0]?.[0]?.score || 0;
        setAccuracy(score);
        lastAccuracyUpdateRef.current = now;
      }

      if (detected !== lastGestureRef.current) {
        lastGestureRef.current = detected;
        setCurrentGesture(detected);
      }
    } else {
      if (lastGestureRef.current !== 'None') {
        lastGestureRef.current = 'None';
        setCurrentGesture('None');
        setAccuracy(0);
      }
      // Draw loop clear happens at top, but ensure effects don't stick if hand lost
      hasFireballRef.current = false; // Reset fireball if hand lost? Maybe optional.
    }
  }, []);

  const { isInitializing, updateConfig, currentConfig } = useHandTracking(videoRef, onFrame, true);

  const handlers = {
    'Open_Palm': () => { },
    'Fist': () => { },
    'Thumbs_Up': () => { },
    'Peace': () => { },
    'Pinch': () => { },
    'Pointing': () => { },
    'Snap': () => { },
  };

  useGestureHandler(currentGesture, handlers);

  // Repo path handling for assets
  const isProd = process.env.NODE_ENV === 'production';
  const flashImg = isProd
    ? '/valorant-hand-gesture/assets/phoenix flash.jpeg'
    : '/assets/phoenix flash.jpeg';

  return (
    <main className="relative w-full h-screen bg-neutral-950 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-neutral-900 to-purple-900/20"></div>

      {/* FLASH EFFECT OVERLAY */}
      <div
        className={`absolute inset-0 pointer-events-none z-[100] overflow-hidden ${flashActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          transition: flashActive ? 'none' : 'opacity 2000ms ease-out'
        }}
      >
        {/* Background Layer to ensure screen is covered if image doesn't match aspect ratio perfectly */}
        <div className="absolute inset-0 bg-orange-100/50 mix-blend-overlay"></div>

        {/* Positioned Flash Image */}
        {flashPosition && (
          <div
            className="absolute w-[200vmax] h-[200vmax]"
            style={{
              left: `${flashPosition.x * 100}%`,
              top: `${flashPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,150,0,0) 70%), url('${flashImg}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Optional: Actual IMG tag if we want more control, but background is easier for "covering" */}
            <img
              src={flashImg}
              className="w-full h-full object-cover opacity-90 mix-blend-screen"
              alt=""
              style={{
                maskImage: 'radial-gradient(circle, black 30%, transparent 80%)'
              }}
            />
          </div>
        )}
      </div>

      <div className="relative aspect-video w-full max-w-6xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-black">
        {permission !== 'granted' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Camera Access Required</h2>
              <p className="text-gray-400">Please allow access to your camera to use hand controls.</p>
            </div>
          </div>
        )}

        {isInitializing && permission === 'granted' && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 font-medium">Initializing Vision Models...</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
          autoPlay
        />

        <canvas
          ref={canvasRef}
          width={videoRef.current?.clientWidth || 1280}
          height={videoRef.current?.clientHeight || 720}
          className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
        />
      </div>

      <ControlPanel
        isDebug={isDebug}
        toggleDebug={() => setIsDebug(!isDebug)}
        currentGesture={currentGesture}
        fps={fps}
        accuracy={accuracy}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <AgentSelector
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={currentConfig}
        onUpdate={updateConfig}
        enabledGestures={enabledGestures}
        onToggleGesture={(g) => setEnabledGestures(prev => ({ ...prev, [g]: !prev[g] }))}
      />
    </main>
  );
}
