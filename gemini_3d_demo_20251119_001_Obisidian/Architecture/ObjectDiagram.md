# Object Diagram (Game Start)

ゲーム起動直後の主要オブジェクト構成を示します（Mermaid）。件数の多いものはまとめています。

```mermaid
graph TD
  Game["Game<br/>scene<br/>camera (0,1.6,3)<br/>renderer.xr=true<br/>collidables: Array"]
  Input["Input<br/>keyMap/VR<br/>activeKeys: empty"]
  EntityMgr["EntityManager<br/>entities[]"]
  BuildSys["BuildSystem<br/>buildMode=false<br/>ghostBlock: hidden"]
  WorldMgr["WorldManager"]
  CameraMgr["CameraManager"]
  AudioMgr["AudioManager"]
  SaveMgr["SaveManager<br/>slots in localStorage"]
  SaveUI["SaveLoadUI<br/>hidden"]
  Player["Player<br/>position (0,0,0)<br/>rotationY=0"]
  Phys["PlayerPhysics<br/>onGround=true"]
  Combat["PlayerCombat<br/>state=Idle"]
  Collision["PlayerCollision"]
  CastleBlocks["Block x ~200<br/>type=stone_dark"]
  Trees["Tree x20"]
  Rocks["Rock x15<br/>collidable=true"]
  Slimes["Slime x10"]

  Game --> Input
  Game --> EntityMgr
  Game --> BuildSys
  Game --> WorldMgr
  Game --> CameraMgr
  Game --> AudioMgr
  Game --> SaveMgr
  Game --> SaveUI
  EntityMgr --> Player
  Player --> Phys
  Player --> Combat
  Player --> Collision
  EntityMgr --> CastleBlocks
  EntityMgr --> Trees
  EntityMgr --> Rocks
  EntityMgr --> Slimes
  BuildSys --> Player
  BuildSys --> CastleBlocks
  BuildSys --> Rocks
  BuildSys --> Trees
  BuildSys --> Slimes
  Game -->|collidables| CastleBlocks
  Game -->|collidables| Rocks
```

補足:
- `collidables` には城ブロックとRockが初期登録（Tree/Slimeは非衝突）。
- ゴーストブロックはビルドモードOFFのため非表示。
- セーブUIは非表示、通知用のDOMオーバーレイは作成済み。
- `localStorage` に既存セーブがあればスロット取得可能だが、初回は空。
