import { GuidedPrompt } from '../types';

export const GUIDED_PROMPTS: GuidedPrompt[] = [
  {
    id: 'p-tactile-1',
    dimension: 'tactile',
    dimensionLabel: '触觉与温度',
    dimensionIcon: 'HandMetal',
    question: '那一刻，你皮肤感知到的冷暖、风的抚摸或手中的质感是什么？',
    subHint: '杯壁的温热、被风吹凉的指尖、粗粝的木纹…把注意力拉回皮肤表面。',
  },
  {
    id: 'p-breath-1',
    dimension: 'breath',
    dimensionLabel: '呼吸与心跳',
    dimensionIcon: 'HeartPulse',
    question: '按动快门的那一瞬间，你的胸口是收紧还是放松的？心跳的声音如何？',
    subHint: '是深深吸了一口微凉的气流，还是因为某种震颤而短暂屏住了呼吸？',
  },
  {
    id: 'p-scent-1',
    dimension: 'scent',
    dimensionLabel: '气味与氛围',
    dimensionIcon: 'Wind',
    question: '那一刻空气里漂浮着什么气味？这股气息将你带回了哪段遥远的回忆？',
    subHint: '雨水落在柏油路上的微涩潮湿、咖啡烘焙的焦香、或者深秋落叶被踩碎的草木沉香。',
  },
  {
    id: 'p-unspoken-1',
    dimension: 'unspoken',
    dimensionLabel: '隐秘的情绪',
    dimensionIcon: 'Sparkles',
    question: '快门前后那几秒，你内心有什么没有对别人说出口的悸动、疲惫或不舍？',
    subHint: '允许脆弱浮出水面，不需要逻辑包装，只要最原始的真实感受。',
  },
  {
    id: 'p-adventure-1',
    dimension: 'adventure',
    dimensionLabel: '关系中的冒险',
    dimensionIcon: 'Flame',
    question: '镜头另一端、或此刻身旁的那个人，让你感受到了怎样的连结与试探？',
    subHint: '人类的珍贵在于敢于暴露真心与承担伤害。那一刻你跨出了哪一步？',
  },
];
