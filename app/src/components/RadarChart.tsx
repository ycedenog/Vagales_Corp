import { useEffect, useRef, useState } from 'react';

interface RadarChartProps {
  aptitudes: {
    tryhard: number;
    troll: number;
    flammer: number;
    iq: number;
    habilidad: number;
  };
  color: string;
}

export default function RadarChart({ aptitudes, color }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const labels = ['TRYHARD', 'TROLL', 'FLAMMER', 'IQ', 'HABILIDAD'];
  const values = [aptitudes.tryhard, aptitudes.troll, aptitudes.flammer, aptitudes.iq, aptitudes.habilidad];
  const maxVal = 5;

  useEffect(() => {
    let startTime: number;
    let animId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 800, 1);
      setAnimProgress(progress);
      if (progress < 1) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [aptitudes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 280;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 90;
    const numAxes = 5;
    const angleStep = (Math.PI * 2) / numAxes;

    ctx.clearRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = (radius / 5) * i;
      for (let j = 0; j <= numAxes; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      ctx.stroke();
    }

    // Data
    ctx.beginPath();
    ctx.fillStyle = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = (values[i] / maxVal) * animProgress;
      const r = radius * val;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Points
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = (values[i] / maxVal) * animProgress;
      const r = radius * val;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = color + '30';
      ctx.fill();
    }

    // Labels
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelRadius = radius + 28;
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      ctx.fillText(labels[i], x, y);
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(values[i].toString(), x, y + 14);
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#fff';
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [aptitudes, color, animProgress]);

  return <canvas ref={canvasRef} width={280} height={280} className="w-full h-full" style={{ maxWidth: 280, maxHeight: 280 }} />;
}
