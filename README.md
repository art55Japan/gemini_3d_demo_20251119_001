# WebXR フェルトうさぎパラディン

![Felt Rabbit Paladin](3dimg/Gemini_Generated_Image_4rawrm4rawrm4raw.png)

Three.jsとViteで作られた、フェルト質感のうさぎパラディンが登場するWebXR対応の3Dゲームです。

![Language](https://img.shields.io/badge/language-JavaScript-yellow)
![Framework](https://img.shields.io/badge/framework-Three.js-blue)
![WebXR](https://img.shields.io/badge/WebXR-enabled-green)

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
- **A/←**: 左回転
- **D/→**: 右回転
- **スペースキー**: ジャンプ
- **Q/E**: カメラ回転
- **右クリック+ドラッグ**: カメラ回転
- **V**: 1人称/3人称視点切り替え

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

### プロジェクト構造
```
src/
├── main.js          # エントリーポイント
├── Game.js          # メインゲームロジック
├── Player.js        # プレイヤーキャラクター
├── PlayerMesh.js    # プレイヤーモデル
├── CameraManager.js # カメラ制御
├── Input.js         # 入力処理
├── EntityManager.js # エンティティ管理
├── config/          # パラメータ設定
│   ├── AnimationParameters.js
│   ├── CameraParameters.js
│   └── PlayerParameters.js
├── Tree.js          # 木オブジェクト
└── Rock.js          # 岩オブジェクト
```

### 主要機能の実装
- **プロシージャルテクスチャ**: Canvas APIによるフェルトテクスチャ生成
- **レイキャスティング**: プラットフォーム衝突判定
- **エンティティ管理**: 拡張性の高いモジュラーエンティティシステム
- **依存性注入**: パラメータを外部化し、保守性を向上

## 📝 開発

### 設計原則
このコードベースは以下の設計原則に基づいています：
- **依存性注入**: すべてのパラメータは外部から注入され、クラス内部にハードコードされた値は存在しません
- **単一責任**: 各クラスは明確な責任を持ちます
- **不変性**: パラメータクラスは`Object.freeze()`により不変です

### 新機能の追加
- 新しいエンティティは`Tree.js`や`Rock.js`に似たクラスを作成
- キャラクターの外観は`PlayerMesh.js`で変更
- パラメータ調整は`src/config/`内のファイルで実施

## 📄 ライセンス

このプロジェクトはオープンソースで、MITライセンスの下で利用可能です。

## 🙏 謝辞

- GoogleのGeminiを使用したAI支援により構築
- クラシックな3Dプラットフォーマーからインスピレーション
- 手作りクラフトにインスパイアされたフェルトテクスチャ美学

---

# WebXR Felt Rabbit Paladin

![Felt Rabbit Paladin](3dimg/Gemini_Generated_Image_4rawrm4rawrm4raw.png)

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
- **A/←**: Rotate left
- **D/→**: Rotate right
- **Spacebar**: Jump
- **Q/E**: Rotate camera
- **Right-click + Drag**: Rotate camera
- **V**: Toggle 1st/3rd person view

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
├── PlayerMesh.js    # Player model
├── CameraManager.js # Camera control
├── Input.js         # Input handling
├── EntityManager.js # Entity management
├── config/          # Parameter settings
│   ├── AnimationParameters.js
│   ├── CameraParameters.js
│   └── PlayerParameters.js
├── Tree.js          # Tree objects
└── Rock.js          # Rock objects
```

### Key Features Implementation
- **Procedural Textures**: Canvas API for felt texture generation
- **Raycasting**: Platform collision detection
- **Entity Management**: Modular entity system for extensibility
- **Dependency Injection**: Externalized parameters for better maintainability

## 📝 Development

### Design Principles
This codebase follows these design principles:
- **Dependency Injection**: All parameters are injected externally; no hardcoded values in classes
- **Single Responsibility**: Each class has a clear responsibility
- **Immutability**: Parameter classes are immutable via `Object.freeze()`

### Adding New Features
- Add new entities by creating classes similar to `Tree.js` or `Rock.js`
- Modify character appearance in `PlayerMesh.js`
- Adjust parameters in `src/config/` files

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with AI assistance using Google's Gemini
- Inspired by classic 3D platformers
- Felt texture aesthetic inspired by handmade crafts
