# 具身回响 (Embodied Echo) · 系统架构与多模型开发维护指南
> **Embodied Echo — System Architecture & Multi-AI Handover Specification**  
> *本文档专为在不同 AI 编程助手（如 Claude 3.5/Opus、GPT-4o/o1、Cursor、Windsurf、v0、DeepSeek 等）之间交接、理解、迭代与二次开发本项目而编写。将本文件提供给任何 AI，均可使其在零损耗的前提下迅速理解项目全貌并精准实施修改。*

---

## 1. 项目定位与哲学背景 (Core Philosophy)

* **产品名称**：具身回响（Embodied Echo）
* **核心理念**：**反抗算法的即时催眠，恢复人本身对真实的感知**。在算力与生成式 AI 泛滥的时代，逻辑与总结可以被瞬间生成，但身体的微颤、窗边的冷暖、呼吸与叹息无法被算法压缩。
* **产品形态**：
  1. **双面明信片**：正面是生活日常视觉切片（拍立得/胶片感画幅）；背面是感官引导词（嗅觉、触觉、温度）与**真实未经AI润色的原声音频**。
  2. **30分钟慢显影（延迟看成片）**：用户拍摄记录后，切片进入30分钟倒计时暗房锁定状态，不可即刻消费与分享，强制用户抽离手机、回归肉身。
  3. **心潮声波可视化**：将用户的原声转化为跃动的金色声波动态线条，使心绪听觉具象化。
  4. **ReactBits 3D 环形胶卷展台**：受 React Bits 启发的立体 3D 圆柱/轨道/全景陈列展台，支持惯性拖拽、磁吸吸附与聚焦翻转。
  5. **朋友圈诗意画报生成器**：一键生成带有明信片缩略图、日期标签、品牌语录的高清分享海报与声音二维码。
  6. **Google Drive 云端同步**：通过 Firebase Auth Google 授权与 Google Drive REST API 实现去中心化、安全的云端全量数据备份与一键恢复。

---

## 2. 技术栈清单 (Tech Stack & Environment)

* **核心框架**：React 19 (`react` + `react-dom`)
* **构建工具**：Vite 6 (`@vitejs/plugin-react`)
* **开发语言**：TypeScript 5.x
* **样式引擎**：Tailwind CSS v4（通过 `@import "tailwindcss";` 引入，遵循现代 Tailwind 规范）
* **图标库**：`lucide-react`
* **二维码生成**：`qrcode` + `@types/qrcode`（纯客户端生成 DataURL）
* **云端备份**：`firebase`（`firebase/app` + `firebase/auth` 配合 Google Workspace OAuth 客户端授权，直连 Google Drive REST API v3）
* **状态持久化**：客户端 `localStorage` 缓存 + Google Drive 云端 JSON 快照

---

## 3. 完整代码目录结构 (Repository Layout)

```text
├── index.html                   # HTML 根入口，预设中英文元数据及宋体/衬线字体链接
├── package.json                 # 依赖配置（含 React 19, Tailwind, Lucide, Firebase, QRCode）
├── vite.config.ts               # Vite 基础打包配置
├── metadata.json                # 项目元数据与平台权限配置
├── firebase-applet-config.json  # Firebase 客户端应用基础配置
├── EXHIBITION_KIT.md            # 【重要】线下策展物料手册、宣传片分镜、动线与展签文案
├── PROJECT_ARCHITECTURE.md      # 【本文档】系统架构与跨 AI 开发指引
│
└── src/
    ├── main.tsx                 # React 应用挂载入口
    ├── index.css                # 全局样式，包含 Tailwind、平滑滚动、毛玻璃与自定义字体
    ├── App.tsx                  # 顶层主视图控制器，统管导航、当前切片选择与模态弹窗
    │
    ├── types/
    │   └── index.ts             # 全局数据模型规范（明信片、音频、延迟锁定、商品、备份）
    │
    ├── data/
    │   └── seedData.ts          # 初始种子明信片数据与诗意文案预置库
    │
    ├── utils/
    │   └── qrHelper.ts          # 二维码生成工具（将 postcard ID 编译为扫码试听地址）
    │
    ├── services/
    │   ├── googleAuth.ts        # Google 登录认证与 Access Token 内存缓存安全管理
    │   └── googleDriveService.ts# Google Drive 文件夹检索、全量数据备份/还原 REST API
    │
    ├── assets/
    │   └── images/              # 高清生成的本地图片资产（如自然手部肖像、胶片质感样张）
    │
    └── components/              # 核心功能组件库
        ├── TopNav.tsx           # 严格三区顶栏（Logo/品牌 - 导航 - 操作按钮区）
        ├── CircularCarousel.tsx # 【ReactBits 风格】3D 环形胶卷展台（圆柱/轨道/全景）
        ├── HeroOrbitView.tsx    # 经典 3D 轨道展示视图（中心肖像 + 环绕悬浮卡片）
        ├── PostcardView.tsx     # 核心明信片视图（正反翻转、声波播放、慢显影锁定、感官词）
        ├── AudioWaveformVisualizer.tsx # 心潮原声音频动态波形可视化组件
        ├── CreatePostcardModal.tsx     # 晒今日切片（拍照、30秒录音、感官标签、倒计时起算）
        ├── ListenRoomModal.tsx         # 声音暗房/试听岛（倾听原声、发送共鸣留言）
        ├── VoiceReelView.tsx           # 原声共鸣带（黑胶唱盘切片列表流式连播）
        ├── YearRetrospective.tsx       # 肉身年鉴（全年情绪热力雷达与历史切片归档）
        ├── PhilosophyView.tsx          # 具身宣言（深度哲学阐述与感官复兴呼吁）
        ├── EmbodiedShopModal.tsx       # 心绪商店 & 朋友圈诗意画报 Canvas 导出器
        └── GoogleDriveModal.tsx        # Google Drive 备份/还原/同步交互弹窗
```

---

## 4. 核心数据模型规范 (`src/types/index.ts`)

在向其他 AI 发送更改需求时，应优先遵循已有的 TypeScript 接口定义：

```typescript
// 1. 核心明信片切片数据结构
export interface PostcardEntry {
  id: string;
  date: string;               // 格式: YYYY-MM-DD
  time: string;               // 格式: HH:mm
  dayOfWeek: string;          // 星期几，如 "WEDNESDAY"
  imageUrl: string;           // 正面视觉切片 URL / 本地资产路径
  quote: string;              // 简短观察/诗意切片词
  reflection: string;         // 具身反思（感官维度的详细手记）
  sensoryDimension: SensoryDimension; // 'tactile' | 'olfactory' | 'thermal' | 'ambient' | 'proprioceptive'
  sensoryPrompt: string;      // 感官引导词，如 "雨水打湿外套的气味"
  location: string;           // 具身坐标，如 "上海 · 绍兴路老书店"
  weather: string;            // 气象体感，如 "细雨 · 16°C 微凉"
  author: string;             // 记录者
  audioUrl?: string;          // 原声音频地址
  audioDuration?: number;     // 音频时长（秒）
  audioWaveform?: number[];   // 16~32点离散振幅数据，用于动态声波渲染
  qrCodeDataUrl?: string;     // 二维码 DataURL（扫码直达此切片倾听）
  resonanceCount: number;     // 心潮共鸣次数
  resonances?: ResonanceComment[]; // 他人的共鸣倾听手记
  delayRelease?: DelayRelease; // 30分钟慢显影计时状态
}

// 2. 30分钟慢显影控制机制
export interface DelayRelease {
  isLocked: boolean;          // 当前是否处于锁定显影中
  unlockAtTimestamp: number;  // 解锁目标毫秒级时间戳（创建时间 + 30分钟）
  blurLevel?: number;         // 视觉模糊半径（随时间流逝逐渐显影锐化）
}

// 3. 实体文创商品规范
export interface PhysicalProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  category: 'print' | 'album' | 'kit' | 'device';
  description: string;
  specs: string[];
  mockupUrl: string;
  badge?: string;
}
```

---

## 5. 核心功能与交互机制详解

### 5.1 ReactBits 3D 环形胶卷展台 (`CircularCarousel.tsx`)
* **数学与坐标映射**：基于立体空间环绕，计算每个卡片在当前转动弧度 `rotation` 下的 `angle = (i * step) + rotation`：
  * **Cylinder 模式**：通过 CSS `transform: rotateY(${angle}deg) translateZ(${radius}px)` 构建真实 3D 圆柱体环形展台。
  * **Orbit 模式**：加入轻微倾角，使卡片呈行星环绕式环抱中心的自然人物肖像。
  * **Panorama 模式**：以大弧度向内微凹的画廊环幕排布。
* **物理手感与交互**：
  * **无阻尼流畅拖拽**：鼠标/触屏按下移动时动态更新旋转角度；
  * **惯性减速与自动吸附**：松手后利用 `requestAnimationFrame` 执行摩擦系数（`0.92`）减速，并在低速时平滑磁吸至最近卡片正中央；
  * **点击聚焦**：点击环上的任意卡片，自动将其旋转至正中央，并同步更新全局选中卡片。

### 5.2 30分钟慢显影（延迟看成片机制）
* **逻辑触发**：当用户在 `CreatePostcardModal` 中按下「完成并沉入显影」时，系统记录当前时间戳，并设置 `unlockAtTimestamp = Date.now() + 30 * 60 * 1000`。
* **卡面呈现**：
  * 在倒计时未归零前，正面照片施加高斯模糊与暗房滤镜，正中央展示倒计时（分:秒）与水滴/心跳式脉冲光环；
  * 倒计时归零后自动解除模糊，展现完全清晰的成片。
* **设计意图**：打破现代人“刚拍照就必须修图发圈”的成瘾焦虑，为情绪发酵创造物理空白。

### 5.3 朋友圈诗意画报一键生成 (`EmbodiedShopModal.tsx`)
* **实现技术**：纯客户端 HTML5 Offscreen Canvas 高清离屏渲染（1080 × 1920 竖屏 9:16 朋友圈/小红书最佳画幅）。
* **自动合成元素**：
  1. 高级暗夜暖木质感底色（`#0e0f12`）；
  2. 选定明信片的高清视觉切片（圆角微阴影）；
  3. 日期签标、农历节气与体感温度；
  4. 用户的具身原声金句引言；
  5. 底部印制专属「具身回响」品牌徽章、标语及扫码收听真实原声的声音二维码；
* **导出能力**：一键导出 2x 高清 PNG 图片至本地下载；同时支持手机长按保存与扫码分享。

### 5.4 Google Drive 云端无缝备份与多端还原 (`services/`)
* **零配置密钥外泄保障**：采用 Firebase Auth Client SDK 进行 Google 登录，获取临时的只读/读写 OAuth Access Token，**仅保存在浏览器内存中**，杜绝任何 API Key 与 Refresh Token 泄漏。
* **独立文件夹隔离**：首次备份时，系统自动在用户的 Google Drive 根目录创建专用的 `具身回响 · Embodied Echo 备份` 文件夹。
* **全量快照与回滚保护**：备份以标准的带时间戳 JSON 格式（如 `embodied_echo_backup_2026-10-16.json`）存储，包含用户所有的明信片、音频波形与共鸣记录。恢复时提供全量替换与增量合并选项，并配备防误触二次确认对话框。

---

## 6. UI/UX 视觉规范与 Tailwind 色彩系统

在任何后续修改中，**务必严格遵守以下视觉准则**（避免生成现代通用 AI 常见的白蓝扁平渐变）：

1. **背景底色基调**：
   * 极暗暖色系调色板：`#0c0d0e`（主背景）、`#141517`（卡片面背景）、`#1e1c18`（深胡桃木提亮色）。
2. **文字与衬线色彩**：
   * 象牙纸白：`#f5ede0`、`#ded9ce`；
   * 岁月浅黄/香槟金：`#e6c382`、`#d4af37`（用于强调、金句和活跃按键）；
   * 沉静灰褐色：`#8a857b`、`#575248`（用于副标题与微小辅助信息）。
3. **字体搭配**：
   * 标题与文学文本：优先采用人文宋体与经典衬线体（`font-serif-sc`、`font-serif`）；
   * 数据与时间戳：采用等宽字体（`font-mono-data`、`font-mono`）。
4. **质感原则**：
   * 避免大面积粗暴的大胶囊圆角（Pill shape）；使用 `rounded-xl`、`rounded-2xl` 的内敛几何矩形圆角；
   * 强调细腻的极细边框（`border border-[#2d2922]`）与微弱毛玻璃（`backdrop-blur-md`）。

---

## 7. 如何向其他 AI (Claude / GPT / Cursor) 提需求：示例 Prompt 模板

当你在 Cursor、Claude 或 ChatGPT 中打开本项目时，只需在对话开头粘贴以下提示词，即可高效开启协作：

### 示例 1：增加新功能的提示词
```text
我正在开发「具身回响 (Embodied Echo)」项目，请先阅读项目根目录的 PROJECT_ARCHITECTURE.md。
我希望在「今日视窗」中新增一个【天气与体感联动】的小功能：
1. 允许用户根据当前所在的城市，自动拉取或手动滑选当前的温湿度与空气体感；
2. 保持现有的 Tailwind 暗调木质复古风格，不要引入外部重型UI库；
3. 将体感数据正确写入 PostcardEntry 接口中的 weather 字段；
4. 保证 TypeScript 严格类型与无报错编译。
```

### 示例 2：优化音频录制与可视化的提示词
```text
请参考 PROJECT_ARCHITECTURE.md 中的 AudioWaveformVisualizer.tsx 与 CreatePostcardModal.tsx：
我想优化录音过程中的声波表现：
1. 当用户对着麦克风说话时，声波线条的金色光泽根据音量分贝动态调整亮度和发光模糊（drop-shadow）；
2. 增加一个 30 秒倒计时防超时自动结束录制的轻提示；
3. 严格遵循现有的人文复古视觉规范，不要改动已有的 Google Drive 备份逻辑。
```

### 示例 3：二次开发后端数据库的提示词
```text
请查阅 PROJECT_ARCHITECTURE.md。目前项目使用 localStorage + Google Drive REST API 进行数据存储与同步。
我想引入一个轻量级的后端（如 Supabase 或 Express + SQLite）：
1. 请参考 src/types/index.ts 中定义的 PostcardEntry 数据结构设计数据库表结构；
2. 为明信片的创建、列表查询与共鸣留言提供标准的 RESTful API 路由；
3. 保持前端现有组件的接口调用透明兼容。
```

---
*本文档为「具身回响」核心工程资产，建议随代码版本一同提交与维护。*
