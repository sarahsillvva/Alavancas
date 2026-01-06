
import React, { useRef, useState, useEffect } from 'react';
import { hslToHex } from '../constants';

interface Props {
  color: string;
  onChange: (hex: string) => void;
}

const ColorPickerWheel: React.FC<Props> = ({ color, onChange }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [handlePos, setHandlePos] = useState({ x: 50, y: 0 }); // Posição em porcentagem relativa ao centro

  const updateColor = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calcula o ângulo em radianos e converte para graus
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);
    
    /**
     * CORREÇÃO MATEMÁTICA:
     * Math.atan2 começa em 0° no lado direito (3h).
     * conic-gradient começa em 0° no topo (12h).
     * Adicionamos 90° para alinhar o HSL (0 = Vermelho) com o topo do círculo.
     */
    const hue = (angleDeg + 90 + 360) % 360;
    
    // Atualiza a posição visual do "alvo" (alinhado à borda do círculo)
    const posX = Math.cos(angleRad) * 50; // 50% do raio para ficar na borda interna
    const posY = Math.sin(angleRad) * 50;
    setHandlePos({ x: posX, y: posY });

    const hex = hslToHex(hue, 80, 50);
    onChange(hex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    updateColor(e.clientX, e.clientY);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateColor(moveEvent.clientX, moveEvent.clientY);
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    updateColor(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Evita scroll da página enquanto ajusta a cor
    if (e.cancelable) e.preventDefault();
    updateColor(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div 
        ref={wheelRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="relative w-40 h-40 rounded-full cursor-crosshair shadow-lg border-8 border-white dark:border-slate-800 transition-transform active:scale-[0.98] touch-none"
        style={{
          background: 'conic-gradient(red, #ff0, #0f0, #0ff, #00f, #f0f, red)'
        }}
      >
        {/* Indicador de Seleção (Handle) */}
        <div 
          className="absolute w-6 h-6 bg-white border-2 border-slate-900 rounded-full shadow-md pointer-events-none z-10 transition-colors"
          style={{
            left: `calc(50% + ${handlePos.x}% - 12px)`,
            top: `calc(50% + ${handlePos.y}% - 12px)`,
            backgroundColor: color
          }}
        />

        {/* Centro do círculo (Preview) */}
        <div className="absolute inset-0 m-auto w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-inner flex items-center justify-center border-2 border-slate-100 dark:border-slate-800">
           <div 
            className="w-8 h-8 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          />
        </div>
        
        {/* Overlay de Brilho */}
        <div className="absolute inset-0 rounded-full bg-white/5 pointer-events-none ring-1 ring-black/10" />
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Deslize para selecionar
        </span>
        <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 uppercase">
          {color}
        </span>
      </div>
    </div>
  );
};

export default ColorPickerWheel;
