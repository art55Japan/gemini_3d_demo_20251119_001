# Overview

ゲームの骨格とループ構造を俯瞰します。

## 全体像
- 描画・入力・状態管理は `Game` が統括し、Three.jsの `WebGLRenderer` を `renderer.setAnimationLoop` で回す。
- ループ順序: Input取得 → BuildSystem（ブロック操作）→ EntityManager（Player/Slime/Block更新）→ CameraManager → Render。
- `EntityManager` に全エンティティを登録し、`update` と寿命管理を一本化。保存対象の判定も各エンティティのポリモーフィズムで行う。
- VR対応: `renderer.xr.enabled` + `VRButton`。入力は `Input.handleVRInput` がGamepadを読み取り、同じInput Stateに統合。

## 初期化フロー（Gameコンストラクタ）
1. Scene/Camera/Renderer/ライト/地面をセットアップ。
2. `Input` 作成 → キー/マウス/VR入力を監視。
3. `EntityManager` を作成し、`Player` を登録。
4. `WorldManager.populate` で Tree/Rock/Slime を配置し、Rockのみ衝突コライダへ追加。
5. `BuildSystem` を作成し Player を渡す（Raycastでブロック設置/破壊）。
6. `CameraManager` で追従カメラを設定、`SaveManager` + `SaveLoadUI` でセーブUIを用意。
7. 初期城塞を `createInitialCastle` で生成（Block群をEntityManagerと衝突リストへ登録）。

## データフローのポイント
- 位置・回転は各オブジェクトのThree.js MeshとVector3で保持し、`PlayerPhysics` が移動/重力/衝突を計算。
- セーブデータは `SaveManager` が収集し、`Block`/`Slime` のみ `isSaveable` で対象化。`localStorage` にJSON保存。
- 入力は `Input.getState()` が正規化し、全システムが同じStateを使う。建築/メニュー/セーブ/ロードキーもここに集約。
