import { GestureType } from '@/gesture-detection/GestureDetector';

export interface Agent {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    themeColor: string;
}

export const AGENTS: Agent[] = [
    {
        id: 'phoenix',
        name: 'Phoenix',
        imageUrl: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png', // Official API URL usually works better or placeholder
        description: 'Duelist. Fire abilities. Snap to spawn fireball, Open Palm to Flash.',
        themeColor: '#ff9900'
    }
];

export interface SkillState {
    agentId: string | null;
    hasFireball: boolean;
    flashActive: boolean;
}
