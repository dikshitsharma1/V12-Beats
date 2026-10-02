import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { AudioEngine } from '../utils/audioEngine';

interface VisualizerProps {
  className?: string;
  height?: number;
  interactive?: boolean;
}

export const AudioVisualizer: React.FC<VisualizerProps> = ({
  className = '',
  height = 48,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { visualizerMode, isPlaying } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visualizerMode === 'off') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = AudioEngine.getInstance();
    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;

      engine.getFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, h);

      if (visualizerMode === 'bars') {
        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * h * 0.95;
          const grad = ctx.createLinearGradient(0, h, 0, 0);
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, h - barHeight, barWidth - 1.5, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          x += barWidth;
          if (x > width) break;
        }
      } else if (visualizerMode === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (visualizerMode === 'spectrum') {
        // Mirrored spectrum
        const barCount = 32;
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const val = (dataArray[i * 2] / 255) * (h / 2);
          const x = i * barWidth;

          const grad = ctx.createLinearGradient(0, h / 2 - val, 0, h / 2 + val);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#ec4899');

          ctx.fillStyle = grad;
          ctx.fillRect(x, h / 2 - val, barWidth - 1, val * 2);
        }
      } else if (visualizerMode === 'orb') {
        // Circular pulsing energy orb
        const centerX = width / 2;
        const centerY = h / 2;
        let avg = 0;
        for (let i = 0; i < 20; i++) avg += dataArray[i];
        avg = avg / 20;

        const baseRadius = Math.min(centerX, centerY) * 0.45;
        const pulse = (avg / 255) * (baseRadius * 0.8);

        const radial = ctx.createRadialGradient(
          centerX,
          centerY,
          2,
          centerX,
          centerY,
          baseRadius + pulse
        );
        radial.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
        radial.addColorStop(0.4, 'rgba(236, 72, 153, 0.6)');
        radial.addColorStop(0.8, 'rgba(139, 92, 246, 0.2)');
        radial.addColorStop(1, 'transparent');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [visualizerMode, isPlaying]);

  if (visualizerMode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={height}
      className={`block opacity-90 transition-opacity ${className}`}
    />
  );
};
