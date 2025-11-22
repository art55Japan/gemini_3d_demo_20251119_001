# Rendering

- Three.js + Vite。`Game` で Scene/Camera/Renderer を作成し、`renderer.xr.enabled` でWebXRを有効化、`VRButton` をDOMに追加。
- カメラ: `PerspectiveCamera(75°, 0.1-1000)`、初期位置は(0,1.6,3)でVR高さを想定。`CameraManager` がプレイヤー追従/視点調整を担当。
- ライティング: `AmbientLight`(0x404040,2) と `DirectionalLight`(強度2, 影有効)。
- 地面: 100x100のPlaneをXZに配置（回転x=-90°）。
- レンダリングループ: `renderer.setAnimationLoop(Game.render)` で毎フレーム呼び出し。
- UI: 通知とセーブUIはDOMでオーバーレイ。UI表示中もレンダリングは継続。
- VR: VRセッション中も同じ更新ループを使用。入力は `Input.handleVRInput` でGamepadから取得し、キーボードと統合。
