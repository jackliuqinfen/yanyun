
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Gift, Award } from 'lucide-react';
import { storageService } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion component for TS
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionH2 = motion.h2 as any; 
const MotionP = motion.p as any;
const MotionButton = motion.button as any;

const AnniversaryPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(storageService.getSettingsSync());
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Unique session key to ensure it only shows once per session unless settings change
  const SESSION_KEY = 'yanyun_anniversary_v9_final';

  useEffect(() => {
    // 1. Check Global Settings from Storage
    const currentSettings = storageService.getSettingsSync();
    setSettings(currentSettings); 
    const hasSeen = sessionStorage.getItem(SESSION_KEY);
    
    if (currentSettings.enableAnniversary && !hasSeen) {
       const timer = setTimeout(() => setIsOpen(true), 1200); 
       return () => clearTimeout(timer);
    }

    const handleSettingsChange = () => {
       const newSettings = storageService.getSettingsSync();
       setSettings(newSettings);
       if (newSettings.enableAnniversary) {
          sessionStorage.removeItem(SESSION_KEY);
          setIsOpen(true);
       } else {
          setIsOpen(false);
       }
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // --- Three.js Setup ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particlesData: any[] = [];
    let particleSystem: THREE.Points | THREE.Mesh;
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // --- Helper Textures ---
    const getGlowTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
        }
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    };

    // --- Template Logic ---
    const template = settings.anniversaryTemplate || 'fireworks';

    if (template === 'fireworks') {
        // --- FIREWORKS SETUP ---
        const particleCount = 2000;
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const colorPalette = [
            new THREE.Color(0xFF0040), new THREE.Color(0xFFFF00), new THREE.Color(0x00FF00),
            new THREE.Color(0x00FFFF), new THREE.Color(0x8000FF), new THREE.Color(0xFF8000),
        ];

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        material = new THREE.PointsMaterial({
            size: 3, map: getGlowTexture(), vertexColors: true, blending: THREE.AdditiveBlending,
            depthWrite: false, transparent: true, opacity: 0.9
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Init Data
        for (let i = 0; i < particleCount; i++) {
            particlesData.push({
                x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, type: 0,
                color: new THREE.Color(), targetColor: new THREE.Color()
            });
        }

        // Logic Functions
        const explode = (originX: number, originY: number, originZ: number, color: THREE.Color) => {
            const explosionSize = 60 + Math.random() * 40;
            let count = 0;
            for(let i=0; i<particleCount; i++) {
                if (particlesData[i].type === 0) {
                    const p = particlesData[i];
                    p.type = 2; p.x = originX; p.y = originY; p.z = originZ;
                    p.life = 1.0; p.color.copy(color);
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;
                    const speed = 0.5 + Math.random() * 1.5;
                    p.vx = speed * Math.sin(phi) * Math.cos(theta);
                    p.vy = speed * Math.sin(phi) * Math.sin(theta);
                    p.vz = speed * Math.cos(phi);
                    count++;
                    if (count >= explosionSize) break;
                }
            }
        };

        const launchRocket = () => {
            for(let i=0; i<particleCount; i++) {
                if (particlesData[i].type === 0) {
                    const p = particlesData[i];
                    p.type = 1; p.x = (Math.random() - 0.5) * 100; p.y = -60; p.z = (Math.random() - 0.5) * 50;
                    p.vx = (Math.random() - 0.5) * 0.2; p.vy = 2.5 + Math.random() * 1.0; p.vz = (Math.random() - 0.5) * 0.2;
                    p.life = 1.0; p.targetColor.copy(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
                    p.color.setHex(0xffffe0);
                    break;
                }
            }
        };

        const animateFireworks = () => {
            if(Math.random() < 0.03) launchRocket();
            const positionsAttr = geometry.attributes.position;
            const colorsAttr = geometry.attributes.color;
            const sizesAttr = geometry.attributes.size;

            for(let i=0; i<particleCount; i++) {
                const p = particlesData[i];
                if (p.type === 1) { // Rocket
                    p.vy -= 0.04; p.x += p.vx; p.y += p.vy; p.z += p.vz;
                    positionsAttr.setXYZ(i, p.x, p.y, p.z);
                    colorsAttr.setXYZ(i, p.color.r, p.color.g, p.color.b);
                    sizesAttr.setX(i, 4);
                    if (p.vy <= 0.2) {
                        p.type = 0; sizesAttr.setX(i, 0);
                        explode(p.x, p.y, p.z, p.targetColor);
                    }
                } else if (p.type === 2) { // Spark
                    if (p.life > 0) {
                        p.life -= 0.015; p.vy -= 0.03; p.vx *= 0.98; p.vz *= 0.98;
                        p.x += p.vx; p.y += p.vy; p.z += p.vz;
                        positionsAttr.setXYZ(i, p.x, p.y, p.z);
                        colorsAttr.setXYZ(i, p.color.r, p.color.g, p.color.b);
                        sizesAttr.setX(i, p.life * 4);
                    } else {
                        p.type = 0; sizesAttr.setX(i, 0);
                        positionsAttr.setXYZ(i, 0, -1000, 0);
                    }
                }
            }
            positionsAttr.needsUpdate = true;
            colorsAttr.needsUpdate = true;
            sizesAttr.needsUpdate = true;
        };
        
        // Loop hook
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            animateFireworks();
            scene.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();

    } else if (template === 'gold-rain') {
        // --- GOLD RAIN SETUP (Winning Bid) ---
        const particleCount = 1000;
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities: any[] = []; // Store custom velocity
        
        for(let i=0; i<particleCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 200; // x
            positions[i*3+1] = Math.random() * 200 - 100; // y
            positions[i*3+2] = (Math.random() - 0.5) * 100; // z
            velocities.push({
                y: -(Math.random() * 0.5 + 0.2), // Fall speed
                x: (Math.random() - 0.5) * 0.1, // Drift
                rot: Math.random() * 0.1
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        material = new THREE.PointsMaterial({
            color: 0xFFD700, // Gold
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            map: getGlowTexture()
        });
        
        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        const animateGold = () => {
            const positionsAttr = geometry.attributes.position;
            for(let i=0; i<particleCount; i++) {
                let y = positionsAttr.getY(i);
                let x = positionsAttr.getX(i);
                
                y += velocities[i].y;
                x += velocities[i].x;

                if(y < -100) {
                    y = 100;
                    x = (Math.random() - 0.5) * 200;
                }
                
                positionsAttr.setY(i, y);
                positionsAttr.setX(i, x);
            }
            positionsAttr.needsUpdate = true;
        };

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            animateGold();
            // Sway camera slightly
            camera.position.x = Math.sin(Date.now() * 0.0005) * 10;
            renderer.render(scene, camera);
        };
        animate();

    } else if (template === 'confetti') {
        // --- CONFETTI SETUP ---
        const particleCount = 800;
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const rotations: any[] = []; 
        
        const confettiColors = [
            new THREE.Color(0xFF4081), // Pink
            new THREE.Color(0x448AFF), // Blue
            new THREE.Color(0x69F0AE), // Green
            new THREE.Color(0xFFD740), // Yellow
        ];

        for(let i=0; i<particleCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 150;
            positions[i*3+1] = Math.random() * 200 - 50;
            positions[i*3+2] = (Math.random() - 0.5) * 80;
            
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            colors[i*3] = color.r; colors[i*3+1] = color.g; colors[i*3+2] = color.b;

            rotations.push({
                speed: Math.random() * 0.02 + 0.01,
                axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
                vy: -(Math.random() * 0.3 + 0.1)
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Use rectangular texture or just points for simplicity in this context
        // Ideally we'd use InstancedMesh for true rotating squares, but Points with size variation works for "distant confetti"
        material = new THREE.PointsMaterial({
            size: 2.5,
            vertexColors: true,
            opacity: 0.9,
            transparent: true
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        const animateConfetti = () => {
            const positionsAttr = geometry.attributes.position;
            for(let i=0; i<particleCount; i++) {
                let y = positionsAttr.getY(i);
                let x = positionsAttr.getX(i);
                
                y += rotations[i].vy;
                x += Math.sin(Date.now() * 0.001 + i) * 0.1; // Sway

                if(y < -100) {
                    y = 100;
                    x = (Math.random() - 0.5) * 150;
                }
                
                positionsAttr.setY(i, y);
                positionsAttr.setX(i, x);
            }
            positionsAttr.needsUpdate = true;
        };

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            animateConfetti();
            scene.rotation.y += 0.002;
            renderer.render(scene, camera);
        };
        animate();
    }

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameIdRef.current);
        if (rendererRef.current) {
            rendererRef.current.dispose();
            containerRef.current?.removeChild(rendererRef.current.domElement);
        }
        if (geometry) geometry.dispose();
        if (material) material.dispose();
    };
  }, [isOpen, settings.anniversaryTemplate]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center font-sans"
          style={{ background: 'radial-gradient(circle at center, #1a0505 0%, #000000 100%)' }}
      >
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0" />
        
        <MotionDiv 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.1 }}
            className="relative z-10 w-[92%] max-w-[480px]"
        >
           {/* Glassmorphism Card */}
           <div className="absolute inset-0 bg-red-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_-20px_rgba(220,38,38,0.5)]"></div>
           
           {/* Decorative Elements */}
           <div className="absolute inset-4 border border-yellow-500/20 rounded-[2rem] pointer-events-none"></div>

           <div className="relative p-12 text-center flex flex-col items-center">
                {/* FULL COMPANY NAME */}
                <MotionH2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 text-lg md:text-xl font-bold tracking-[0.1em] mb-4 drop-shadow-lg"
                >
                    江苏盐韵工程项目管理有限公司
                </MotionH2>

                {/* Badge */}
                <MotionDiv 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/50 border border-yellow-500/30 mb-8"
                >
                    <Award size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-black text-yellow-100 tracking-widest uppercase">Eight Year Anniversary</span>
                </MotionDiv>

                {/* Big Number and Overlapping Fix */}
                <div className="relative mb-8 w-full flex justify-center">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse"></div>
                    <MotionH1 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.5 }}
                        className="text-[160px] leading-none font-serif font-medium relative z-10"
                        style={{ 
                            background: 'linear-gradient(180deg, #FFF8E7 0%, #FFD700 45%, #E6B800 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 15px 40px rgba(255, 215, 0, 0.3))'
                        }}
                    >
                        8
                    </MotionH1>
                    
                    {/* Fixed Position: Moved much tighter to the bottom-right of the 8 */}
                    <MotionDiv 
                        initial={{ opacity: 0, rotate: 10, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: -5, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="absolute bottom-2 -right-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black px-4 py-2 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.3)] border border-red-400/50 transform translate-x-1/2 z-20 whitespace-nowrap"
                    >
                        周年庆典 🎉
                    </MotionDiv>
                </div>

                {/* Slogan */}
                <div className="space-y-4 mb-12">
                    <MotionH1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-3xl md:text-4xl font-serif font-bold text-white tracking-[0.15em]"
                    >
                        {settings.anniversaryTitle || '"盐"续匠心，"韵"致八载'}
                    </MotionH1>
                    
                    <MotionP 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-sm text-yellow-100/50 font-light tracking-[0.2em]"
                    >
                        {settings.anniversarySubtitle || '感恩一路同行，共鉴品质工程'}
                    </MotionP>
                </div>

                {/* CTA Button */}
                <MotionButton
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="relative w-full py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 text-white rounded-2xl font-black tracking-[0.3em] text-sm shadow-2xl shadow-yellow-900/50 flex items-center justify-center gap-3 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Gift size={18} /> 开启盐韵新篇
                </MotionButton>

                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
           </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default AnniversaryPopup;
