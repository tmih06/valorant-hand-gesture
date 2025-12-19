import React from 'react';
import { Agent, AGENTS } from '@/agents/AgentDefinitions';

interface AgentSelectorProps {
    selectedAgent: Agent | null;
    onSelectAgent: (agent: Agent | null) => void;
}

export const AgentSelector = ({ selectedAgent, onSelectAgent }: AgentSelectorProps) => {
    return (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
            {AGENTS.map((agent) => (
                <button
                    key={agent.id}
                    onClick={() => onSelectAgent(selectedAgent?.id === agent.id ? null : agent)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 group ${selectedAgent?.id === agent.id
                            ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,153,0,0.6)]'
                            : 'border-white/20 hover:border-white/50 hover:scale-105 bg-black/40'
                        }`}
                >
                    <img
                        src={agent.imageUrl}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/90 text-white p-3 rounded-lg border border-white/10 w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <h3 className="font-bold text-lg mb-1" style={{ color: agent.themeColor }}>{agent.name}</h3>
                        <p className="text-xs text-gray-300">{agent.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
