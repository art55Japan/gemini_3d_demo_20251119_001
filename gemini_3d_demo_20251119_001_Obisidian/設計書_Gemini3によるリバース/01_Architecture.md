# アーキテクチャ概要

## 技術スタック
- **言語**: JavaScript (ES Modules)
- **レンダリング**: Three.js
- **XR**: WebXR (VRButton)
- **ビルドツール**: Vite
- **テスト**: Vitest

## ディレクトリ構造
```
src/
├── main.js          # エントリーポイント
├── Game.js          # ゲームループ管理、各マネージャーの初期化
├── Entity.js        # エンティティ基底クラス
├── EntityManager.js # エンティティ管理
├── Player.js        # プレイヤー管理
├── PlayerPhysics.js # プレイヤー物理演算
├── PlayerCombat.js  # プレイヤー戦闘ロジック
├── PlayerCollision.js # プレイヤー衝突判定
├── PlayerMesh.js    # プレイヤー描画
├── Input.js         # 入力管理
├── CameraManager.js # カメラ管理
├── WorldManager.js  # ワールド生成・管理
├── BuildSystem.js   # 建築システム
├── SaveManager.js   # セーブ・ロード管理
├── SaveLoadUI.js    # セーブ・ロードUI
├── AudioManager.js  # オーディオ管理
├── Block.js         # ブロックエンティティ
├── Slime.js         # スライムエンティティ
├── Tree.js          # 木エンティティ
├── Rock.js          # 岩エンティティ
└── __tests__/       # 単体テスト
```

## コアクラス設計

### Game
ゲームのメインクラス。以下の責務を持つ：
- Three.js シーン、カメラ、レンダラーの初期化
- 各マネージャーのインスタンス化
- メインループ (Animation Loop) の実行

### Entity
すべてのゲームオブジェクトの基底クラス。
- `position`: 座標管理
- `update()`: 毎フレームの更新処理
- `handleCollision()`: 衝突時の処理
- `isSaveable()` / `toSaveData()`: セーブデータ関連

### EntityManager
シーン内の全エンティティをリスト管理し、一括更新・描画・削除を行う。

## ゲームループ
`Game.js` 内の `renderer.setAnimationLoop` によって駆動される。
1. `delta` 時間の計算
2. `EntityManager.update()`: 全エンティティの更新
3. `BuildSystem.update()`: 建築システムの更新
4. `WorldManager.update()`: ワールド管理の更新
5. `SaveManager.update()`: セーブ管理の更新
6. `renderer.render()`: 描画
