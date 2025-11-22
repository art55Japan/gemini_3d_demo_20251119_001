# Save & Load

- 実装: `SaveManager` が `localStorage` にJSON保存。接頭辞 `gemini_3d_save_` と `gemini_3d_quick_save` を使用。
- 対象: Playerの位置/回転は直接保存。`EntityManager` 内の `isSaveable()` がtrueなエンティティ（現状 Block/Slime）が `toSaveData()` で収集される。
- 復元: 読み込み時に既存の保存対象エンティティだけを除去し、`fromSaveData` で再生成。衝突リストにも再登録。
- クイック系: `quickSave()/quickLoad()` を K/L キーで呼び出し、UIなしで即保存/復元。
- スロット系: `save(slotId)/load(slotId)/delete(slotId)` を `SaveLoadUI` から操作。`getSlots()` で一覧取得（タイムスタンプ降順）。
- 通知: 成否は `Game.showNotification` で画面右上に表示。
- 注意: `localStorage` 依存のためブラウザ/デバイス間で共有されない。大規模データやファイルベースの保存は未実装。
