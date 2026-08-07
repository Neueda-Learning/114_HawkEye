import { useState, useEffect } from 'react';

interface CyberEyeProps {
  onAnimationComplete?: () => void;
  onStageChange?: (stage: 'focused' | 'scanning' | 'verified' | 'zoomed-out') => void;
  initialStage?: 'focused' | 'scanning' | 'verified' | 'zoomed-out';
  variant?: 'intro' | 'header';
}

export default function CyberEye({
  onAnimationComplete,
  onStageChange,
  initialStage = 'scanning',
  variant = 'intro'
}: CyberEyeProps) {
  const [animStage, setAnimStage] = useState<'focused' | 'scanning' | 'verified' | 'zoomed-out'>(
    variant === 'intro' ? 'scanning' : initialStage
  );
  const [showFlash, setShowFlash] = useState(false);
  const [irisPos, setIrisPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (initialStage === 'zoomed-out' || variant === 'header') {
      setAnimStage('zoomed-out');
      return;
    }

    if (onStageChange) onStageChange('scanning');

    // 1. Slow, realistic 3.0s scan completes in center at 3.0s -> Eye & Background turn GREEN!
    const t1 = setTimeout(() => {
      setAnimStage('verified');
      if (onStageChange) onStageChange('verified');
    }, 3000);

    // 2. 150ms AFTER turning green -> throw circular expanding light wave outwards!
    const t2_flash = setTimeout(() => setShowFlash(true), 3150);

    // 3. Complete handover to login page at 4.0s!
    const t3 = setTimeout(() => {
      setAnimStage('zoomed-out');
      if (onAnimationComplete) onAnimationComplete();
    }, 4000);

    return () => { clearTimeout(t1); clearTimeout(t2_flash); clearTimeout(t3); };
  }, [onAnimationComplete, onStageChange, initialStage, variant]);

  // Real-Time Mouse Tracking when in 'zoomed-out' stage
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (animStage !== 'zoomed-out') return;
      const el = document.getElementById(variant === 'header' ? 'cyber-eye-header' : 'cyber-eye-socket');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const maxDist = variant === 'header' ? 36 : 28;
      const dist = Math.min(maxDist, Math.hypot(e.clientX - cx, e.clientY - cy) / 7);
      setIrisPos({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animStage, variant]);

  const isGreen = animStage === 'verified' || animStage === 'zoomed-out';
  const isRed   = variant === 'intro' && !isGreen;

  const col    = isGreen ? '#00ff88' : isRed ? '#ff3b3b' : '#00d2ff';
  const colDim = isGreen ? 'rgba(0,255,136,' : isRed ? 'rgba(255,59,59,' : 'rgba(0,210,255,';

  // SVG viewBox: 400 x 260, eye tips at (10,130) and (390,130)
  const almondPath      = 'M 10,130 Q 200,-20 390,130 Q 200,280 10,130 Z';
  const almondPathInner = 'M 32,130 Q 200,6  368,130 Q 200,254 32,130 Z';

  const containerId = variant === 'header' ? 'cyber-eye-header' : 'cyber-eye-socket';

  return (
    <div id={containerId} className={`hw-eye-container ${variant === 'header' ? 'hw-eye-header-scale' : ''}`}>
      {/* Outer HUD ring — rotating dashed ellipse */}
      <div className={`hw-eye-ring-outer ${isGreen ? 'hw-ring-green' : isRed ? 'hw-ring-red' : 'hw-ring-cyan'}`} />
      {/* Inner radar sweep ring */}
      <div className={`hw-eye-ring-inner ${isGreen ? 'hw-radar-green' : isRed ? 'hw-radar-red' : 'hw-radar-cyan'}`} />

      {/* Expanding Circular Light Wave & Screen Flash Pulse AFTER turning green */}
      {showFlash && (
        <>
          <div className="hw-eye-flash-circle" />
          <div className="hw-screen-flash-overlay" />
        </>
      )}

      <svg
        viewBox="0 0 400 260"
        className="hw-eye-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`hwAlmondClip_${variant}`}>
            <path d={almondPath} />
          </clipPath>

          <filter id={`hwBorderGlow_${variant}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <radialGradient id={`hwSclera_${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={isRed ? 'rgba(255,200,200,0.18)' : 'rgba(255,245,235,0.18)'}/>
            <stop offset="60%"  stopColor={isRed ? 'rgba(140,20,40,0.15)' : 'rgba(0,80,140,0.06)'}/>
            <stop offset="100%" stopColor={isRed ? 'rgba(30,5,10,0.8)' : 'rgba(0,10,30,0.6)'}/>
          </radialGradient>

          <radialGradient id={`hwIrisRed_${variant}`} cx="42%" cy="36%" r="58%">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="8%"   stopColor="#ff9999"/>
            <stop offset="28%"  stopColor="#ff3b3b"/>
            <stop offset="62%"  stopColor="#a80015"/>
            <stop offset="90%"  stopColor="#420009"/>
            <stop offset="100%" stopColor="#200004"/>
          </radialGradient>

          <radialGradient id={`hwIrisCyan_${variant}`} cx="42%" cy="36%" r="58%">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="8%"   stopColor="#80ffff"/>
            <stop offset="28%"  stopColor="#00d0ff"/>
            <stop offset="62%"  stopColor="#0044cc"/>
            <stop offset="90%"  stopColor="#001840"/>
            <stop offset="100%" stopColor="#000c20"/>
          </radialGradient>

          <radialGradient id={`hwIrisGreen_${variant}`} cx="42%" cy="36%" r="58%">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="8%"   stopColor="#b0ffcc"/>
            <stop offset="28%"  stopColor="#00ff88"/>
            <stop offset="62%"  stopColor="#008844"/>
            <stop offset="90%"  stopColor="#002218"/>
            <stop offset="100%" stopColor="#000f08"/>
          </radialGradient>

          <radialGradient id={`hwPupil_${variant}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#000000"/>
          </radialGradient>

          <linearGradient id={`hwScanLine_${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="30%"  stopColor={col} stopOpacity="0.7"/>
            <stop offset="70%"  stopColor={col} stopOpacity="0.7"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>

        {/* Sclera background */}
        <path d={almondPath} fill={`url(#hwSclera_${variant})`} />

        {/* Iris elements clipped inside almond */}
        <g clipPath={`url(#hwAlmondClip_${variant})`}>
          <g
            className={animStage === 'scanning' ? 'hw-iris-scan' : ''}
            style={{ transformBox: 'fill-box', transformOrigin: '200px 130px' }}
          >
            <g style={{
              transform: animStage === 'zoomed-out'
                ? `translate3d(${irisPos.x}px, ${irisPos.y}px, 0)` : 'none',
              transition: 'transform 0.08s linear',
            }}>
              <circle cx="200" cy="130" r="76" fill="rgba(255,250,240,0.10)" />

              <circle cx="200" cy="130" r="68"
                fill={isGreen ? 'rgba(0,255,136,0.18)' : isRed ? 'rgba(255,59,59,0.2)' : 'rgba(0,180,255,0.18)'}
              />

              <circle
                cx="200" cy="130" r="60"
                fill={isGreen ? `url(#hwIrisGreen_${variant})` : isRed ? `url(#hwIrisRed_${variant})` : `url(#hwIrisCyan_${variant})`}
              />

              <circle cx="200" cy="130" r="60" fill="none"
                stroke="rgba(255,255,255,0.09)" strokeWidth="12"/>
              <circle cx="200" cy="130" r="47" fill="none"
                stroke={colDim + '0.25)'} strokeWidth="2.5"/>
              <circle cx="200" cy="130" r="35" fill="none"
                stroke={colDim + '0.15)'} strokeWidth="1.5"/>

              <circle cx="200" cy="130" r="59" fill="none"
                stroke="rgba(0,0,0,0.6)" strokeWidth="5"/>

              <circle cx="200" cy="130" r="22" fill={`url(#hwPupil_${variant})`}/>
              <circle cx="200" cy="130" r="21.5" fill="none"
                stroke={colDim + '0.4)'} strokeWidth="1.5"/>

              <ellipse cx="212" cy="115" rx="9" ry="7" fill="white" opacity="0.88"/>
              <circle cx="190" cy="142" r="3.5" fill="white" opacity="0.35"/>
              <circle cx="218" cy="122" r="2" fill="white" opacity="0.6"/>
            </g>
          </g>

          <rect x="10" y="128" width="380" height="4" rx="2"
            fill={`url(#hwScanLine_${variant})`} opacity="0.6"
          />
        </g>

        {/* Eye outline */}
        <path
          d={almondPath}
          fill="none"
          stroke={col}
          strokeWidth="3"
          filter={`url(#hwBorderGlow_${variant})`}
          className="hw-border-transition"
        />

        <path d={almondPathInner} fill="none"
          stroke={colDim + '0.28)'} strokeWidth="1" strokeDasharray="8 6"
        />

        {/* HUD Corner Ticks */}
        <line x1="10"  y1="130" x2="34"  y2="120" stroke={col} strokeWidth="2.5" opacity="0.9"/>
        <line x1="10"  y1="130" x2="34"  y2="140" stroke={col} strokeWidth="2.5" opacity="0.9"/>
        <line x1="390" y1="130" x2="366" y2="120" stroke={col} strokeWidth="2.5" opacity="0.9"/>
        <line x1="390" y1="130" x2="366" y2="140" stroke={col} strokeWidth="2.5" opacity="0.9"/>
        <line x1="196" y1="-18" x2="204" y2="-18" stroke={col} strokeWidth="2" opacity="0.7"/>
        <line x1="196" y1="278" x2="204" y2="278" stroke={col} strokeWidth="2" opacity="0.7"/>
      </svg>
    </div>
  );
}
