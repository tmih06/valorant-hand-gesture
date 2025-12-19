# Valorant Hand Gesture

A high-performance hand gesture recognition web application featuring **Valorant Agent Skills**.  
Built with **Next.js**, **TypeScript**, and **MediaPipe**.

## 🎮 Features

*   **Real-time Hand Tracking**: Uses Google's MediaPipe for robust landmark detection.
*   **Dual Tracking Modes**:
    *   **Geometric**: Fast, custom algorithms for efficiency.
    *   **Google AI**: High-accuracy machine learning gesture classifier.
*   **Agent Skills System**:
    *   **Phoenix**:
        *   🔥 **Fireball**: Snap your fingers (Thumb + Middle) to spawn a fireball that tracks your hand.
        *   ✨ **Flash**: Open your palm while holding a fireball to trigger a realistic, blinding flash effect.
*   **Optimized Performance**: Custom rendering loop running outside React state for 60fps+ smoothness.
*   **Debug Mode**: Visualize hand skeleton and geometric distances in real-time.

## 🚀 How to Run

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/tmih06/valorant-hand-gesture.git
    cd valorant-hand-gesture
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:3000`.

## 🛠️ Tech Stack

*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Vision AI**: MediaPipe Tasks Vision (WASM)
*   **Styling**: Tailwind CSS
*   **Deployment**: GitHub Pages (Static Export)

## 📦 Deployment

This project automates deployment to **GitHub Pages** using GitHub Actions.
Any push to the `main` branch triggers the workflow defined in `.github/workflows/deploy.yml`.

---
*Created by [tmih06](https://github.com/tmih06)*
