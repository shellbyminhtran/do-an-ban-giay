import React, { useState, useEffect } from 'react';
import logoOutline from '../assets/Input.png';
import logoSolid from '../assets/Output.png';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  useEffect(() => {
    const startFill = setTimeout(() => setProgress(100), 200);
    const startExit = setTimeout(() => setIsExiting(true), 2700);
    const finishLoading = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(startFill);
      clearTimeout(startExit);
      clearTimeout(finishLoading);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#f8f8f8] transition-opacity duration-[800ms] ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-48 h-24 sm:w-64 sm:h-32">
        <img src={logoOutline} alt="Logo Outline" className="absolute inset-0 w-full h-full object-contain" />
        <div className="absolute top-0 left-0 h-full overflow-hidden transition-all ease-in-out" style={{ width: `${progress}%`, transitionDuration: '2000ms' }}>
          <img src={logoSolid} alt="Logo Solid" className="absolute top-0 left-0 w-48 h-24 sm:w-64 sm:h-32 object-contain max-w-none" />
        </div>
      </div>
    </div>
  );
}