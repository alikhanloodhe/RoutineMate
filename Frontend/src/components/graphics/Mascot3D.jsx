/**
 * Mascot3D.jsx
 * 
 * Cute 3D Productivity Robot Mascot using Three.js
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const Mascot3D = ({
    size = 100,
    position = 'bottom-right',
    onCelebrate = null
}) => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const animationFrameRef = useRef(null);
    const robotRef = useRef(null);
    const leftEyeRef = useRef(null);
    const rightEyeRef = useRef(null);
    const celebratingRef = useRef(false);
    const celebrationTimeoutRef = useRef(null);

    const [isHovered, setIsHovered] = useState(false);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const hasMovedRef = useRef(false); // Track if actual dragging occurred

    // Load saved position from localStorage or use default
    const getInitialPosition = () => {
        const saved = localStorage.getItem('mascotPosition');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default positions based on position prop
        const defaults = {
            'bottom-right': { x: window.innerWidth - size - 16, y: window.innerHeight - size - 16 },
            'bottom-left': { x: 16, y: window.innerHeight - size - 16 },
            'top-right': { x: window.innerWidth - size - 16, y: 80 },
            'top-left': { x: 16, y: 80 }
        };
        return defaults[position] || defaults['bottom-right'];
    };

    const [mascotPosition, setMascotPosition] = useState(getInitialPosition);

    // Sync state to ref
    useEffect(() => {
        celebratingRef.current = isCelebrating;
    }, [isCelebrating]);

    // Celebration trigger
    const triggerCelebration = useCallback((e) => {
        if (celebratingRef.current) return;
        setIsCelebrating(true);
        celebratingRef.current = true;

        if (celebrationTimeoutRef.current) {
            clearTimeout(celebrationTimeoutRef.current);
        }

        celebrationTimeoutRef.current = setTimeout(() => {
            setIsCelebrating(false);
            celebratingRef.current = false;
        }, 1500);

        if (onCelebrate) onCelebrate();
    }, [onCelebrate]);

    // Drag handlers
    const handleMouseDown = useCallback((e) => {
        if (isCelebrating) return; // Don't drag during celebration
        e.preventDefault();
        setIsDragging(true);
        hasMovedRef.current = false; // Reset movement flag

        // Calculate offset between mouse position and mascot position
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, [isCelebrating]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        hasMovedRef.current = true; // Mark that movement occurred

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep mascot within viewport bounds
        const maxX = window.innerWidth - size;
        const maxY = window.innerHeight - size;

        setMascotPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset, size]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            // Save position to localStorage only if actually moved
            if (hasMovedRef.current) {
                localStorage.setItem('mascotPosition', JSON.stringify(mascotPosition));
            }
        }
    }, [isDragging, mascotPosition]);

    // Add/remove global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Setup Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.z = 4;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(2, 3, 4);
        scene.add(dirLight);

        // Robot Group
        const robot = new THREE.Group();

        // Colors
        const primaryColor = 0x6366f1; // Indigo
        const secondaryColor = 0x8b5cf6; // Purple
        const white = 0xffffff;
        const dark = 0x1e1b4b;

        // Head (cute rounded cube look)
        const headGeo = new THREE.BoxGeometry(1.4, 1.2, 1.2);
        headGeo.translate(0, 0.1, 0);
        const headMat = new THREE.MeshPhongMaterial({
            color: primaryColor,
            shininess: 80,
            flatShading: false
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.2;
        robot.add(head);

        // Face screen (dark rectangle)
        const screenGeo = new THREE.PlaneGeometry(1.1, 0.7);
        const screenMat = new THREE.MeshBasicMaterial({ color: dark });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 0.25, 0.61);
        robot.add(screen);

        // Eyes (bright circles)
        const eyeGeo = new THREE.CircleGeometry(0.12, 32);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee }); // Cyan

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.25, 0.3, 0.62);
        robot.add(leftEye);
        leftEyeRef.current = leftEye;

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.25, 0.3, 0.62);
        robot.add(rightEye);
        rightEyeRef.current = rightEye;

        // Happy mouth (arc)
        const mouthShape = new THREE.Shape();
        mouthShape.absarc(0, 0, 0.15, 0, Math.PI, false);
        const mouthGeo = new THREE.ShapeGeometry(mouthShape);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 0.05, 0.62);
        robot.add(mouth);

        // Antenna
        const antennaGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);
        const antennaMat = new THREE.MeshPhongMaterial({ color: secondaryColor });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(0, 1, 0);
        robot.add(antenna);

        // Antenna tip (glowing ball)
        const tipGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 }); // Yellow
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(0, 1.25, 0);
        robot.add(tip);

        // Body
        const bodyGeo = new THREE.BoxGeometry(1.0, 0.6, 0.8);
        const bodyMat = new THREE.MeshPhongMaterial({ color: primaryColor, shininess: 80 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = -0.6;
        robot.add(body);

        // Arms
        const armGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
        const armMat = new THREE.MeshPhongMaterial({ color: secondaryColor });

        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.7, -0.5, 0);
        leftArm.rotation.z = 0.3;
        robot.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.7, -0.5, 0);
        rightArm.rotation.z = -0.3;
        robot.add(rightArm);

        robot.scale.set(0.7, 0.7, 0.7);
        scene.add(robot);
        robotRef.current = robot;

        // Animation
        let time = 0;

        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            time += 0.03;

            if (robotRef.current) {
                if (celebratingRef.current) {
                    // Celebration: gentle bounce and happy wiggle
                    robotRef.current.position.y = Math.sin(time * 8) * 0.15;
                    robotRef.current.rotation.z = Math.sin(time * 6) * 0.1;
                    robotRef.current.rotation.y = 0;

                    // Eyes become hearts or bigger
                    if (leftEyeRef.current && rightEyeRef.current) {
                        const scale = 1.3 + Math.sin(time * 10) * 0.2;
                        leftEyeRef.current.scale.set(scale, scale, 1);
                        rightEyeRef.current.scale.set(scale, scale, 1);
                    }
                } else {
                    // Idle: gentle floating
                    robotRef.current.position.y = Math.sin(time * 2) * 0.05;
                    robotRef.current.rotation.z = 0;
                    robotRef.current.rotation.y = Math.sin(time) * 0.1;

                    // Normal eyes
                    if (leftEyeRef.current && rightEyeRef.current) {
                        leftEyeRef.current.scale.set(1, 1, 1);
                        rightEyeRef.current.scale.set(1, 1, 1);
                    }
                }

                // Antenna tip glow pulse
                tip.material.color.setHSL(0.12, 1, 0.5 + Math.sin(time * 4) * 0.2);
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
            if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
                container.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
        };
    }, [size]);

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-20 right-4',
        'top-left': 'top-20 left-4'
    };

    const handleClick = (e) => {
        // Only trigger celebration if we didn't actually drag (no movement occurred)
        if (!hasMovedRef.current) {
            triggerCelebration(e);
        }
    };

    return (
        <div
            className={`fixed z-50 transition-transform duration-200 ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-110'
                }`}
            style={{
                width: size,
                height: size,
                left: `${mascotPosition.x}px`,
                top: `${mascotPosition.y}px`,
                userSelect: 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            title={isDragging ? "Dragging..." : "Drag to move or click to celebrate!"}
        >
            <div
                ref={containerRef}
                className="w-full h-full pointer-events-none"
                style={{
                    filter: isHovered ? 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.6))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                }}
            />

            {/* Simple celebration sparkles */}
            {isCelebrating && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute sm:text-lg text-sm animate-bounce"
                            style={{
                                left: `${20 + (i % 3) * 30}%`,
                                top: `${i < 3 ? -30 : 100}%`,
                                animationDelay: `${i * 0.1}s`,
                                transform: `rotate(${i * 60}deg)`
                            }}
                        >
                            ✨
                        </div>
                    ))}
                </div>
            )}

            {/* Tooltip */}
            {isHovered && !isCelebrating && !isDragging && (
                <div className="hidden sm:block absolute -top-10 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    Drag to move • Click to celebrate!
                </div>
            )}
        </div>
    );
};

export default Mascot3D;
