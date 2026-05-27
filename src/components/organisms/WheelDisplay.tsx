import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useWheelData } from '../../hooks/useWheelData';
import { useWheelActions } from '../../hooks/useWheelActions';
import { 
  WHEEL_CANVAS_RESOLUTION, 
  WHEEL_REFERENCE_SIZE, 
  YIQ_CONTRAST_THRESHOLD,
  WHEEL_TOP_OFFSET_DEG
} from '../../constants';

function getContrastYIQ(hexcolor: string) {
  if (!hexcolor || typeof hexcolor !== 'string' || !hexcolor.startsWith('#')) return '#ffffff';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '#ffffff';
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= YIQ_CONTRAST_THRESHOLD ? '#111111' : '#ffffff';
}

export const WheelDisplay = () => {
  const isSpinning = useAppStore(s => s.isSpinning);
  const rotation = useAppStore(s => s.rotation);
  const spinTime = useAppStore(s => s.spinTime);
  const eliminationSpinTime = useAppStore(s => s.eliminationSpinTime);
  const eliminationMode = useAppStore(s => s.eliminationMode);
  const textSize = useAppStore(s => s.textSize);
  const centerSize = useAppStore(s => s.centerSize);
  const centerImage = useAppStore(s => s.centerImage);
  const winner = useAppStore(s => s.winner);

  const { validItems, slices } = useWheelData();
  const { spinWheel } = useWheelActions();

  const isFinalRound = eliminationMode && validItems.length === 2;
  const actualSpinTime = isFinalRound 
    ? spinTime 
    : (eliminationMode ? eliminationSpinTime : spinTime);

  const spinWheelRef = useRef(spinWheel);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerPolygonRef = useRef<SVGPolygonElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    spinWheelRef.current = spinWheel;
  }, [spinWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
         return;
      }
      if (e.ctrlKey && e.key === 'Enter') {
         if (!isSpinning && !winner && validItems.length >= 2) {
           spinWheelRef.current();
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpinning, winner, validItems.length]);

  // Pre-load images to avoid empty slices on first draw
  useEffect(() => {
    let loadedCount = 0;
    const slicesWithImages = slices.filter(s => s.item.image);
    if (slicesWithImages.length === 0) {
      setImagesLoaded(prev => prev + 1); // trigger draw
      return;
    }

    slicesWithImages.forEach(slice => {
      if (slice.item.image) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === slicesWithImages.length) {
            setImagesLoaded(prev => prev + 1);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === slicesWithImages.length) {
            setImagesLoaded(prev => prev + 1);
          }
        };
        img.src = slice.item.image;
      }
    });
  }, [slices]);

  // Draw the wheel onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const size = WHEEL_CANVAS_RESOLUTION; // high res canvas
    canvas.width = size;
    canvas.height = size;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2;

    ctx.clearRect(0, 0, width, height);

    const refContainer = WHEEL_REFERENCE_SIZE;
    const scale = size / refContainer;

    slices.forEach((slice) => {
      const startRad = (slice.startAngle - WHEEL_TOP_OFFSET_DEG) * Math.PI / 180;
      const endRad = ((slice.startAngle + slice.angle) - WHEEL_TOP_OFFSET_DEG) * Math.PI / 180;

      // Draw Slice Background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startRad, endRad);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Separator Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(startRad) * radius, centerY + Math.sin(startRad) * radius);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // Ensure text isn't drawn over image if there is one (or we can draw over)
      // Actually the original SVG draws image THEN text. Let's draw text always.
    });

    // Draw images
    slices.forEach((slice) => {
      if (!slice.item.image) return;
      const startRad = (slice.startAngle - WHEEL_TOP_OFFSET_DEG) * Math.PI / 180;
      const endRad = ((slice.startAngle + slice.angle) - WHEEL_TOP_OFFSET_DEG) * Math.PI / 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startRad, endRad);
      ctx.closePath();
      ctx.clip(); // clip to slice bounds

      // Wait, synchronous image loading isn't possible, but we pre-loaded them, 
      // so if they are in browser cache they might render, but we need an actual Image obj.
      // Easiest is to create new Image and if complete, draw it.
      const img = new Image();
      img.src = slice.item.image;
      if (img.complete && img.naturalWidth > 0) {
         // Create a clipping region for this slice and draw image
         // How big should the image be? It covered the whole canvas in SVG (100x100 viewBox).
         // Actually SVG image was `<image href="..." x="0" y="0" width="..." />` with preserveAspectRatio="xMidYMid slice"
         // To simulate this in canvas:
         const imgAspect = img.width / img.height;
         const canvasAspect = 1;
         let drawWidth = width;
         let drawHeight = height;
         let offsetX = 0;
         let offsetY = 0;

         if (imgAspect > canvasAspect) {
             drawHeight = height;
             drawWidth = height * imgAspect;
             offsetX = (width - drawWidth) / 2;
         } else {
             drawWidth = width;
             drawHeight = width / imgAspect;
             offsetY = (height - drawHeight) / 2;
         }
         ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
      ctx.restore();
    });

    // Radial Gradient Overlay
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw Texts
    slices.forEach((slice) => {
      const { item, angle, startAngle } = slice;
      const angleRadCenter = ((startAngle + angle / 2) - WHEEL_TOP_OFFSET_DEG) * Math.PI / 180;
      
      const maxLength = Math.max(item.text.length, 1);
      const innerRadius = centerSize / 2;
      const padding = 20; 
      
      const availableWidthPx = (refContainer / 2) - innerRadius - padding;
      const widthConstrainedSize = availableWidthPx / (maxLength * 0.55);
      
      const midRadius = innerRadius + (availableWidthPx / 2);
      const availableHeightPx = midRadius * (angle * Math.PI / 180);
      const heightConstrainedSize = availableHeightPx * 0.85; 
      
      const optimalSize = Math.min(widthConstrainedSize, heightConstrainedSize, 50);
      const finalSizePx = optimalSize * (textSize / 100) * 0.65;
      
      const fontSize = Math.max(finalSizePx * scale, 12); // scale to canvas size

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleRadCenter);
      
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      
      // textColor
      ctx.fillStyle = item.image ? '#ffffff' : getContrastYIQ(slice.color);
      
      // Shadow
      ctx.shadowColor = (item.image || getContrastYIQ(slice.color) === '#ffffff') ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,0.4)';
      ctx.shadowBlur = 4 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * scale;

      // Draw Text
      // position from center: (radius - padding*scale)
      const textX = radius - (padding * scale) - (10 * scale);
      ctx.fillText(item.text, textX, 0);
      
      ctx.restore();
    });

  }, [slices, textSize, centerSize, imagesLoaded]);

  // Dynamically calculate the active slice color under the pointer
  const pointerColor = (() => {
    if (slices.length === 0) return '#f97316';
    // Pointer is located at 3 o'clock (0 degrees).
    // The relative wheel angle under the pointer is: (90 - rotation) % 360
    const pointerAngle = (90 - (rotation % 360) + 360) % 360;
    const activeSlice = slices.find(
      (slice) => pointerAngle >= slice.startAngle && pointerAngle < slice.endAngle
    ) || slices[slices.length - 1]; // fallback
    return activeSlice ? activeSlice.color : '#f97316';
  })();

  const pointerStrokeColor = getContrastYIQ(pointerColor);

  // Real-time tracking of visual rotation during spinning
  useEffect(() => {
    let animationFrameId: number;

    const updatePointerColorRealtime = () => {
      const el = wheelContainerRef.current;
      const poly = pointerPolygonRef.current;
      if (!el || !poly || slices.length === 0) {
        animationFrameId = requestAnimationFrame(updatePointerColorRealtime);
        return;
      }

      const style = window.getComputedStyle(el);
      const transform = style.getPropertyValue("transform") || style.getPropertyValue("-webkit-transform");
      
      let currentRotationDeg = rotation % 360;
      if (transform && transform !== 'none') {
        try {
          if (transform.startsWith('matrix(')) {
            const values = transform.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            const angleRad = Math.atan2(b, a);
            let deg = angleRad * (180 / Math.PI);
            if (deg < 0) deg += 360;
            currentRotationDeg = deg;
          }
        } catch (e) {
          // Fall back to target rotation
        }
      }

      // Pointer is placed at 3 o'clock (90 deg offset in coordinates)
      const pointerAngle = (90 - currentRotationDeg + 360) % 360;
      const activeSlice = slices.find(
        (slice) => pointerAngle >= slice.startAngle && pointerAngle < slice.endAngle
      ) || slices[slices.length - 1];

      if (activeSlice) {
        const color = activeSlice.color;
        const strokeColor = getContrastYIQ(color);
        poly.setAttribute('fill', color);
        poly.setAttribute('stroke', strokeColor);
      }

      animationFrameId = requestAnimationFrame(updatePointerColorRealtime);
    };

    if (isSpinning) {
      animationFrameId = requestAnimationFrame(updatePointerColorRealtime);
    } else {
      // Precise final target update
      const el = wheelContainerRef.current;
      const poly = pointerPolygonRef.current;
      if (el && poly && slices.length > 0) {
        const pointerAngle = (90 - (rotation % 360) + 360) % 360;
        const activeSlice = slices.find(
          (slice) => pointerAngle >= slice.startAngle && pointerAngle < slice.endAngle
        ) || slices[slices.length - 1];
        if (activeSlice) {
          poly.setAttribute('fill', activeSlice.color);
          poly.setAttribute('stroke', getContrastYIQ(activeSlice.color));
        }
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSpinning, rotation, slices]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative bg-gradient-to-br from-[#1a2530] via-[#0d131a] to-[#251000] overflow-hidden min-h-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* CONTAINER DA RODA */}
      <div 
        onClick={() => spinWheel()}
        role="button"
        tabIndex={0}
        aria-label="Girar roleta"
        className={`relative flex items-center justify-center w-[min(80vw,320px)] h-[min(80vw,320px)] sm:w-[min(80vw,450px)] sm:h-[min(80vw,450px)] lg:w-[550px] lg:h-[550px] shrink-0 outline-none transition-all duration-300 ease-out
        ${!isSpinning && validItems.length >= 2 ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-95'}`}
      >
        {/* Ponteiro */}
        <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-40 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 100 100" className="md:w-[50px] md:h-[50px]">
            <polygon 
              ref={pointerPolygonRef}
              points="10,50 90,10 90,90" 
              fill={pointerColor} 
              stroke={pointerStrokeColor} 
              strokeWidth="4" 
              className="transition-colors duration-150 ease-out"
            />
          </svg>
        </div>

        <div className="absolute inset-0 rounded-full border-[6px] border-[#e2e8f0]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20 pointer-events-none" />

        {/* Overlay Texto Curvado */}
        {!isSpinning && validItems.length >= 2 && !winner && (
          <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-90 transition-opacity">
            <path id="curveUp" d="M 120 250 A 130 130 0 0 1 380 250" fill="transparent" />
            <path id="curveDown" d="M 120 250 A 130 130 0 0 0 380 250" fill="transparent" />
            <text className="fill-white font-black text-[32px] tracking-wide" textAnchor="middle">
              <textPath href="#curveUp" startOffset="50%">clique para girar</textPath>
            </text>
            <text className="fill-white font-black text-[24px] tracking-wide" textAnchor="middle">
              <textPath href="#curveDown" startOffset="50%">ou pressione ctrl+enter</textPath>
            </text>
          </svg>
        )}

        <div 
          ref={wheelContainerRef}
          className="w-full h-full rounded-full relative overflow-hidden transition-transform ease-[cubic-bezier(0.15,0.8,0.15,1)] border border-slate-700/50 box-border"
          style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${actualSpinTime}s`, containerType: 'inline-size' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block rounded-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div 
          className="absolute m-auto bg-white rounded-full z-30 shadow-[0_2px_10px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden pointer-events-none transition-all duration-300"
          style={{ width: `${centerSize}px`, height: `${centerSize}px` }}
        >
            <img 
              src={centerImage || "https://api.dicebear.com/7.x/shapes/svg?seed=placeholder"} 
              alt="Logo Central" 
              className="w-[90%] h-[90%] object-contain rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/shapes/svg?seed=fallback" }}
            />
        </div>
      </div>
    </div>
  );
};
