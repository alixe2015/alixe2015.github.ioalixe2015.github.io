import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Sparkles, Activity, Download } from 'lucide-react';
import { blobToBase64, ambientPlayer } from '../utils/audioSynth';

interface VoiceRecorderProps {
  initialAudioUrl?: string;
  initialDuration?: number;
  onAudioSaved: (audioUrl: string, duration: number, waveform: number[]) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  initialAudioUrl,
  initialDuration = 0,
  onAudioSaved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [audioDuration, setAudioDuration] = useState<number>(initialDuration);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isUsingAmbientSynthRef = useRef<boolean>(false);

  // Web Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch {}
      }
      ambientPlayer.stop();
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start real-time organic dynamic waveform renderer on canvas
  const startCanvasVisualizer = (stream?: MediaStream) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (stream) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;
      } catch (e) {
        console.warn('AudioContext visualizer fallback to synth waves', e);
      }
    }

    let phase = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      phase += 0.04;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      ctx.fillStyle = '#101012';
      ctx.fillRect(0, 0, width, height);

      // Center baseline
      ctx.strokeStyle = '#22211e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      let freqIntensity = 0.5;
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        freqIntensity = (sum / dataArrayRef.current.length) / 128;
      }

      // Draw Multi-Layer Organic Wave Lines (心潮流体曲线)
      const layers = [
        {
          color: 'rgba(230, 195, 130, 0.85)',
          glow: 'rgba(230, 195, 130, 0.4)',
          width: 2.5,
          freq: 0.02,
          speed: 1.0,
          amp: Math.max(12, freqIntensity * 38),
        },
        {
          color: 'rgba(244, 114, 182, 0.5)',
          glow: 'rgba(244, 114, 182, 0.2)',
          width: 1.8,
          freq: 0.028,
          speed: -0.8,
          amp: Math.max(8, freqIntensity * 28),
        },
        {
          color: 'rgba(56, 189, 248, 0.35)',
          glow: 'rgba(56, 189, 248, 0.1)',
          width: 1.2,
          freq: 0.015,
          speed: 0.6,
          amp: Math.max(6, freqIntensity * 20),
        },
      ];

      layers.forEach((layer) => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = layer.width;
        ctx.strokeStyle = layer.color;
        ctx.shadowColor = layer.glow;
        ctx.shadowBlur = 10;

        for (let x = 0; x <= width; x += 4) {
          // Organic modulated wave formula
          const normalY = height / 2;
          const envelope = Math.sin((x / width) * Math.PI); // taper ends
          const wave =
            Math.sin(x * layer.freq + phase * layer.speed) *
            Math.cos(x * layer.freq * 0.5 + phase * 0.5);
          const y = normalY + wave * layer.amp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      });
    };

    render();
  };

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const base64 = await blobToBase64(audioBlob);
          setAudioUrl(base64);
          setAudioDuration(recordingSeconds);

          const generatedWaveform = Array.from({ length: 16 }, () => Math.floor(Math.random() * 60) + 30);
          onAudioSaved(base64, recordingSeconds, generatedWaveform);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        startCanvasVisualizer(stream);

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('getUserMedia not supported');
      }
    } catch (err) {
      console.warn('Microphone access unavailable or denied, falling back to simulated voice recording mode', err);
      setHasMicPermission(false);
      setIsRecording(true);
      setRecordingSeconds(0);
      startCanvasVisualizer();

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      const duration = Math.max(recordingSeconds, 6);
      setAudioDuration(duration);
      const simulatedWaveform = Array.from({ length: 16 }, () => Math.floor(Math.random() * 60) + 35);
      const simulatedAudio = 'synth-voice://ambient-warmth';
      setAudioUrl(simulatedAudio);
      onAudioSaved(simulatedAudio, duration, simulatedWaveform);
    }

    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      if (isUsingAmbientSynthRef.current) {
        ambientPlayer.stop();
      } else if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    startCanvasVisualizer();

    if (audioUrl.startsWith('synth-voice://') || audioUrl.startsWith('mock://') || !audioUrl.startsWith('data:audio')) {
      isUsingAmbientSynthRef.current = true;
      setIsPlaying(true);
      const stopAmbient = ambientPlayer.playAmbient('warmth', audioDuration || 15);

      let cur = 0;
      const interval = setInterval(() => {
        cur += 1;
        setPlaybackSeconds(cur);
        if (cur >= (audioDuration || 15)) {
          clearInterval(interval);
          setIsPlaying(false);
          setPlaybackSeconds(0);
          stopAmbient();
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        }
      }, 1000);
    } else {
      isUsingAmbientSynthRef.current = false;
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioUrl);
      } else {
        audioElementRef.current.src = audioUrl;
      }

      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          setPlaybackSeconds(Math.floor(audioElementRef.current.currentTime));
        }
      };

      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackSeconds(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      audioElementRef.current.play().catch((e) => console.error(e));
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioElementRef.current) audioElementRef.current.pause();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    ambientPlayer.stop();
    setIsPlaying(false);
    setAudioUrl(undefined);
    setAudioDuration(0);
    setPlaybackSeconds(0);
  };

  return (
    <div className="bg-[#1f1e1b]/80 border border-[#38332b] rounded-xl p-4 text-[#e0dad0]">
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <span className="font-serif-sc text-[#c2b8a3] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#e6c382]" />
          <span>心潮声纹 · 真实声调的动态波动线条</span>
        </span>
        <span className="font-mono-data text-[11px] text-[#8e8574]">
          {isRecording
            ? formatTime(recordingSeconds)
            : audioUrl
            ? `${formatTime(playbackSeconds)} / ${formatTime(audioDuration)}`
            : '等待开启'}
        </span>
      </div>

      {/* Dynamic Fluid Heart-Tide Waveform Canvas */}
      <div className="relative w-full h-16 bg-[#101012] rounded-lg overflow-hidden border border-[#2b2925] mb-3 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-full block"
        />

        {/* Ambient Overlay label if not recording and not playing */}
        {!isRecording && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[11px] font-serif-sc text-[#6b6456] gap-1.5">
            <Sparkles className="w-3 h-3 text-[#e6c382]/60" />
            <span>{audioUrl ? '点击试听呈现心潮波澜' : '开启麦克风，声线起伏将具象化为动态流体线条'}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2 px-3 bg-[#2d2822] hover:bg-[#3d362d] border border-[#52493d] rounded-lg text-xs font-serif-sc text-[#edd8b4] transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{audioUrl ? '重新录制心潮声纹' : '开启麦克风录制这一刻'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 py-2 px-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 rounded-lg text-xs font-serif-sc text-rose-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>完成录音 · 定格心潮 ({formatTime(recordingSeconds)})</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="py-2 px-3 bg-[#e6c382] hover:bg-[#f2d59d] text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? '暂停' : '试听心潮'}</span>
            </button>
            <a
              href={audioUrl}
              download={`具身回响_心潮原声_${Date.now()}.webm`}
              title="下载原声音频文件 (WebM)"
              className="p-2 text-[#8e8574] hover:text-[#e6c382] hover:bg-[#2a2620] rounded-lg transition-colors flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={resetRecording}
              title="清除录音"
              className="p-2 text-[#8e8574] hover:text-[#ded8cb] hover:bg-[#2a2620] rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {hasMicPermission === false && (
        <p className="mt-2 text-[11px] text-[#a89d89] font-serif-sc">
          注：浏览器未授权麦克风时，系统将自动采用拟真具身环境声波转化为流体线条。
        </p>
      )}
    </div>
  );
};
