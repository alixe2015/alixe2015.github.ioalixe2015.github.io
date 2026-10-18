import { PostcardEntry, SensoryDimension } from '../types';

export interface EmotionFingerprintMetrics {
  warmthIndex: number; // 1.0 to 10.0
  jitterIndex: number; // 0 to 100 (%)
  silenceRatio: number; // 0 to 100 (%)
  harmonicRichness: number; // 0 to 100
  dominantColor: string;
  secondaryColor: string;
  accentColor: string;
  glyph: string;
  dimensionName: string;
}

export const DIMENSION_GLYPH_MAP: Record<SensoryDimension, { glyph: string; name: string }> = {
  tactile: { glyph: '触', name: '肌理触觉' },
  breath: { glyph: '息', name: '呼吸律动' },
  scent: { glyph: '嗅', name: '空气气味' },
  unspoken: { glyph: '语', name: '未言心语' },
  adventure: { glyph: '历', name: '肉身冒险' }
};

/**
 * Computes deep acoustic-somatic metrics from a postcard's attributes and waveforms
 */
export function computeFingerprintMetrics(postcard: PostcardEntry): EmotionFingerprintMetrics {
  const temp = postcard.moodTemperature || 6;
  const dimension = postcard.sensoryDimension || 'tactile';
  const dimInfo = DIMENSION_GLYPH_MAP[dimension] || { glyph: '回', name: '感官回响' };
  
  // Waveform variance
  const waves = postcard.audioWaveformData || [40, 55, 70, 85, 60, 45, 65, 80, 50, 40, 30, 60];
  const avgWave = waves.reduce((a, b) => a + b, 0) / waves.length;
  const waveVariance = waves.reduce((a, b) => a + Math.pow(b - avgWave, 2), 0) / waves.length;

  // Somatic anchors integration
  const breathState = postcard.somaticAnchors?.breathState || 6;
  const heartRhythm = postcard.somaticAnchors?.heartRhythm || 5;
  const vulnerability = postcard.somaticAnchors?.vulnerability || 6;

  // 1. Acoustic Warmth
  const warmthIndex = Number(((temp * 0.6) + (breathState * 0.25) + (vulnerability * 0.15)).toFixed(1));

  // 2. HRV Jitter index (physiological micro-fluctuation)
  const jitterIndex = Math.min(99, Math.max(65, Math.round(75 + (heartRhythm * 2.2) + (waveVariance * 0.05))));

  // 3. Silence / Breath space ratio
  const quietBars = waves.filter(w => w < 40).length;
  const silenceRatio = Math.round((quietBars / waves.length) * 45) + 12;

  // 4. Harmonic Richness
  const harmonicRichness = Math.min(98, Math.max(52, Math.round((avgWave * 0.7) + (vulnerability * 4))));

  // Dynamic colors based on warmth/temperature
  let dominantColor = '#e6c382'; // Gold default
  let secondaryColor = '#8a6d3b';
  let accentColor = '#f5e4be';

  if (warmthIndex <= 3.8) {
    // Cool Mist / Ocean Frost
    dominantColor = '#6ba4b8';
    secondaryColor = '#3a6677';
    accentColor = '#a8d8e8';
  } else if (warmthIndex >= 7.2) {
    // Warm Cinnabar / Flame
    dominantColor = '#d96a43';
    secondaryColor = '#8c3519';
    accentColor = '#fca482';
  } else {
    // Balanced Gold Silk
    dominantColor = '#d4af37';
    secondaryColor = '#7d6118';
    accentColor = '#fae69e';
  }

  return {
    warmthIndex,
    jitterIndex,
    silenceRatio,
    harmonicRichness,
    dominantColor,
    secondaryColor,
    accentColor,
    glyph: dimInfo.glyph,
    dimensionName: dimInfo.name
  };
}

/**
 * Procedural rendering of the radial Emotion Fingerprint onto an HTML5 Canvas
 */
export function drawFingerprintOnCanvas(
  canvas: HTMLCanvasElement,
  postcard: PostcardEntry,
  options: {
    size: number;
    rotationAngle?: number; // radians
    liveEnergy?: number; // 0 to 1, increases ripple when audio is playing
    style?: 'rings' | 'waves' | 'seal';
    showOuterText?: boolean;
    transparentBg?: boolean;
  }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    size,
    rotationAngle = 0,
    liveEnergy = 0,
    style = 'rings',
    showOuterText = true,
    transparentBg = false
  } = options;

  // Retina scale
  const dpr = window.devicePixelRatio || 2;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  ctx.save();
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const metrics = computeFingerprintMetrics(postcard);
  const waves = postcard.audioWaveformData || [40, 50, 75, 90, 60, 45, 70, 85, 55, 40, 35, 65];

  // Background
  if (!transparentBg) {
    const bgGrad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
    bgGrad.addColorStop(0, '#151619');
    bgGrad.addColorStop(1, '#0e0f11');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  // Draw Glow Core
  const glowRadius = (size * 0.38) * (1 + liveEnergy * 0.15);
  const glowGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, glowRadius);
  glowGrad.addColorStop(0, `${metrics.dominantColor}35`);
  glowGrad.addColorStop(0.6, `${metrics.secondaryColor}15`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationAngle);

  // Style 1: Concentric Acoustic Tree Rings (年轮声纹)
  if (style === 'rings' || style === 'seal') {
    const ringCount = 7;
    const baseRadiusStep = (size * 0.35) / ringCount;

    for (let r = 1; r <= ringCount; r++) {
      const radius = r * baseRadiusStep + (liveEnergy * 4 * Math.sin(r + rotationAngle * 2));
      const ringWaveIndex = (r * 2) % waves.length;
      const waveMod = (waves[ringWaveIndex] / 100) * 8;

      ctx.beginPath();
      const points = 180;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        // Harmonic noise simulation using wave data + sin/cos
        const harmonic1 = Math.sin(theta * 6 + r) * (2 + waveMod * 0.5);
        const harmonic2 = Math.cos(theta * 12 + r * 1.5) * (1.2 + liveEnergy * 3);
        const harmonic3 = Math.sin(theta * 3 - r) * (waveMod * 0.4);

        const currentR = radius + harmonic1 + harmonic2 + harmonic3;
        const x = Math.cos(theta) * currentR;
        const y = Math.sin(theta) * currentR;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Ring stroke styling
      ctx.lineWidth = r === ringCount || r === 1 ? 1.5 : (r % 2 === 0 ? 1 : 0.6);
      const ringAlpha = (0.25 + (r / ringCount) * 0.55).toFixed(2);
      ctx.strokeStyle = `${metrics.dominantColor}${Math.floor(parseFloat(ringAlpha) * 255).toString(16).padStart(2, '0')}`;
      ctx.stroke();

      // Add delicate golden acoustic nodes along some rings
      if (r % 2 === 1 && r > 2) {
        for (let n = 0; n < 8; n++) {
          const nodeAngle = (n / 8) * Math.PI * 2 + (r * 0.2);
          const nodeDist = radius + Math.sin(nodeAngle * 6) * 2;
          const nx = Math.cos(nodeAngle) * nodeDist;
          const ny = Math.sin(nodeAngle) * nodeDist;

          ctx.beginPath();
          ctx.arc(nx, ny, 1.2 + (liveEnergy * 1.2), 0, Math.PI * 2);
          ctx.fillStyle = metrics.accentColor;
          ctx.fill();
        }
      }
    }
  }

  // Style 2: Radial Spectrogram Wave Spikes (声波粒子射线)
  if (style === 'waves') {
    const rayCount = 64;
    const innerR = size * 0.12;
    const maxRayLen = size * 0.28;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const waveVal = waves[i % waves.length] || 50;
      const energyPulse = liveEnergy * (Math.sin(i * 3 + rotationAngle * 4) * 15);
      const rayLen = ((waveVal / 100) * maxRayLen + energyPulse) * (0.6 + (metrics.warmthIndex / 20));

      const x1 = Math.cos(angle) * innerR;
      const y1 = Math.sin(angle) * innerR;
      const x2 = Math.cos(angle) * (innerR + rayLen);
      const y2 = Math.sin(angle) * (innerR + rayLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = i % 4 === 0 ? 1.8 : 0.9;
      ctx.strokeStyle = i % 2 === 0 ? metrics.dominantColor : `${metrics.secondaryColor}bb`;
      ctx.stroke();

      // Vertex particle
      if (rayLen > maxRayLen * 0.4) {
        ctx.beginPath();
        ctx.arc(x2, y2, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = metrics.accentColor;
        ctx.fill();
      }
    }
  }

  ctx.restore(); // restore rotation

  // Central Core Seal
  const coreRadius = size * 0.095;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = style === 'seal' ? '#8a2817' : '#141518';
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = style === 'seal' ? '#e6c382' : metrics.dominantColor;
  ctx.stroke();

  // Seal inner dashed ring
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius - 3.5, 0, Math.PI * 2);
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = `${metrics.accentColor}80`;
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Central Chinese Glyph
  ctx.font = `bold ${Math.round(coreRadius * 1.05)}px "Noto Serif SC", "Songti SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style === 'seal' ? '#f5e4be' : metrics.accentColor;
  ctx.fillText(metrics.glyph, cx, cy + 1);

  // Outer Circular Rim Typography
  if (showOuterText) {
    const textRadius = size * 0.44;
    const rimText = `EMBODIED ECHO · VOICE EMOTION FINGERPRINT · ${postcard.date} · ${postcard.location.toUpperCase()} · `;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.font = `600 ${Math.max(8, Math.round(size * 0.024))}px "Space Mono", monospace`;
    ctx.fillStyle = `${metrics.dominantColor}99`;

    const charAngleStep = (Math.PI * 2) / rimText.length;
    for (let c = 0; c < rimText.length; c++) {
      const char = rimText[c];
      const charAngle = c * charAngleStep + (rotationAngle * 0.25);
      ctx.save();
      ctx.rotate(charAngle);
      ctx.fillText(char, 0, -textRadius);
      ctx.restore();
    }
    ctx.restore();

    // Outer thin boundary circle
    ctx.beginPath();
    ctx.arc(cx, cy, textRadius + 9, 0, Math.PI * 2);
    ctx.strokeStyle = `${metrics.dominantColor}30`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}
