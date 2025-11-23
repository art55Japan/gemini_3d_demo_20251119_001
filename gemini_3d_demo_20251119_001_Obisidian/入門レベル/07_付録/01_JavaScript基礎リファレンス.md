---
tags:
  - 付録
  - JavaScript
  - リファレンス
  - 基礎
status: 完了
created: 2025-11-23
---

# JavaScript 基礎リファレンス

> [!abstract] 概要
> 本ドキュメントで使用する JavaScript の基本文法をまとめています。わからない構文があったときに参照してください。

---

## 変数宣言

### const と let

```javascript
// const: 再代入不可（基本的にこちらを使う）
const name = 'Rabbit';
// name = 'Dog';  // エラー！

// let: 再代入可能
let score = 0;
score = 100;  // OK
```

> [!tip] 使い分け
> - **const**: 値が変わらないもの（設定値、参照するオブジェクト）
> - **let**: 値が変わるもの（カウンター、状態フラグ）
> - **var**: 使わない（古い書き方）

---

## データ型

### プリミティブ型

| 型 | 例 | 説明 |
|----|-----|------|
| `number` | `42`, `3.14` | 数値 |
| `string` | `'hello'`, `"world"` | 文字列 |
| `boolean` | `true`, `false` | 真偽値 |
| `undefined` | `undefined` | 未定義 |
| `null` | `null` | 空値 |

### オブジェクト型

```javascript
// オブジェクト
const player = {
    name: 'Rabbit',
    hp: 100,
    position: { x: 0, y: 0, z: 0 }
};

// 配列
const enemies = ['slime', 'goblin', 'dragon'];

// 関数
const greet = function(name) {
    return `Hello, ${name}!`;
};
```

---

## 関数

### 関数宣言

```javascript
// 通常の関数
function add(a, b) {
    return a + b;
}

// アロー関数（簡潔な書き方）
const add = (a, b) => a + b;

// 複数行のアロー関数
const calculate = (a, b) => {
    const sum = a + b;
    return sum * 2;
};
```

### デフォルト引数

```javascript
function greet(name = 'Guest') {
    console.log(`Hello, ${name}!`);
}

greet();        // Hello, Guest!
greet('Rabbit'); // Hello, Rabbit!
```

---

## 配列操作

### 基本操作

```javascript
const items = ['sword', 'shield', 'potion'];

// 要素アクセス
items[0];           // 'sword'
items.length;       // 3

// 追加・削除
items.push('bow');  // 末尾に追加
items.pop();        // 末尾を削除
```

### 高階関数（重要！）

```javascript
const numbers = [1, 2, 3, 4, 5];

// forEach: 各要素に処理を実行
numbers.forEach(n => console.log(n));

// map: 各要素を変換して新配列を作成
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter: 条件に合う要素だけ抽出
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// find: 条件に合う最初の要素を取得
const found = numbers.find(n => n > 3);
// 4

// some: 条件に合う要素が1つでもあるか
const hasLarge = numbers.some(n => n > 4);
// true

// every: 全要素が条件を満たすか
const allPositive = numbers.every(n => n > 0);
// true
```

### メソッドチェーン

```javascript
const result = entities
    .filter(e => e.isActive)      // アクティブなものだけ
    .filter(e => e.hp > 0)        // HP があるものだけ
    .map(e => e.name);            // 名前だけ取り出す
```

---

## オブジェクト操作

### プロパティアクセス

```javascript
const player = { name: 'Rabbit', hp: 100 };

// ドット記法
player.name;       // 'Rabbit'

// ブラケット記法（動的なキーに使う）
const key = 'hp';
player[key];       // 100
```

### 分割代入

```javascript
const player = { name: 'Rabbit', hp: 100, mp: 50 };

// オブジェクトの分割代入
const { name, hp } = player;
console.log(name); // 'Rabbit'

// 配列の分割代入
const [first, second] = [1, 2, 3];
console.log(first); // 1
```

### スプレッド構文

```javascript
// 配列のコピー
const original = [1, 2, 3];
const copy = [...original];

// オブジェクトのコピーとマージ
const base = { x: 1, y: 2 };
const extended = { ...base, z: 3 };
// { x: 1, y: 2, z: 3 }
```

---

## クラス

### クラス定義

```javascript
class Entity {
    constructor(name) {
        this.name = name;
        this.hp = 100;
    }

    takeDamage(amount) {
        this.hp -= amount;
    }

    // ゲッター
    get isAlive() {
        return this.hp > 0;
    }
}

const enemy = new Entity('Slime');
enemy.takeDamage(30);
console.log(enemy.isAlive); // true
```

### 継承

```javascript
class Player extends Entity {
    constructor(name) {
        super(name);  // 親クラスの constructor を呼ぶ
        this.mp = 50;
    }

    // オーバーライド
    takeDamage(amount) {
        super.takeDamage(amount);  // 親のメソッドを呼ぶ
        console.log('Ouch!');
    }
}
```

### 静的メソッド

```javascript
class MathUtil {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// インスタンス化せずに呼び出せる
MathUtil.clamp(150, 0, 100); // 100
```

---

## 制御構文

### 条件分岐

```javascript
// if-else
if (hp <= 0) {
    console.log('Game Over');
} else if (hp < 30) {
    console.log('Danger!');
} else {
    console.log('OK');
}

// 三項演算子
const status = hp > 0 ? 'alive' : 'dead';

// 論理演算子によるショートサーキット
player && player.update();    // player が存在すれば update()
value || defaultValue;        // value が falsy なら defaultValue
value ?? defaultValue;        // value が null/undefined なら defaultValue
```

### ループ

```javascript
// for
for (let i = 0; i < 10; i++) {
    console.log(i);
}

// for...of（配列の要素をループ）
for (const item of items) {
    console.log(item);
}

// for...in（オブジェクトのキーをループ）
for (const key in player) {
    console.log(key, player[key]);
}

// while
while (condition) {
    // 処理
}
```

---

## ES Modules

### export

```javascript
// 名前付きエクスポート
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Player { }

// デフォルトエクスポート
export default class Game { }
```

### import

```javascript
// 名前付きインポート
import { PI, add, Player } from './math.js';

// デフォルトインポート
import Game from './Game.js';

// 別名インポート
import { Player as P } from './Player.js';

// 全てインポート
import * as Utils from './utils.js';
```

---

## 非同期処理

### Promise

```javascript
// Promise を返す関数
function loadData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('data loaded');
        }, 1000);
    });
}

// then/catch で処理
loadData()
    .then(data => console.log(data))
    .catch(error => console.error(error));
```

### async/await

```javascript
async function init() {
    try {
        const data = await loadData();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
```

---

## よく使う Math メソッド

| メソッド | 説明 | 例 |
|---------|------|-----|
| `Math.abs(x)` | 絶対値 | `Math.abs(-5)` → `5` |
| `Math.floor(x)` | 切り捨て | `Math.floor(3.7)` → `3` |
| `Math.ceil(x)` | 切り上げ | `Math.ceil(3.2)` → `4` |
| `Math.round(x)` | 四捨五入 | `Math.round(3.5)` → `4` |
| `Math.min(a,b,...)` | 最小値 | `Math.min(1,2,3)` → `1` |
| `Math.max(a,b,...)` | 最大値 | `Math.max(1,2,3)` → `3` |
| `Math.random()` | 0〜1 の乱数 | `Math.random()` → `0.123...` |
| `Math.sin(x)` | サイン | `Math.sin(Math.PI/2)` → `1` |
| `Math.cos(x)` | コサイン | `Math.cos(0)` → `1` |
| `Math.sqrt(x)` | 平方根 | `Math.sqrt(16)` → `4` |
| `Math.PI` | 円周率 | `3.141592...` |

---

## console メソッド

```javascript
console.log('通常のログ');
console.warn('警告');
console.error('エラー');
console.table([{a:1}, {a:2}]);  // テーブル表示
console.time('label');
// 処理
console.timeEnd('label');       // 経過時間を表示
```

---

## 関連リンク

- [[02_Three.js概念図解|次: Three.js概念図解]]
- [[_MOC_付録|付録に戻る]]
- [MDN Web Docs](https://developer.mozilla.org/ja/docs/Web/JavaScript)
