import React from 'react';
import { GestureType } from '@/gesture-detection/GestureDetector';

interface ControlPanelProps {
    isDebug: boolean;
    toggleDebug: () => void;
    currentGesture: GestureType;
    fps: number;
    accuracy?: number;
    onOpenSettings?: () => void;
}

export const ControlPanel = ({ isDebug, toggleDebug, currentGesture, fps, accuracy = 0, onOpenSettings }: ControlPanelProps) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white flex items-center gap-6 shadow-xl">
            <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Gesture</span>
                <span className="text-xl font-bold text-cyan-400 min-w-[100px] leading-none mb-2">{currentGesture}</span>

                {/* Accuracy Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                        style={{ width: `${accuracy * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/40">Confidence</span>
                    <span className="text-[10px] text-cyan-400/80">{Math.round(accuracy * 100)}%</span>
                </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDebug}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDebug
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                >
                    Debug View
                </button>

                <button
                    onClick={onOpenSettings}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Settings
                </button>

                <div className="text-xs font-mono text-white/50">
                    <span className={fps < 25 ? 'text-red-400' : 'text-green-400'}>{fps}</span> FPS
                </div>
            </div>
        </div>
    );
};
