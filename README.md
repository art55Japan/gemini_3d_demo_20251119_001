# WebXR Felt Rabbit Paladin

A WebXR-enabled 3D game featuring a felt-textured rabbit paladin character. Built with Three.js and Vite.

![Language](https://img.shields.io/badge/language-JavaScript-yellow)
![Framework](https://img.shields.io/badge/framework-Three.js-blue)
![WebXR](https://img.shields.io/badge/WebXR-enabled-green)

## 🎮 Features

- **High-Fidelity 3D Character**: Detailed rabbit paladin with procedural felt textures
- **Interactive Environment**: Trees and rocks with felt aesthetics
- **Physics System**: Jump mechanics with gravity and platform collision
- **WebXR Support**: Play in VR with compatible headsets
- **Responsive Controls**: 
  - Desktop: WASD/Arrow keys to move, Spacebar to jump
  - VR: Thumbstick to move, Trigger/Button to jump

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/art55Japan/gemini_3d_demo_20251119_001.git
cd gemini_3d_demo_20251119_001
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 How to Play

### Desktop Controls
- **W/↑**: Move forward
- **S/↓**: Move backward
- **A/←**: Move left
- **D/→**: Move right
- **Spacebar**: Jump

### VR Controls
- **Left Thumbstick**: Move
- **Trigger/A Button**: Jump

### Gameplay
- Explore the felt-textured world
- Jump on rocks and platforms
- Experience the unique "felt doll" aesthetic

## 🛠️ Technical Details

### Built With
- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [WebXR API](https://www.w3.org/TR/webxr/) - VR/AR support

### Project Structure
```
src/
├── main.js          # Entry point
├── Game.js          # Main game logic
├── Player.js        # Player character
├── Input.js         # Input handling
├── EntityManager.js # Entity management
├── Tree.js          # Tree objects
└── Rock.js          # Rock objects
```

### Key Features Implementation
- **Procedural Textures**: Canvas API for felt texture generation
- **Raycasting**: Platform collision detection
- **Entity Management**: Modular entity system for extensibility

## 📝 Development

### Adding New Features
The codebase is designed for easy extension:
- Add new entities by creating classes similar to `Tree.js` or `Rock.js`
- Modify character appearance in `Player.js`
- Adjust physics parameters in `Player.js` constructor

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with AI assistance using Google's Gemini
- Inspired by classic 3D platformers
- Felt texture aesthetic inspired by handmade crafts

---

# WebXR フェルトうさぎパラディン

Three.jsとViteで作られた、フェルト質感のうさぎパラディンが登場するWebXR対応の3Dゲームです。

## 🎮 機能

- **高品質3Dキャラクター**: プロシージャルなフェルトテクスチャを使った詳細なうさぎパラディン
- **インタラクティブな環境**: フェルト美学の木と岩
- **物理システム**: 重力とプラットフォーム衝突判定を備えたジャンプ機能
- **WebXR対応**: 対応ヘッドセットでVRプレイ可能
- **レスポンシブな操作**: 
  - デスクトップ: WASD/矢印キーで移動、スペースキーでジャンプ
  - VR: サムスティックで移動、トリガー/ボタンでジャンプ

## 🚀 はじめ方

### 必要環境

- Node.js (v14以上)
- npmまたはyarn

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/art55Japan/gemini_3d_demo_20251119_001.git
cd gemini_3d_demo_20251119_001
```

2. 依存関係をインストール:
```bash
npm install
```

3. 開発サーバーを起動:
```bash
npm run dev
```

4. ブラウザで `http://localhost:5173` を開く

### 本番ビルド

```bash
npm run build
```

ビルドファイルは`dist`ディレクトリに生成されます。

## 🎯 遊び方

### デスクトップ操作
- **W/↑**: 前進
- **S/↓**: 後退
- **A/←**: 左移動
- **D/→**: 右移動
- **スペースキー**: ジャンプ

### VR操作
- **左サムスティック**: 移動
- **トリガー/Aボタン**: ジャンプ

### ゲームプレイ
- フェルト質感の世界を探索
- 岩やプラットフォームの上にジャンプ
- ユニークな「フェルト人形」の美学を体験

## 🛠️ 技術詳細

### 使用技術
- [Three.js](https://threejs.org/) - 3Dグラフィックスライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール・開発サーバー
- [WebXR API](https://www.w3.org/TR/webxr/) - VR/ARサポート

### 主要機能の実装
- **プロシージャルテクスチャ**: Canvas APIによるフェルトテクスチャ生成
- **レイキャスティング**: プラットフォーム衝突判定
- **エンティティ管理**: 拡張性の高いモジュラーエンティティシステム
