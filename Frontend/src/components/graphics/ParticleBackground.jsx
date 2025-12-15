/**
 * ParticleBackground.jsx
 * 
 * Animated Particle Background using Canvas API
 * Gentle, elegant particle movement for subtle background effect.
 */

import React, { useRef, useEffect, useCallback } from 'react';

const ParticleBackground = ({
    particleCount = 50,
    interactive = true,
    showConnections = true,
    className = ""
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, inCanvas: false });

    // Create a particle with balanced speed
    const createParticle = useCallback((width, height) => {
        const hue = 260 + Math.random() * 20;
        const saturation = 60 + Math.random() * 20;
        const lightness = 50 + Math.random() * 30;

        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            // Faster speed - 10x previous
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            alpha: Math.random() * 0.4 + 0.2,
            color: `hsla(${hue}, ${saturation}%, ${lightness}%, `
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;

        // Resize canvas
        const resize = () => {
            const parent = canvas.parentElement;
            width = parent ? parent.clientWidth : window.innerWidth;
            height = parent ? Math.max(parent.clientHeight, 500) : 500;

            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Initialize particles
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push(createParticle(width, height));
            }
        };

        resize();
        window.addEventListener('resize', resize);

        // Mouse handlers
        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };
        const onMouseEnter = () => { mouseRef.current.inCanvas = true; };
        const onMouseLeave = () => { mouseRef.current.inCanvas = false; };

        if (interactive) {
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseenter', onMouseEnter);
            canvas.addEventListener('mouseleave', onMouseLeave);
        }

        // Draw connections
        const drawConnections = () => {
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.25;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(93, 78, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particlesRef.current.forEach(p => {
                // Move particle
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Gentle mouse interaction
                if (interactive && mouseRef.current.inCanvas) {
                    const dx = mouseRef.current.x - p.x;
                    const dy = mouseRef.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80 && dist > 0) {
                        p.vx -= (dx / dist) * 0.02;
                        p.vy -= (dy / dist) * 0.02;
                    }
                }

                // Apply friction to gradually slow down
                p.vx *= 0.995;
                p.vy *= 0.995;

                // Keep particles moving with minimum speed
                if (Math.abs(p.vx) < 1) p.vx = (Math.random() - 0.5) * 3;
                if (Math.abs(p.vy) < 1) p.vy = (Math.random() - 0.5) * 3;

                // Cap max speed to prevent crazy fast movement
                if (Math.abs(p.vx) > 6) p.vx *= 0.8;
                if (Math.abs(p.vy) > 6) p.vy *= 0.8;

                // Draw glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                gradient.addColorStop(0, p.color + p.alpha + ')');
                gradient.addColorStop(1, p.color + '0)');
                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Draw core
                ctx.beginPath();
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            if (showConnections) {
                drawConnections();
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (interactive) {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseenter', onMouseEnter);
                canvas.removeEventListener('mouseleave', onMouseLeave);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount, interactive, showConnections, createParticle]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${className}`}
            style={{
                background: 'transparent',
                zIndex: 1,
                pointerEvents: interactive ? 'auto' : 'none',
                minHeight: '500px'
            }}
        />
    );
};

export default ParticleBackground;
