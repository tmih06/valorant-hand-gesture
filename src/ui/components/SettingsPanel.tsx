import React, { useState } from 'react';
import { VisionConfig } from '@/hand-tracking/VisionService';
import { GestureType } from '@/gesture-detection/GestureDetector';

interface SettingsPanelProps {
    config: VisionConfig;
    onUpdate: (config: Partial<VisionConfig>) => void;
    isOpen: boolean;
    onClose: () => void;
    enabledGestures: Record<GestureType, boolean>;
    onToggleGesture: (gesture: GestureType) => void;
}

export const SettingsPanel = ({ config, onUpdate, isOpen, onClose, enabledGestures, onToggleGesture }: SettingsPanelProps) => {
    if (!isOpen) return null;

    const gestureList: GestureType[] = ['Open_Palm', 'Fist', 'Thumbs_Up', 'Peace', 'Pinch', 'Pointing', 'Snap'];

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Detection Settings</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">&times;</button>
                </div>

                <div className="space-y-6">
                    {/* Gesture Toggles */}
                    <div>
                        <label className="block text-xs uppercase text-white/50 mb-2">Enabled Gestures</label>
                        <div className="grid grid-cols-2 gap-2">
                            {gestureList.map((gesture) => (
                                <button
                                    key={gesture}
                                    onClick={() => onToggleGesture(gesture)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${enabledGestures[gesture]
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                            : 'bg-white/5 text-white/50 border border-transparent'
                                        }`}
                                >
                                    <span>{gesture.replace('_', ' ')}</span>
                                    {enabledGestures[gesture] && <span className="text-xs">●</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Model Mode Selection */}
                    <div>
                        <label className="block text-xs uppercase text-white/50 mb-2">Detection Model</label>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => onUpdate({ mode: 'Landmarker' })}
                                className={`w-full py-3 px-4 rounded-lg text-sm text-left font-medium transition-all ${config.mode === 'Landmarker'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-bold">Fast (Geometry)</div>
                                <div className="text-xs opacity-70">Benchmarks hand points, manual logic. Fast.</div>
                            </button>

                            <button
                                onClick={() => onUpdate({ mode: 'GestureRecognizer' })}
                                className={`w-full py-3 px-4 rounded-lg text-sm text-left font-medium transition-all ${config.mode === 'GestureRecognizer'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-bold">Accurate (Google AI)</div>
                                <div className="text-xs opacity-70">Uses ML Gesture Classifier. Slower but more robust.</div>
                            </button>
                        </div>
                    </div>

                    {/* Delegate Selection */}
                    <div>
                        <label className="block text-xs uppercase text-white/50 mb-2">Processor (Delegate)</label>
                        <div className="flex gap-2">
                            {['GPU', 'CPU'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onUpdate({ delegate: type as 'GPU' | 'CPU' })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${config.delegate === type
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Threshold Sliders */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs uppercase text-white/50">Tracking Confidence</label>
                            <span className="text-xs text-cyan-400">{config.minTrackingConfidence.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={config.minTrackingConfidence}
                            onChange={(e) => onUpdate({ minTrackingConfidence: parseFloat(e.target.value) })}
                            className="w-full accent-cyan-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all"
                >
                    Done
                </button>
            </div>
        </div>
    );
};
