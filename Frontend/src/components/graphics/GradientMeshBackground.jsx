/**
 * GradientMeshBackground.jsx
 * 
 * WebGL Animated Gradient Mesh Background using Three.js Shaders
 * 
 * HCI & Computer Graphics Concepts Covered:
 * - 9. Lighting and shading (custom GLSL shaders)
 * - 10. Rendering algorithms (fragment shaders, Perlin noise)
 * 
 * Creates a beautiful animated gradient background using custom shaders
 * with Perlin noise for organic movement.
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Vertex Shader - passes UV coordinates and position
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader - creates animated gradient with noise
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  // Simple noise function (approximation of Perlin noise)
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Smooth noise with interpolation
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smooth interpolation
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Fractal Brownian Motion for more natural noise
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Create animated noise
    float noiseValue = fbm(uv * 3.0 + uTime * 0.1);
    float noiseValue2 = fbm(uv * 2.0 - uTime * 0.15 + 100.0);
    
    // Create flowing gradient positions
    float gradient1 = sin(uv.x * 3.14159 + uTime * 0.3 + noiseValue) * 0.5 + 0.5;
    float gradient2 = cos(uv.y * 3.14159 + uTime * 0.2 + noiseValue2) * 0.5 + 0.5;
    
    // Mix colors based on gradients
    vec3 color = mix(uColor1, uColor2, gradient1);
    color = mix(color, uColor3, gradient2 * 0.5);
    
    // Add subtle noise texture
    color += (noiseValue - 0.5) * 0.05;
    
    // Vignette effect
    float vignette = 1.0 - distance(uv, vec2(0.5)) * 0.5;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const GradientMeshBackground = ({
    color1 = '#4A2BAF',
    color2 = '#5D4EFF',
    color3 = '#7c3aed',
    className = ''
}) => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();

        // Orthographic camera for 2D plane
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Convert hex colors to THREE.Color
        const threeColor1 = new THREE.Color(color1);
        const threeColor2 = new THREE.Color(color2);
        const threeColor3 = new THREE.Color(color3);

        // Shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Vector3(threeColor1.r, threeColor1.g, threeColor1.b) },
                uColor2: { value: new THREE.Vector3(threeColor2.r, threeColor2.g, threeColor2.b) },
                uColor3: { value: new THREE.Vector3(threeColor3.r, threeColor3.g, threeColor3.b) },
                uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
            },
            vertexShader,
            fragmentShader
        });

        // Full-screen plane
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation loop
        let startTime = Date.now();

        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Update time uniform
            material.uniforms.uTime.value = (Date.now() - startTime) * 0.001;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            renderer.setSize(width, height);
            material.uniforms.uResolution.value.set(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            geometry.dispose();
            material.dispose();
        };
    }, [color1, color2, color3]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 ${className}`}
            style={{ zIndex: 0 }}
        />
    );
};

export default GradientMeshBackground;
