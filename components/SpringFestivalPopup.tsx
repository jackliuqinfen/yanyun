
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion component for TS
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;
const MotionButton = motion.button as any;

const SpringFestivalPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  
  const SESSION_KEY = 'yanyun_horse_year_2026_v14_centered';

  useEffect(() => {
    // Inject Google Font for Calligraphy
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Noto+Serif+SC:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // const hasSeen = sessionStorage.getItem(SESSION_KEY);
    // if (!hasSeen) {
        const timer = setTimeout(() => setIsOpen(true), 1000); 
        return () => clearTimeout(timer);
    // }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // --- Three.js Setup ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    // Deep, dark red night sky for contrast
    scene.fog = new THREE.FogExp2(0x2a0000, 0.001); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
    camera.position.set(0, 0, 600);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    // Use heavy contrast tone mapping for "fireworks" bloom feel
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Assets Generation ---
    const createTexture = (type: 'glow' | 'particle' | 'spark') => {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const cx = 32, cy = 32;
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
            if (type === 'glow') {
                gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
                gradient.addColorStop(0.2, 'rgba(255, 100, 50, 0.6)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
        }
        return new THREE.Texture(canvas);
    };
    
    const glowTex = createTexture('glow');
    glowTex.needsUpdate = true;
    const sparkTex = createTexture('spark');
    sparkTex.needsUpdate = true;


    // --- 1. The "Golden Dragon" Stream (Flowing Particles) ---
    // A spiral stream of particles moving towards camera
    const streamCount = 800;
    const streamGeo = new THREE.BufferGeometry();
    const streamPos = new Float32Array(streamCount * 3);
    const streamOffset = new Float32Array(streamCount);
    
    for(let i=0; i<streamCount; i++) {
        streamOffset[i] = i; // Store index for offset calculation
        // Initial positions will be set in animate
        streamPos[i*3] = 0;
        streamPos[i*3+1] = 0;
        streamPos[i*3+2] = 0;
    }
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    
    const streamMat = new THREE.PointsMaterial({
        color: 0xFFD700,
        size: 4,
        map: sparkTex,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const streamSystem = new THREE.Points(streamGeo, streamMat);
    scene.add(streamSystem);


    // --- 2. Fireworks System ---
    // We simulate fireworks by resetting particles when they "die"
    const fireworkCount = 600;
    const fwGeo = new THREE.BufferGeometry();
    const fwPos = new Float32Array(fireworkCount * 3);
    const fwVel = new Float32Array(fireworkCount * 3);
    const fwLife = new Float32Array(fireworkCount); // 0 to 1
    const fwColor = new Float32Array(fireworkCount * 3); // RGB
    
    const resetFireworkParticle = (i: number, origin: THREE.Vector3, color: THREE.Color) => {
        fwPos[i*3] = origin.x;
        fwPos[i*3+1] = origin.y;
        fwPos[i*3+2] = origin.z;
        
        // Explosion velocity sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = Math.random() * 5 + 2;
        
        fwVel[i*3] = speed * Math.sin(phi) * Math.cos(theta);
        fwVel[i*3+1] = speed * Math.sin(phi) * Math.sin(theta);
        fwVel[i*3+2] = speed * Math.cos(phi);
        
        fwLife[i] = 1.0;
        
        fwColor[i*3] = color.r;
        fwColor[i*3+1] = color.g;
        fwColor[i*3+2] = color.b;
    };

    // Initialize with random bursts
    for(let i=0; i<fireworkCount; i++) {
        resetFireworkParticle(i, new THREE.Vector3(0, -1000, 0), new THREE.Color(0,0,0)); // Start hidden
        fwLife[i] = Math.random(); // Random start times
    }
    
    fwGeo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3));
    fwGeo.setAttribute('color', new THREE.BufferAttribute(fwColor, 3));
    
    const fwMat = new THREE.PointsMaterial({
        size: 6,
        map: glowTex,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const fwSystem = new THREE.Points(fwGeo, fwMat);
    scene.add(fwSystem);


    // --- 3. Background "Red Cloud" Ambience ---
    // Subtle red fog clouds moving slowly
    const cloudCount = 50;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(cloudCount * 3);
    for(let i=0; i<cloudCount; i++) {
        cloudPos[i*3] = (Math.random() - 0.5) * 2000;
        cloudPos[i*3+1] = (Math.random() - 0.5) * 1000;
        cloudPos[i*3+2] = -500 - Math.random() * 500; // Far background
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    const cloudMat = new THREE.PointsMaterial({
        color: 0x8B0000,
        size: 300, // Huge particles
        map: glowTex,
        transparent: true,
        opacity: 0.15,
        blending: THREE.NormalBlending,
        depthWrite: false
    });
    const cloudSystem = new THREE.Points(cloudGeo, cloudMat);
    scene.add(cloudSystem);


    // --- Animation State ---
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    
    // Firework logic state
    let burstTimer = 0;
    const burstInterval = 40; // Frames between bursts
    const colors = [
        new THREE.Color(0xFFD700), // Gold
        new THREE.Color(0xFF4500), // OrangeRed
        new THREE.Color(0xFF0000), // Red
        new THREE.Color(0xFFFFFF), // White Sparkle
    ];

    const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX - width/2) * 0.05;
        mouseY = (e.clientY - height/2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        time += 0.01;

        // 1. Animate Dragon Stream
        // A Lissajous spiral
        const positions = streamGeo.attributes.position;
        for(let i=0; i<streamCount; i++) {
            // Each particle follows a path based on time and its offset
            const t = time * 0.5 + streamOffset[i] * 0.005;
            
            // Spiral shape
            const r = 300 + Math.sin(t * 3) * 50;
            const x = Math.cos(t * 2) * r;
            const y = Math.sin(t * 3) * 150;
            const z = Math.sin(t * 2) * r - 200; // Depth variation

            positions.setXYZ(i, x, y, z);
        }
        positions.needsUpdate = true;
        // Rotate entire stream slowly
        streamSystem.rotation.z = time * 0.1;


        // 2. Animate Fireworks
        burstTimer++;
        if (burstTimer > burstInterval) {
            burstTimer = 0;
            // Trigger a new burst
            // Pick a random chunk of particles to reset
            const particlesPerBurst = 100;
            const startIndex = Math.floor(Math.random() * (fireworkCount - particlesPerBurst));
            const origin = new THREE.Vector3(
                (Math.random() - 0.5) * 1200,
                (Math.random() - 0.5) * 600 + 100,
                (Math.random() - 0.5) * 500 - 200
            );
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            for(let i=0; i<particlesPerBurst; i++) {
                resetFireworkParticle(startIndex + i, origin, color);
            }
        }

        const fwPositions = fwGeo.attributes.position;
        const fwColors = fwGeo.attributes.color;
        
        for(let i=0; i<fireworkCount; i++) {
            if (fwLife[i] > 0) {
                // Move
                fwPositions.setX(i, fwPositions.getX(i) + fwVel[i*3]);
                fwPositions.setY(i, fwPositions.getY(i) + fwVel[i*3+1]);
                fwPositions.setZ(i, fwPositions.getZ(i) + fwVel[i*3+2]);
                
                // Gravity
                fwVel[i*3+1] -= 0.1;
                
                // Drag
                fwVel[i*3] *= 0.98;
                fwVel[i*3+1] *= 0.98;
                fwVel[i*3+2] *= 0.98;
                
                // Fade out
                fwLife[i] -= 0.015;
                
                // Update size/opacity hack via scale (if supported) or just let them die
                // Here we just let them disappear by setting pos to infinity when dead
                if (fwLife[i] <= 0) {
                     fwPositions.setXYZ(i, 0, -5000, 0); // Hide
                }
            }
        }
        fwPositions.needsUpdate = true;


        // 3. Animate Clouds
        cloudSystem.rotation.z = time * 0.01;


        // 4. Camera Parallax
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameIdRef.current);
        if (rendererRef.current) {
            rendererRef.current.dispose();
            containerRef.current?.removeChild(rendererRef.current.domElement);
        }
        streamGeo.dispose(); streamMat.dispose();
        fwGeo.dispose(); fwMat.dispose();
        cloudGeo.dispose(); cloudMat.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center font-sans"
          style={{ 
              // Deep, rich, festive night
              background: 'radial-gradient(circle at center, #550000 0%, #2a0000 40%, #000000 100%)'
          }}
      >
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0" />
        
        {/* Festive Vignette & Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_30%,rgba(0,0,0,0.8)_100%)] z-1" />
        {/* Golden Stardust Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-1 animate-pulse"></div>

        <MotionDiv 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 90, delay: 0.2 }}
            className="relative z-10 w-[90%] max-w-[550px]"
        >
           {/* Glass/Paper Fusion Card */}
           <div className="relative bg-[#fffbf0]/95 backdrop-blur-md rounded-3xl shadow-[0_0_100px_rgba(255,50,0,0.4)] overflow-hidden border border-[#B8860B]/40 ring-1 ring-[#FFD700]/30">
                
                {/* Traditional Border Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                     style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                     }}
                />

                {/* Content Container - "Royal Scroll" Layout */}
                <div className="relative px-6 py-10 md:px-12 md:py-16 flex flex-col items-center text-center">
                    
                    {/* Ornamental Frame Border */}
                    <div className="absolute inset-4 border-[3px] border-double border-[#B8860B]/30 rounded-2xl pointer-events-none"></div>
                    <div className="absolute inset-4 border border-[#B8860B]/10 rounded-2xl pointer-events-none transform scale-[0.98]"></div>

                    {/* Top Center: The Imperial Seal "Fu" */}
                    <MotionDiv 
                        initial={{ opacity: 0, scale: 0, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="relative z-20 -mt-6 mb-6"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#8B0000] text-[#FFD700] rounded-xl flex items-center justify-center shadow-lg border-2 border-[#FFD700] rotate-45 transform hover:rotate-0 transition-transform duration-500">
                            <span className="text-3xl md:text-4xl font-bold -rotate-45" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
                                福
                            </span>
                        </div>
                        {/* Tassel Effect (Simulated) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-12 bg-gradient-to-b from-[#FFD700] to-transparent opacity-60"></div>
                    </MotionDiv>

                    {/* Main Title Block */}
                    <div className="relative mb-8 z-10 w-full px-8 md:px-16 flex flex-col items-center">
                        
                        {/* Main Title - "Golden Horse Announces Good News" */}
                        <div className="relative inline-block">
                            {/* Animated Glow Behind Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-500/10 blur-xl rounded-full animate-pulse"></div>
                            
                            <MotionH1 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6, type: 'spring', bounce: 0.4 }}
                                className="relative text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#d9ad26] to-[#8B0000] leading-tight tracking-tight drop-shadow-sm py-2 whitespace-nowrap"
                                style={{ 
                                    fontFamily: '"Ma Shan Zheng", cursive',
                                    textShadow: '0 2px 0 rgba(139,0,0,0.1)'
                                }}
                            >
                                金马报喜
                            </MotionH1>
                        </div>
                        
                        {/* Greeting Line - "Red Ribbon" Style */}
                        <MotionDiv 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="mt-4 inline-block relative"
                        >
                             <div className="absolute inset-0 bg-[#8B0000] transform -skew-x-12 rounded-sm shadow-sm opacity-10"></div>
                             <p className="relative px-6 py-1 text-[#8B0000] font-bold text-sm md:text-base tracking-widest"
                                style={{ fontFamily: '"Noto Serif SC", serif' }}>
                                 盐韵工程项目管理给您拜年啦！
                             </p>
                        </MotionDiv>
                    </div>

                    {/* Poetic Message - Elegant & Clean */}
                    <MotionP 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-[#4a3a3a] text-base md:text-lg font-medium leading-relaxed mb-8 px-4 relative max-w-md mx-auto"
                        style={{ fontFamily: '"Noto Serif SC", serif' }}
                    >
                        2026，让我们以
                        <span className="text-[#c0392b] font-black text-xl md:text-2xl mx-1 italic" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>“马”不停蹄</span>
                        的进取之心，<br/>
                        共筑每一个精品工程。
                    </MotionP>

                    {/* Mobile Only: Horizontal Couplets (Vertical ones hidden on mobile) */}
                    <div className="md:hidden flex flex-col gap-2 w-full mb-6 px-4 items-center">
                        <div className="bg-[#8B0000] text-[#FFD700] py-2 px-3 rounded text-sm font-bold shadow-sm border border-[#B8860B]">
                            盐立基石 · 筑造稳健未来
                        </div>
                        <div className="bg-[#8B0000] text-[#FFD700] py-2 px-3 rounded text-sm font-bold shadow-sm border border-[#B8860B]">
                            韵传匠心 · 成就卓越管理
                        </div>
                    </div>

                    {/* Footer Group */}
                    <div className="relative w-full flex flex-col items-center">
                        <MotionP 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 }}
                            className="text-[#B8860B] text-lg md:text-xl font-bold mb-6 flex items-center gap-2" 
                            style={{ fontFamily: '"Ma Shan Zheng", cursive' }}
                        >
                            <span className="h-[1px] w-8 bg-[#B8860B]/50"></span>
                            祝您：马到成功，万事胜意！
                            <span className="h-[1px] w-8 bg-[#B8860B]/50"></span>
                        </MotionP>

                        <MotionButton
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 215, 0, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClose}
                            className="group relative px-12 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#8B0000] rounded-full text-xl font-bold shadow-lg overflow-hidden border border-[#fff]/50"
                            style={{ fontFamily: '"Ma Shan Zheng", cursive' }}
                        >
                            <span className="relative z-10 flex items-center gap-3 tracking-widest">
                                开启鸿运 <ChevronRight size={22} strokeWidth={3} />
                            </span>
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </MotionButton>
                    </div>

                    {/* Close Button - Top Right, Subtle */}
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-[#8B0000]/30 hover:text-[#8B0000] hover:bg-[#8B0000]/5 rounded-full transition-all duration-300 z-50"
                        aria-label="关闭"
                    >
                        <X size={22} />
                    </button>
                </div>
           </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default SpringFestivalPopup;
