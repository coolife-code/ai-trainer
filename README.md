# ai调教器

一个带有赛博终端风格的 AI 自我突破小游戏。  
系统每天生成任务，你可以和 AI 来回博弈、讨价还价、接受执行，最后记录你的完成与放弃轨迹。

## 项目介绍

`ai调教器` 的核心不是待办清单，而是“对抗拖延与抗拒”：

- AI 基于你的当前画像（等级、抗拒指数、历史评估）下发突破任务。
- 你可以在任务页输入反馈，AI 会根据你的态度调整任务描述和完成标准。
- 每次完成/放弃都会反向影响画像，进入下一轮任务生成。
- 所有状态保存在本地，形成“控制台 + 档案馆”的持续体验。

## 玩法说明

### 1) 控制台首页（Dashboard）

- 查看系统评估、等级、抗拒指数、当日任务数、已完成数。
- 点击任意任务进入“任务博弈页”。
- 支持 `WIPE_MEMORY` 清空本地记录并重启。

### 2) 任务博弈页（Task Negotiation）

- 左侧查看任务描述与完成标准，右侧与 AI 终端对话。
- 输入反馈（如“太难了”“我不会”“我没时间”）后，AI 会给出回应并可能调整任务。
- 最终你可以标记：
- `COMPLETED`：完成任务，等级上升。
- `ABORT`：放弃任务，抗拒指数上升。

### 3) 突破档案页（Archive）

- 查看累计完成/放弃统计。
- 回看最新画像评估与历史任务记录。
- 观察自己在不同阶段的行为变化。

## 状态规则（简版）

- 每日首次进入生成任务；同一天重复打开不会覆盖已有任务。
- `completed` 会提升等级并追加评语。
- `failed` 会提高抗拒指数并追加评语。
- 应用状态通过浏览器本地存储持久化。

## 本地开发

```bash
npm install
npm run dev
```

默认访问地址：`http://localhost:5173/`

## 打包与检查

```bash
npm run check
npm run build
npm run lint
```

## 技术栈

- React 18 + TypeScript
- Vite 6
- Zustand（含持久化）
- React Router
- Tailwind CSS
- Framer Motion

## 项目结构

```text
src/
  pages/            页面：控制台、博弈页、档案页
  store/            全局状态与业务动作（任务生成/反馈/结算）
  lib/              AI 接口与兜底逻辑
  components/       通用组件
```

## 仓库地址

`git@github.com:coolife-code/ai-.git`

## 上传到 GitHub

```bash
git remote add origin git@github.com:coolife-code/ai-.git
git branch -M main
git add .
git commit -m "docs: 完善 README 项目介绍与玩法"
git push -u origin main
```
