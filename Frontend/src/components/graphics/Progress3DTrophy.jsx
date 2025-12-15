/**
 * Progress3DTrophy.jsx
 * 
 * Beautiful 3D Progress Trophy Visualization using Three.js
 * 
 * HCI & Computer Graphics Concepts Covered:
 * - 7. 3D graphics and rendering
 * - 9. Lighting and shading techniques (Phong, multiple lights)
 * - 10. Rendering algorithms (WebGL, particle systems)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const Progress3DTrophy = ({
    routineProgress = 0,
    taskProgress = 0,
    habitProgress = 0,
    goalProgress = 0
}) => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        return Math.round((routineProgress + taskProgress + habitProgress + goalProgress) / 4);
    }, [routineProgress, taskProgress, habitProgress, goalProgress]);

    // Get color based on progress
    const getProgressColor = (progress) => {
        if (progress >= 80) return 0x22c55e;
        if (progress >= 60) return 0x84cc16;
        if (progress >= 40) return 0xeab308;
        if (progress >= 20) return 0xf97316;
        return 0xef4444;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // === SCENE ===
        const scene = new THREE.Scene();

        // === CAMERA ===
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0.5, 5.5);
        camera.lookAt(0, 0.3, 0);

        // === RENDERER ===
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // === ENHANCED LIGHTING (Concept 9: Lighting Techniques) ===
        // Ambient fill light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Main key light (warm directional)
        const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        mainLight.position.set(5, 10, 8);
        mainLight.castShadow = true;
        scene.add(mainLight);

        // Blue accent light (cool fill)
        const blueLight = new THREE.PointLight(0x6366f1, 1.2, 20);
        blueLight.position.set(-5, 4, 4);
        scene.add(blueLight);

        // Purple rim light (dramatic edge lighting)
        const purpleLight = new THREE.PointLight(0xa855f7, 1.0, 18);
        purpleLight.position.set(5, 3, -3);
        scene.add(purpleLight);

        // Golden top light (halo effect)
        const goldLight = new THREE.PointLight(0xfbbf24, 0.8, 12);
        goldLight.position.set(0, 6, 0);
        scene.add(goldLight);

        // Cyan bottom accent
        const cyanLight = new THREE.PointLight(0x22d3ee, 0.5, 10);
        cyanLight.position.set(0, -2, 3);
        scene.add(cyanLight);

        // === TROPHY GROUP ===
        const trophy = new THREE.Group();

        // Premium gold material with realistic metallic properties
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.95,
            roughness: 0.08,
            emissive: 0x553300,
            emissiveIntensity: 0.15
        });

        // Polished gold for accents
        const polishedGoldMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdf00,
            metalness: 1.0,
            roughness: 0.02,
            emissive: 0x664400,
            emissiveIntensity: 0.2
        });

        // Dark base material (elegant wood/marble look)
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.2,
            roughness: 0.3
        });

        // === CLASSIC TROPHY CUP (Wide bowl shape) ===
        const cupPoints = [];
        // Bottom of cup (narrow stem connection)
        cupPoints.push(new THREE.Vector2(0.15, 0));
        cupPoints.push(new THREE.Vector2(0.18, 0.05));
        // Curve outward to form the bowl
        cupPoints.push(new THREE.Vector2(0.25, 0.15));
        cupPoints.push(new THREE.Vector2(0.40, 0.35));
        cupPoints.push(new THREE.Vector2(0.55, 0.55));
        cupPoints.push(new THREE.Vector2(0.68, 0.75));
        cupPoints.push(new THREE.Vector2(0.78, 0.95));
        cupPoints.push(new THREE.Vector2(0.85, 1.15));
        // Wide rim of the cup
        cupPoints.push(new THREE.Vector2(0.88, 1.30));
        cupPoints.push(new THREE.Vector2(0.90, 1.38));
        // Decorative lip
        cupPoints.push(new THREE.Vector2(0.93, 1.42));
        cupPoints.push(new THREE.Vector2(0.95, 1.45));
        cupPoints.push(new THREE.Vector2(0.93, 1.48));
        cupPoints.push(new THREE.Vector2(0.88, 1.50));

        const cupGeometry = new THREE.LatheGeometry(cupPoints, 64);
        const cup = new THREE.Mesh(cupGeometry, goldMaterial);
        cup.position.y = 0.4; // Raise cup above stem
        cup.castShadow = true;
        cup.receiveShadow = true;
        trophy.add(cup);

        // Inner cup rim decoration
        const innerRimGeo = new THREE.TorusGeometry(0.88, 0.025, 16, 64);
        const innerRim = new THREE.Mesh(innerRimGeo, polishedGoldMaterial);
        innerRim.rotation.x = Math.PI / 2;
        innerRim.position.y = 1.90;
        trophy.add(innerRim);

        // === TROPHY STEM (Elegant column) ===
        // Main stem cylinder
        const stemGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 32);
        const stem = new THREE.Mesh(stemGeo, goldMaterial);
        stem.position.y = 0.15;
        trophy.add(stem);

        // Decorative stem rings
        const stemRing1Geo = new THREE.TorusGeometry(0.18, 0.03, 16, 32);
        const stemRing1 = new THREE.Mesh(stemRing1Geo, polishedGoldMaterial);
        stemRing1.rotation.x = Math.PI / 2;
        stemRing1.position.y = 0.35;
        trophy.add(stemRing1);

        const stemRing2Geo = new THREE.TorusGeometry(0.16, 0.025, 16, 32);
        const stemRing2 = new THREE.Mesh(stemRing2Geo, polishedGoldMaterial);
        stemRing2.rotation.x = Math.PI / 2;
        stemRing2.position.y = 0.0;
        trophy.add(stemRing2);

        // Stem bulb (decorative element)
        const bulbGeo = new THREE.SphereGeometry(0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bulb = new THREE.Mesh(bulbGeo, goldMaterial);
        bulb.position.y = 0.0;
        bulb.rotation.x = Math.PI;
        trophy.add(bulb);

        // === TROPHY BASE (Multi-tiered classic base) ===
        // Top tier (smallest, gold accent)
        const topTierGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.12, 8);
        const topTier = new THREE.Mesh(topTierGeo, polishedGoldMaterial);
        topTier.position.y = -0.18;
        trophy.add(topTier);

        // Second tier (medium, dark)
        const midTierGeo = new THREE.CylinderGeometry(0.40, 0.48, 0.15, 8);
        const midTier = new THREE.Mesh(midTierGeo, baseMaterial);
        midTier.position.y = -0.32;
        trophy.add(midTier);

        // Gold ring between tiers
        const tierRingGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.03, 32);
        const tierRing = new THREE.Mesh(tierRingGeo, polishedGoldMaterial);
        tierRing.position.y = -0.42;
        trophy.add(tierRing);

        // Third tier (larger, dark)
        const lowerTierGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.18, 8);
        const lowerTier = new THREE.Mesh(lowerTierGeo, baseMaterial);
        lowerTier.position.y = -0.54;
        trophy.add(lowerTier);

        // Bottom tier (largest, dark with gold edge)
        const bottomTierGeo = new THREE.CylinderGeometry(0.72, 0.82, 0.12, 8);
        const bottomTier = new THREE.Mesh(bottomTierGeo, baseMaterial);
        bottomTier.position.y = -0.70;
        trophy.add(bottomTier);

        // Base gold rim
        const baseRimGeo = new THREE.TorusGeometry(0.82, 0.025, 16, 8);
        const baseRim = new THREE.Mesh(baseRimGeo, polishedGoldMaterial);
        baseRim.rotation.x = Math.PI / 2;
        baseRim.position.y = -0.76;
        trophy.add(baseRim);

        // === ELEGANT CURVED HANDLES ===
        // Left handle - classic trophy curve
        const leftHandleCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0.85, 1.65, 0),   // Top connection (at rim)
            new THREE.Vector3(1.35, 1.70, 0),   // Curve outward and up
            new THREE.Vector3(1.40, 0.90, 0),   // Curve down
            new THREE.Vector3(0.75, 0.70, 0)    // Bottom connection (mid cup)
        );
        const handleTube = new THREE.TubeGeometry(leftHandleCurve, 32, 0.055, 12, false);

        const leftHandle = new THREE.Mesh(handleTube, goldMaterial);
        trophy.add(leftHandle);

        // Right handle (mirrored)
        const rightHandle = new THREE.Mesh(handleTube, goldMaterial);
        rightHandle.scale.x = -1;
        trophy.add(rightHandle);

        // Handle decorative balls at top
        const handleBallGeo = new THREE.SphereGeometry(0.07, 16, 16);
        const leftHandleBall = new THREE.Mesh(handleBallGeo, polishedGoldMaterial);
        leftHandleBall.position.set(0.90, 1.68, 0);
        trophy.add(leftHandleBall);

        const rightHandleBall = new THREE.Mesh(handleBallGeo, polishedGoldMaterial);
        rightHandleBall.position.set(-0.90, 1.68, 0);
        trophy.add(rightHandleBall);

        // Handle decorative balls at bottom
        const leftHandleBall2 = new THREE.Mesh(handleBallGeo, polishedGoldMaterial);
        leftHandleBall2.position.set(0.78, 0.72, 0);
        trophy.add(leftHandleBall2);

        const rightHandleBall2 = new THREE.Mesh(handleBallGeo, polishedGoldMaterial);
        rightHandleBall2.position.set(-0.78, 0.72, 0);
        trophy.add(rightHandleBall2);

        // === PROGRESS FILL (Glowing liquid inside cup) ===
        const progressHeight = Math.max(0.1, (overallProgress / 100) * 1.1);
        const progressColor = getProgressColor(overallProgress);

        const progressMaterial = new THREE.MeshPhongMaterial({
            color: progressColor,
            emissive: progressColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.85,
            shininess: 120
        });

        // Create tapered cylinder to match cup interior shape
        const bottomRadius = 0.20 + (overallProgress / 100) * 0.25;
        const topRadius = 0.25 + (overallProgress / 100) * 0.45;
        const progressGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, progressHeight, 32);
        const progressFill = new THREE.Mesh(progressGeo, progressMaterial);
        progressFill.position.y = 0.55 + progressHeight / 2; // Inside the cup bowl
        trophy.add(progressFill);

        // === GLOWING RINGS (Orbiting) ===
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        const ring1Geo = new THREE.TorusGeometry(1.3, 0.02, 8, 64);
        const ring1 = new THREE.Mesh(ring1Geo, ringMaterial);
        ring1.rotation.x = Math.PI / 2;
        ring1.position.y = 0.8;
        trophy.add(ring1);

        const ring2Material = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const ring2Geo = new THREE.TorusGeometry(1.5, 0.015, 8, 64);
        const ring2 = new THREE.Mesh(ring2Geo, ring2Material);
        ring2.rotation.x = Math.PI / 2.5;
        ring2.position.y = 0.6;
        trophy.add(ring2);

        // === STARS (Multiple floating) ===
        const starShape = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? 0.12 : 0.05;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            if (i === 0) starShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        starShape.closePath();

        const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: false });
        const starMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        });

        // Main star on top
        const mainStar = new THREE.Mesh(starGeo, starMaterial);
        mainStar.scale.set(1.5, 1.5, 1.5);
        mainStar.position.set(0, 1.85, 0);
        trophy.add(mainStar);

        // Floating mini stars
        const miniStars = [];
        for (let i = 0; i < 5; i++) {
            const miniStar = new THREE.Mesh(starGeo, starMaterial);
            const angle = (i / 5) * Math.PI * 2;
            miniStar.position.set(
                Math.cos(angle) * 1.2,
                1.2 + Math.sin(i) * 0.3,
                Math.sin(angle) * 1.2
            );
            miniStar.scale.set(0.5, 0.5, 0.5);
            trophy.add(miniStar);
            miniStars.push({ mesh: miniStar, angle, offset: i });
        }

        // === ENHANCED SPARKLE PARTICLES (More density, varied colors) ===
        const particleCount = 150;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.2 + Math.random() * 2.0;
            const heightVariation = Math.random();
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = heightVariation * 3.0 - 0.5;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            // Rich color palette: Gold, Purple, Cyan, White
            const colorChoice = Math.random();
            if (colorChoice < 0.35) {
                // Bright gold
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.2;
            } else if (colorChoice < 0.55) {
                // Royal purple
                colors[i * 3] = 0.65; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 0.95;
            } else if (colorChoice < 0.75) {
                // Vibrant cyan
                colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.95;
            } else {
                // Pure white sparkle
                colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
            }

            sizes[i] = Math.random() * 0.1 + 0.03;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        trophy.add(particles);

        // Position trophy - lowered for better centering in viewport
        trophy.position.y = -0.6;
        scene.add(trophy);

        // === ANIMATION ===
        let time = 0;

        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            time += 0.008;

            // Rotate trophy
            trophy.rotation.y = time;

            // Float effect
            trophy.position.y = -0.3 + Math.sin(time * 2) * 0.03;

            // Rotate rings in opposite directions
            ring1.rotation.z = time * 0.5;
            ring2.rotation.z = -time * 0.3;

            // Rotate main star
            mainStar.rotation.z = time * 2;

            // Animate mini stars
            miniStars.forEach((star, i) => {
                star.mesh.rotation.z = time * 3;
                star.mesh.position.y = 1.2 + Math.sin(time * 2 + star.offset) * 0.15;
            });

            // Animate particles (spiral up)
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3 + 1] += 0.008;
                if (pos[i * 3 + 1] > 2.5) {
                    pos[i * 3 + 1] = 0;
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.3 + Math.random() * 1.2;
                    pos[i * 3] = Math.cos(angle) * radius;
                    pos[i * 3 + 2] = Math.sin(angle) * radius;
                }
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // Pulse progress glow
            progressMaterial.emissiveIntensity = 0.4 + Math.sin(time * 4) * 0.2;

            // Pulse lights
            blueLight.intensity = 0.8 + Math.sin(time * 3) * 0.3;
            purpleLight.intensity = 0.6 + Math.cos(time * 2) * 0.2;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
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
    }, [overallProgress]);

    return (
        <div className="relative rounded-xl overflow-hidden shadow-lg h-full"
            style={{ background: 'linear-gradient(135deg, #3b3985ff 0%, #5146ccff 50%, #6366f1 100%)' }}>

            {/* 3D Canvas */}
            <div ref={containerRef} className="w-full h-72" />

            {/* Progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-white">
                            {overallProgress}%
                        </span>
                    </div>
                    <p className="text-gray-200 text-sm font-medium tracking-wide">OVERALL PROGRESS</p>

                    {/* Progress bars */}
                    <div className="flex justify-center gap-4 mt-3">
                        {[
                            { label: 'Routines', value: routineProgress, color: 'from-blue-400 to-blue-500' },
                            { label: 'Tasks', value: taskProgress, color: 'from-purple-400 to-purple-500' },
                            { label: 'Habits', value: habitProgress, color: 'from-green-400 to-green-500' },
                            { label: 'Goals', value: goalProgress, color: 'from-orange-400 to-orange-500' }
                        ].map(item => (
                            <div key={item.label} className="text-center">
                                <div className="w-10 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-300 uppercase tracking-wider">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress3DTrophy;
