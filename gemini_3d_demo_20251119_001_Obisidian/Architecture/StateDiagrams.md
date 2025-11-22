# State Diagrams

主要な状態遷移をMermaidで示します。

## Player Combat State
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Attacking : attack input
    Attacking --> Idle : timer >= 0.4s
```

## Save/Load Menu Visibility
```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> Visible : press M
    Visible --> Hidden : press M
    Visible --> Hidden : perform Save/Load/Delete (UI stays open after action, but user can close with M)
```

## Build Mode
```mermaid
stateDiagram-v2
    [*] --> BuildOff
    BuildOff --> BuildOn : press B (debounced 0.5s)
    BuildOn --> BuildOff : press B (debounced 0.5s)
```

## Slime (簡易挙動)
```mermaid
stateDiagram-v2
    [*] --> Roam
    Roam --> Chase : player within aggro range
    Chase --> Roam : player out of range
    Chase --> Dead : takeDamage()
    Roam --> Dead : takeDamage()
```

必要に応じて状態やガード条件を追加してください。`PlayerPhysics` など物理系は連続値での更新が中心のため状態機械は簡略化しています。
