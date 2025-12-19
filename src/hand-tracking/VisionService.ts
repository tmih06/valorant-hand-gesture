import { HandLandmarker, GestureRecognizer, FilesetResolver, GestureRecognizerResult, HandLandmarkerResult } from "@mediapipe/tasks-vision";

export type ModelMode = "Landmarker" | "GestureRecognizer";

export interface VisionConfig {
    mode: ModelMode;
    delegate: "GPU" | "CPU";
    minHandDetectionConfidence: number;
    minHandPresenceConfidence: number;
    minTrackingConfidence: number;
}

export const DEFAULT_CONFIG: VisionConfig = {
    mode: "Landmarker", // Default to lightweight
    delegate: "GPU",
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
};

export class VisionService {
    private static instance: VisionService;
    private landmarker: HandLandmarker | null = null;
    private recognizer: GestureRecognizer | null = null;
    private vision: any = null;
    private currentMode: ModelMode = "Landmarker";

    private constructor() { }

    public static getInstance(): VisionService {
        if (!VisionService.instance) {
            VisionService.instance = new VisionService();
        }
        return VisionService.instance;
    }

    public async initialize(config: VisionConfig = DEFAULT_CONFIG): Promise<void> {
        if (this.landmarker || this.recognizer) return; // Already init

        await this.ensureVision();
        await this.createTask(config);
    }

    public async reconfigure(config: VisionConfig): Promise<void> {
        // Close existing
        if (this.landmarker) { this.landmarker.close(); this.landmarker = null; }
        if (this.recognizer) { this.recognizer.close(); this.recognizer = null; }

        await this.ensureVision();
        await this.createTask(config);
    }

    private async ensureVision() {
        if (!this.vision) {
            this.vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
        }
    }

    private async createTask(config: VisionConfig) {
        this.currentMode = config.mode;

        const commonOptions = {
            baseOptions: {
                delegate: config.delegate,
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: config.minHandDetectionConfidence,
            minHandPresenceConfidence: config.minHandPresenceConfidence,
            minTrackingConfidence: config.minTrackingConfidence,
        } as any;

        if (config.mode === "GestureRecognizer") {
            commonOptions.baseOptions.modelAssetPath = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
            this.recognizer = await GestureRecognizer.createFromOptions(this.vision, commonOptions);
        } else {
            commonOptions.baseOptions.modelAssetPath = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
            this.landmarker = await HandLandmarker.createFromOptions(this.vision, commonOptions);
        }
    }

    public detect(video: HTMLVideoElement, startTimeMs: number): { result: HandLandmarkerResult | GestureRecognizerResult | null, mode: ModelMode } {
        if (this.currentMode === "GestureRecognizer" && this.recognizer) {
            return { result: this.recognizer.recognizeForVideo(video, startTimeMs), mode: "GestureRecognizer" };
        } else if (this.currentMode === "Landmarker" && this.landmarker) {
            return { result: this.landmarker.detectForVideo(video, startTimeMs), mode: "Landmarker" };
        }
        return { result: null, mode: "Landmarker" };
    }
}
