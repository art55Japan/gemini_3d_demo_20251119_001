# Physics

- プレイヤー専用物理は `PlayerPhysics` が担当。速度ベクトルを保持し、移動/重力/ノックバック/ジャンプを逐次更新。
- 移動: プレイヤー向きに応じて前後左右ベクトルを計算し、速度を決定。移動量はdeltaと速度を掛けて適用。
- 衝突: AABBで `collidables` （Block, Rockなど）と判定。X→Z→Yの順に解決し、貫通をMath.min/Math.maxで補正。
- 着地: Y軸衝突時に接地判定し、`onGround` を更新。床は地面(高さ0)でクランプ。
- ジャンプ: `onGround && input.jump` で発火、即座に上向き速度をセットし、効果音を再生。
- ノックバック: `applyKnockback(direction,strength)` で水平速度を加算し、上向きに持ち上げる。`PlayerCollision` が被弾時に呼び出す。
- 戦闘: `PlayerCombat` はステートマシンで攻撃アニメーションを制御し、前方2m以内の敵にダメージ判定。
