/**
 * CelebrationParticles.jsx
 * 
 * Canvas Particle Celebration Effects (Confetti)
 * 
 * HCI & Computer Graphics Concepts Covered:
 * - 7. 2D graphics and rendering (particle systems)
 * - 8. Animation techniques (physics simulation)
 * - 10. Rendering algorithms (particle rendering, gravity)
 * 
 * Creates confetti/celebration effects that can be triggered globally.
 */

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// Particle class for confetti
class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = -Math.random() * 15 - 5;

        // Physics properties
        this.gravity = 0.4;
        this.friction = 0.99;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;

        // Size and shape
        this.width = Math.random() * 10 + 5;
        this.height = Math.random() * 6 + 3;

        // Lifetime
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.005;
    }

    update() {
        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;

        this.rotation += this.rotationSpeed;
        this.alpha -= this.decay;

        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// Star particle for extra sparkle
class StarParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        this.vx = (Math.random() - 0.5) * 10;
        this.vy = -Math.random() * 12 - 3;

        this.gravity = 0.3;
        this.size = Math.random() * 4 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;

        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        // Draw 4-pointed star
        ctx.beginPath();
        const spikes = 4;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const px = this.x + Math.cos(angle) * radius;
            const py = this.y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

const CelebrationParticles = forwardRef(({
    colors = ['#5D4EFF', '#4A2BAF', '#22c55e', '#f97316', '#ec4899', '#eab308'],
    particleCount = 50,
    className = ''
}, ref) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const [isActive, setIsActive] = useState(false);

    // Trigger celebration
    const celebrate = useCallback((x, y) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Determine if this is a directed burst or default celebration (rain)
        const isDefault = x === undefined && y === undefined;
        
        // Use window dimensions for logical coordinates (handles DPR correctly)
        const posX = x ?? window.innerWidth / 2;
        const posY = y ?? -50; // Start above screen for rain

        // Create confetti particles
        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            let p;
            
            if (Math.random() > 0.3) {
                p = new ConfettiParticle(posX, posY, color);
            } else {
                p = new StarParticle(posX, posY, color);
            }

            // If default celebration, make it rain from top
            if (isDefault) {
                // Wide horizontal spread - use window width for reference
                const spread = window.innerWidth / 2;
                p.x = window.innerWidth / 2 + (Math.random() - 0.5) * spread; // Random start X across top
                p.y = -Math.random() * 50 - 10; // Staggered start height above screen
                
                // Gentle drift
                p.vx = (Math.random() - 0.5) * 3; 
                // Downward velocity
                p.vy = Math.random() * 8 + 4;
                p.gravity = 0.15;
                p.friction = 0.995;
            }

            particlesRef.current.push(p);
        }

        setIsActive(true);
    }, [colors, particleCount]);

    // Expose celebrate function via ref
    useImperativeHandle(ref, () => ({
        celebrate
    }), [celebrate]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Resize handler
        const resizeCanvas = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Clear canvas
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                const alive = particle.update();
                if (alive) {
                    particle.draw(ctx);
                }
                return alive;
            });

            // Deactivate when no particles left
            if (particlesRef.current.length === 0 && isActive) {
                setIsActive(false);
            }
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-[9999] ${className}`}
            style={{
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
            }}
        />
    );
});

CelebrationParticles.displayName = 'CelebrationParticles';

export default CelebrationParticles;
