# Roleta Master (Wheel of Fortune) 🎡

A modern, highly customizable, and robust Wheel of Fortune application built with React, TypeScript, and Zustand. 
This application provides advanced fair-play mechanisms, sound effects, animations, and detailed configuration options, making it ideal for giveaways, raffles, team selections, and more.

## 🚀 Features

### Advanced Balancing & Fair Play ⚖️
- **Acumulação por tempo (Pity System):** Automatically increases the winning weight of participants who haven't been drawn in consecutive rounds.
- **Divisão por vitórias (Balanceamento):** Dynamically reduces the probability of participants winning repeatedly by dividing their weight based on their number of previous wins.
- **Anti-Repetition Engine:** Prevents the same item from being drawn back-to-back within a configurable number of rounds.
- **Visual Weight Indicator:** Option to visually display how the dynamic weights (pity system and win balance) affect the wheel slices in real-time.

### Multiple Wheel Modes 🎡
- **Classic Wheel:** The traditional spinning wheel layout.
- **Horizon Mode:** A horizontal scrolling selector, similar to casino slot machines or game loot boxes.
- **Mystery Box Mode:** A suspenseful display that reveals the winner after an animation.

### Gameplay Modes 🎮
- **Standard Mode:** Classic random drawing.
- **Elimination Mode (Mata-mata):** Automatically eliminates winners or specific participants round by round until a single Grand Winner remains. Features auto-continue options and dramatic sound effects.
- **Auto-Remove Winner:** Automatically removes drawn items from the wheel for subsequent rounds.

### Immersive Audio & Visuals ✨
- Custom sound effects for spinning ticks and winning announcements.
- Add your own custom audios (supports importing custom files).
- Confetti explosion animations upon winning.
- Highly customizable UI themes, fonts, and colors.
- Fine-grained controls over spin duration and animation easing.

### Data Management 💾
- **Local Storage Persistence:** All settings, participants, and historical results are automatically saved in the browser's IndexedDB / LocalStorage.
- Complete results history with timestamps.

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand
- **Animations:** Motion (Framer Motion)
- **Local Database:** `idb-keyval` (IndexedDB for robust storage)
- **Icons:** Lucide React
- **Build Tool:** Vite

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed.
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The output will be generated in the `dist` folder.

## ⚙️ Architecture Highlights

### `useWheelData` Hook
Calculates the dynamic weights, angle boundaries, and SVG paths for the wheel slices. It considers base weights, the pity system (accumulation), and the win reduction logic to compute the final display and probability mechanics.

### `useWheelActions` Hook
Manages the core spin mechanics, random number generation using the Cryptography API (`crypto.getRandomValues`) for fair unpredictability, and applies the logic for elimination modes and anti-repetition.

### `useAppStore` (Zustand)
A centralized store that manages:
- Application configurations and visual themes.
- Participant lists (Items).
- Results history.
- Sound configurations and volume levels.
- Advanced wheel metrics (rotation, timeouts).

## 🤝 Contributing

Contributions are welcome! Feel free to open issues, submit pull requests, or suggest new features to improve the app's fair play mechanics or visual flair.

## 📝 License

This project is open-source and available under the MIT License.
