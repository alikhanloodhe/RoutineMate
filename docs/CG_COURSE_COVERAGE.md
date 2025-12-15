# RoutineMate - Computer Graphics Course Coverage Documentation

> **A Complete Guide to How Our Project Implements Computer Graphics Concepts**
>
> This document explains in **simple English** how RoutineMate covers all 4 main Computer Graphics topics from our course. Each section shows which code file does what and connects it to the exact course concepts.

---

## 📋 Quick Summary: Where to Find Each CG Feature

| Feature | Location in App | Course Topic |
|---------|-----------------|--------------|
| **Moving Dots** | Landing Page Hero Section | Topic 7 (2D Graphics) |
| **Gradient Mesh Shader** | Login & Signup Screens | Topic 9, 10 (Shading, Rendering) |
| **3D Trophy** | Dashboard | Topic 7, 9, 10 (3D, Lighting, Rendering) |
| **3D Robot Mascot** | All Pages (Bottom Right) | Topic 7, 8, 9 (3D, Animation, Lighting) |
| **Celebration Confetti** | When Robot is Clicked | Topic 7, 8, 10 (2D, Animation, Rendering) |
| **Bar Chart** | Dashboard (Weekly Activity) | Topic 7 (2D Graphics) |
| **Line Chart** | Dashboard (Productivity Trend) | Topic 7 (2D Graphics) |
| **Pie Chart** | Dashboard (Category Distribution) | Topic 7 (2D Graphics) |

---

## 🎯 THE 4 MAIN TOPICS AND HOW WE COVERED THEM

---

# MAIN TOPIC 7: 2D and 3D Graphics & Rendering (FOUNDATION)

This is the **base of everything** in Computer Graphics. It covers how we display things on screen.

---

## 7.1 Moving Dots on Landing Page (ParticleBackground.jsx)

**📁 File:** `src/components/graphics/ParticleBackground.jsx`
**📍 Where Used:** Landing Page Hero Section

### What It Does
When you open the landing page, you see purple dots moving around in the background. These dots:
- Move in different directions
- Connect with lines when they get close to each other
- React when you move your mouse near them

### Course Concepts Covered

#### A. Raster Graphics (Slide 1)
```
What we learned: Images are made of tiny dots called pixels
What we did: We draw each particle as colored pixels on a canvas
```

**How it works in our code:**
```javascript
// This is how we draw each dot on the screen
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);  // Draw a circle
ctx.fill();  // Fill it with color
```
- `p.x, p.y` = The position (which pixel to draw at)
- `p.size` = How big the dot is (how many pixels wide)

#### B. Frame Buffer (Slides 1 & 2)
```
What we learned: The frame buffer is memory that stores what to show on screen
What we did: We use HTML Canvas which automatically manages the frame buffer for us
```

**How it works:**
```javascript
ctx.clearRect(0, 0, width, height);  // Clear the old frame
// Draw all the new particles
// Canvas automatically updates the screen
```

The Canvas clears and redraws **60 times per second** - that's the refresh rate we learned about!

#### C. Output Primitives (Slide 1)
```
What we learned: Basic shapes are points, lines, circles
What we did: We draw circles (dots) and lines (connections between dots)
```

**Points (Dots):**
```javascript
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);  // Draw circle at (x, y)
```

**Lines (Connections):**
```javascript
ctx.moveTo(particles[i].x, particles[i].y);  // Start point
ctx.lineTo(particles[j].x, particles[j].y);  // End point
ctx.stroke();  // Draw the line
```

#### D. Coordinate System
```
What we learned: We use (x, y) coordinates to position things
What we did: Each particle has an x and y position
```

```javascript
const createParticle = (width, height) => {
    return {
        x: Math.random() * width,   // Random x position
        y: Math.random() * height,  // Random y position
        vx: (Math.random() - 0.5) * 4,  // Speed in x direction
        vy: (Math.random() - 0.5) * 4   // Speed in y direction
    };
};
```

---

## 7.2 The 3D Trophy on Dashboard (Progress3DTrophy.jsx)

**📁 File:** `src/components/graphics/Progress3DTrophy.jsx`
**📍 Where Used:** Dashboard Page

### What It Does
Shows a beautiful rotating 3D golden trophy that fills up based on your progress (routines, tasks, habits, goals completed).

### Course Concepts Covered

#### G. 3D Graphics Fundamentals (Slide 3)
```
What we learned: 3D uses x, y, z coordinates (z is depth)
What we did: We create 3D objects like the trophy cup, base, handles, stars
```

**The Trophy Cup (using LatheGeometry):**
```javascript
// These are 2D points that spin around to make a 3D cup shape
const cupPoints = [];
cupPoints.push(new THREE.Vector2(0.05, 0));   // Bottom center
cupPoints.push(new THREE.Vector2(0.4, 0.05)); // Cup profile
cupPoints.push(new THREE.Vector2(0.6, 1.6));  // Top of cup

// Spin these points 360 degrees to make a 3D cup
const cupGeometry = new THREE.LatheGeometry(cupPoints, 48);
```

Think of it like a potter's wheel - you define the side profile and it spins to create the 3D shape!

#### H. 3D Transformations (Slide 3)
```
What we learned: Translation (move), Rotation (spin), Scaling (resize)
What we did: We rotate, move, and scale the trophy continuously
```

**Rotation (Spinning):**
```javascript
trophy.rotation.y = time;  // Rotate around Y axis as time passes
```

**Translation (Moving up/down - floating effect):**
```javascript
trophy.position.y = -0.3 + Math.sin(time * 2) * 0.03;  // Float up and down
```

**Scaling (Making stars grow/shrink):**
```javascript
miniStar.scale.set(0.5, 0.5, 0.5);  // Make mini stars half size
```

#### I. 3D Graphics Pipeline (Slides 3 & 4)
```
What we learned: Objects go through stages: Modeling → World → Camera → Screen
What we did: Three.js handles this for us, but we set up each stage
```

**Step 1 - Modeling (Create Objects in Local Coordinates):**
```javascript
const cup = new THREE.Mesh(cupGeometry, goldMaterial);
trophy.add(cup);  // Add to trophy group
```

**Step 2 - World Transform (Position in Scene):**
```javascript
trophy.position.y = -0.6;  // Move trophy down in the world
scene.add(trophy);
```

**Step 3 - Camera (Viewing):**
```javascript
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, 0, 6);  // Position camera
camera.lookAt(0, 0, 0);         // Point at center
```

**Step 4 - Render to Screen:**
```javascript
renderer.render(scene, camera);  // Draw everything to the screen
```

#### J. Viewing & Projection (Slides 3 & 4)
```
What we learned: Orthographic = no depth feel, Perspective = realistic depth
What we did: We use Perspective projection for realistic 3D view
```

```javascript
// PerspectiveCamera gives us that "things far away look smaller" effect
const camera = new THREE.PerspectiveCamera(
    45,                // Field of View (how wide the camera sees)
    width / height,    // Aspect Ratio (so it doesn't look stretched)
    0.1,              // Near plane (closest thing we can see)
    1000              // Far plane (farthest thing we can see)
);
```

#### K. View Frustum (Slide 4)
```
What we learned: The viewing volume is like a cut-off pyramid (frustum)
What we did: The near (0.1) and far (1000) planes define our frustum
```

Anything outside this range (closer than 0.1 or farther than 1000) won't be visible - this is **clipping**!

---

## 7.3 The 3D Robot Mascot (Mascot3D.jsx)

**📁 File:** `src/components/graphics/Mascot3D.jsx`
**📍 Where Used:** Bottom-right corner of all pages

### What It Does
A cute 3D robot assistant that floats and bounces. When you click it, it celebrates!

### Course Concepts Covered

#### 3D Object Representations (Slide 3)
```
What we learned: 3D objects are made of polygons, meshes
What we did: We built the robot from geometric primitives (boxes, spheres, cylinders)
```

**Robot made from basic shapes:**
```javascript
// HEAD - A 3D box (6 polygons making a cube)
const headGeo = new THREE.BoxGeometry(1.4, 1.2, 1.2);
const head = new THREE.Mesh(headGeo, headMat);

// EYES - Circles on the face
const eyeGeo = new THREE.CircleGeometry(0.12, 32);  // 32 sides = smooth circle

// ANTENNA - A cylinder
const antennaGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);

// ANTENNA TIP - A sphere
const tipGeo = new THREE.SphereGeometry(0.1, 16, 16);  // 16x16 polygons

// BODY - Another box
const bodyGeo = new THREE.BoxGeometry(1.0, 0.6, 0.8);

// ARMS - Capsules (cylinder with rounded ends)
const armGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
```

This shows **polygon mesh** concept - complex shapes made from simple geometric primitives!

---

## 7.4 Charts on Dashboard

We have 3 types of charts that use 2D graphics principles:

### Bar Chart (WeeklyActivityChart.jsx)
**📁 File:** `src/components/dashboard/WeeklyActivityChart.jsx`

Uses 2D rectangles to represent data:
```javascript
// Each bar's height is calculated based on the data value
style={{ height: `${(day.routines / maxValue) * 100}%` }}
```

### Line Chart (ProductivityTrend.jsx)
**📁 File:** `src/components/dashboard/ProductivityTrend.jsx`

Uses lines connecting points:
```javascript
// Chart.js draws lines between data points
const data = {
    datasets: [{
        label: 'Productivity Score',
        data: prepareChartData(),  // Array of numbers
        tension: 0.4,  // How curved the lines are
    }]
};
```

### Pie Chart (CategoryDistribution.jsx)
**📁 File:** `src/components/dashboard/CategoryDistribution.jsx`

Uses arc segments of a circle:
```javascript
// Pie chart automatically calculates arc angles from percentages
<Pie data={chartData} options={chartOptions} />
```

All charts demonstrate:
- **2D coordinate system** (x-axis for categories, y-axis for values)
- **Output primitives** (lines, rectangles, arcs)
- **Raster graphics** (rendering to pixel grid)

---

# MAIN TOPIC 8: Animation Techniques, VR & AR

---

## 8.1 Particle Animation (ParticleBackground.jsx)

### Animation Fundamentals (Slide 7)
```
What we learned: Animation = showing images fast enough to look like motion
What we did: We update particle positions and redraw 60 times per second
```

**The Animation Loop:**
```javascript
const animate = () => {
    // 1. Clear the old frame
    ctx.clearRect(0, 0, width, height);
    
    // 2. Update each particle's position
    particlesRef.current.forEach(p => {
        p.x += p.vx;  // Move based on velocity
        p.y += p.vy;
        
        // Wrap around screen edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        
        // Draw the particle at new position
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 3. Request next frame (runs 60 times per second)
    requestAnimationFrame(animate);
};
```

This is **frame-based animation** - just like cartoons!

---

## 8.2 Physics-Based Animation (CelebrationParticles.jsx)

**📁 File:** `src/components/graphics/CelebrationParticles.jsx`
**📍 When Used:** Click the robot mascot

### Motion & Physics Animation (Slide 7)
```
What we learned: Realistic motion uses physics (gravity, friction)
What we did: Our confetti particles have gravity, velocity, and rotation
```

**The Confetti Particle Class:**
```javascript
class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        
        // VELOCITY - How fast it moves
        this.vx = (Math.random() - 0.5) * 15;  // Random horizontal speed
        this.vy = -Math.random() * 15 - 5;     // Shoots upward initially
        
        // PHYSICS PROPERTIES
        this.gravity = 0.4;      // Pulls downward each frame
        this.friction = 0.99;    // Slows down slightly each frame
        this.rotation = Math.random() * Math.PI * 2;  // Random starting angle
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;  // Spin speed
    }
    
    update() {
        // GRAVITY - Makes particles fall
        this.vy += this.gravity;
        
        // FRICTION - Gradually slows movement
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // UPDATE POSITION based on velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // UPDATE ROTATION - Makes it spin
        this.rotation += this.rotationSpeed;
    }
}
```

This is **procedural/physics-based animation** - the computer calculates realistic motion!

---

## 8.3 3D Animation (Trophy and Robot)

### Keyframing Concept (Slide 7)
```
What we learned: Animation creates smooth movement between key positions
What we did: We use mathematical functions (sin, cos) to create smooth loops
```

**Trophy Floating Animation:**
```javascript
// Sin wave creates smooth up-and-down motion
trophy.position.y = -0.3 + Math.sin(time * 2) * 0.03;

// Linear time creates continuous rotation
trophy.rotation.y = time;
```

**Robot Celebration Animation:**
```javascript
if (celebratingRef.current) {
    // Faster bouncing during celebration
    robotRef.current.position.y = Math.sin(time * 8) * 0.15;
    
    // Happy wiggle
    robotRef.current.rotation.z = Math.sin(time * 6) * 0.1;
    
    // Eyes grow bigger
    const scale = 1.3 + Math.sin(time * 10) * 0.2;
    leftEyeRef.current.scale.set(scale, scale, 1);
} else {
    // Gentle idle floating
    robotRef.current.position.y = Math.sin(time * 2) * 0.05;
    robotRef.current.rotation.y = Math.sin(time) * 0.1;
}
```

---

# MAIN TOPIC 9: Lighting and Shading Techniques

---

## 9.1 Gradient Mesh Background (GradientMeshBackground.jsx)

**📁 File:** `src/components/graphics/GradientMeshBackground.jsx`
**📍 Where Used:** Login and Signup page left panel

### What It Does
Creates a beautiful animated gradient background that flows and moves organically.

### Shading with GLSL Shaders

#### Fragment Shader - Per-Pixel Shading (Slide 5)
```
What we learned: Phong shading calculates color for each pixel
What we did: We wrote a custom shader that calculates color for every pixel
```

**The Fragment Shader (This runs for EVERY pixel!):**
```glsl
void main() {
    vec2 uv = vUv;  // Current pixel's position (0 to 1)
    
    // CREATE ANIMATED NOISE for organic movement
    float noiseValue = fbm(uv * 3.0 + uTime * 0.1);
    
    // CREATE FLOWING GRADIENTS
    float gradient1 = sin(uv.x * 3.14159 + uTime * 0.3 + noiseValue) * 0.5 + 0.5;
    float gradient2 = cos(uv.y * 3.14159 + uTime * 0.2 + noiseValue2) * 0.5 + 0.5;
    
    // MIX COLORS based on gradients
    vec3 color = mix(uColor1, uColor2, gradient1);  // Blend first two colors
    color = mix(color, uColor3, gradient2 * 0.5);   // Add third color
    
    // VIGNETTE - Darker at edges (like camera effect)
    float vignette = 1.0 - distance(uv, vec2(0.5)) * 0.5;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);  // Final pixel color
}
```

This is **per-pixel shading** (like Phong shading from the course) - every single pixel gets its own calculated color!

#### Perlin Noise for Natural Look
```
What we learned: Natural things don't look random - they have smooth patterns
What we did: We use noise functions to create smooth, organic movement
```

```glsl
// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fractal Brownian Motion - adds multiple layers of noise
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(p * frequency);
        amplitude *= 0.5;    // Each layer is quieter
        frequency *= 2.0;    // Each layer is more detailed
    }
    return value;
}
```

---

## 9.2 3D Lighting in Trophy (Progress3DTrophy.jsx)

### Light Types (Slide 5)
```
What we learned: Different light types - Ambient, Point, Directional, Spotlight
What we did: We use ALL of these types in the trophy scene!
```

**Our Lighting Setup:**
```javascript
// AMBIENT LIGHT - Base overall lighting (like daylight in a room)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// DIRECTIONAL LIGHT - Like the sun (parallel rays, casts shadows)
const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
mainLight.position.set(5, 10, 8);
mainLight.castShadow = true;
scene.add(mainLight);

// POINT LIGHTS - Like light bulbs (light radiates in all directions)
const blueLight = new THREE.PointLight(0x6366f1, 1.2, 20);
blueLight.position.set(-5, 4, 4);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0xa855f7, 1.0, 18);
purpleLight.position.set(5, 3, -3);
scene.add(purpleLight);

const goldLight = new THREE.PointLight(0xfbbf24, 0.8, 12);
goldLight.position.set(0, 6, 0);
scene.add(goldLight);
```

### Phong Lighting Model (Slide 5)
```
What we learned: Phong = Ambient + Diffuse + Specular
What we did: We use MeshPhongMaterial which implements this automatically
```

**The Gold Trophy Material:**
```javascript
const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,       // The base color (Diffuse)
    metalness: 0.9,        // How metallic (affects reflection)
    roughness: 0.1,        // How smooth (affects Specular highlight)
    emissive: 0x442200,    // Self-glow color (extra shine)
    emissiveIntensity: 0.1
});
```

**The Robot's Phong Material:**
```javascript
const headMat = new THREE.MeshPhongMaterial({
    color: primaryColor,   // Diffuse color
    shininess: 80,         // Specular intensity (higher = shinier)
    flatShading: false     // Smooth shading across surface
});
```

### Lighting Vectors (Slide 5)
```
What we learned: L (light), N (normal), V (view), R (reflection) vectors
What we did: Three.js calculates these automatically, but we control light positions
```

The light position determines the L vector:
```javascript
mainLight.position.set(5, 10, 8);  // Light is up-right-forward from trophy
```

---

## 9.3 Shading Comparison

| Shading Type | Where Used | How It Works |
|--------------|------------|--------------|
| **Gouraud Shading** | Could be used if we set `flatShading: true` | Calculates color at vertices, interpolates |
| **Phong Shading** | Our 3D models use this | Calculates color at every pixel (smoother) |
| **Custom Shading** | GradientMeshBackground | Our own shader calculates each pixel |

---

# MAIN TOPIC 10: Rendering Algorithms & Techniques

---

## 10.1 WebGL Rendering Pipeline (All 3D Components)

### The Pipeline Stages (Slide 6)
```
What we learned: Data flows through stages to become pixels
What we did: Three.js implements this pipeline for us
```

**What happens when we render the trophy:**

```
1. VERTEX PROCESSING
   - Takes all the trophy vertices (corners of polygons)
   - Applies transformations (rotation, position)
   - Projects to screen coordinates
   
2. PRIMITIVE ASSEMBLY
   - Groups vertices into triangles
   - The cup is made of many triangles
   
3. RASTERIZATION
   - Converts triangles to fragments (potential pixels)
   - Figures out which pixels each triangle covers
   
4. FRAGMENT PROCESSING
   - Calculates the color of each fragment
   - Applies lighting, textures, shading
   
5. OUTPUT
   - Writes final colors to frame buffer
   - Applies depth testing (what's in front)
```

**Our code that triggers this:**
```javascript
renderer.render(scene, camera);  // This runs the entire pipeline!
```

---

## 10.2 Particle System Rendering (ParticleBackground.jsx)

### The Rendering Algorithm
```
What we learned: Game-like graphics need efficient update loops
What we did: We have a simple but effective particle system
```

**Our Particle System Algorithm:**
```
For each animation frame (60 times per second):
    1. CLEAR - Remove old frame
    2. UPDATE - Move each particle
       - Add velocity to position
       - Apply friction (slow down)
       - Wrap around edges
       - Apply mouse interaction
    3. DRAW - Render each particle
       - Draw glow (radial gradient)
       - Draw core (solid circle)
    4. CONNECT - Draw lines between nearby particles
       - For each pair of particles
       - If distance < 120 pixels
       - Draw a semi-transparent line
    5. LOOP - Request next frame
```

---

## 10.3 The Animation Frame Loop

All our graphics components use `requestAnimationFrame` for smooth 60fps rendering:

**How it works:**
```javascript
const animate = () => {
    // Request the NEXT frame first (for smooth timing)
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Update the scene (move things, change colors)
    trophy.rotation.y += 0.008;
    
    // Render the current frame
    renderer.render(scene, camera);
};

animate();  // Start the loop
```

**Why 60 FPS?**
- Matches typical screen refresh rate (~60 Hz from course)
- Smooth to human eye
- `requestAnimationFrame` automatically syncs with display

---

## 10.4 Double Buffering (All Graphics)

```
What we learned: Double buffering prevents flickering
What we did: Canvas and WebGL automatically use double buffering
```

Both Canvas (2D) and Three.js (WebGL) draw to a "back buffer" first, then swap it to the screen atomically. This prevents the user from seeing partially drawn frames.

---

## 10.5 Depth Buffer / Z-Buffer (3D Components)

```
What we learned: Z-buffer stores depth of each pixel to handle overlapping
What we did: Three.js enables this automatically
```

**In our trophy:**
```javascript
// Z-buffer determines which surfaces are visible
// When the cup is in front of the handles, only the cup shows
// Three.js handles this automatically when rendering
```

---

# 📊 COMPLETE MAPPING: Course Slide → Our Implementation

## Slides 1–2 (2D Fundamentals)

| Course Topic | Our Implementation |
|--------------|-------------------|
| Raster Graphics | Canvas pixel drawing in ParticleBackground |
| Frame Buffer | Canvas 2D context manages this |
| Resolution | `canvas.width`, `canvas.height` |
| Pixel Operations | `ctx.arc()`, `ctx.fill()`, `ctx.stroke()` |
| Output Primitives | Points (dots), Lines (connections), Arcs (charts) |
| Line Drawing | `moveTo()`, `lineTo()` for particle connections |

## Slide 3 (3D Fundamentals)

| Course Topic | Our Implementation |
|--------------|-------------------|
| 3D Coordinates (x, y, z) | `position.set(x, y, z)` in all 3D objects |
| 3D Transformations | `rotation.y`, `position.y`, `scale.set()` |
| Polygonal Meshes | BoxGeometry, SphereGeometry, LatheGeometry |

## Slide 4 (Viewing & Projection)

| Course Topic | Our Implementation |
|--------------|-------------------|
| Perspective Projection | `THREE.PerspectiveCamera(fov, aspect, near, far)` |
| View Frustum | Near plane (0.1), Far plane (1000) |
| Camera | `camera.position.set()`, `camera.lookAt()` |
| FOV & Aspect Ratio | Field of View = 45°, Aspect = width/height |

## Slide 5 (Lighting & Shading)

| Course Topic | Our Implementation |
|--------------|-------------------|
| Ambient Light | `THREE.AmbientLight(color, intensity)` |
| Directional Light | `THREE.DirectionalLight()` with castShadow |
| Point Light | Multiple colored `THREE.PointLight()` |
| Phong Model | `THREE.MeshPhongMaterial({ shininess })` |
| Per-Pixel Shading | Custom GLSL fragment shader |
| Normal Vectors | Three.js calculates automatically |

## Slide 6 (Rendering)

| Course Topic | Our Implementation |
|--------------|-------------------|
| Rendering Pipeline | `renderer.render(scene, camera)` |
| Fragment Processing | GLSL fragment shader |
| Double Buffering | Automatic in Canvas and WebGL |
| Depth Buffer | Enabled by default in Three.js |

## Slide 7 (Animation)

| Course Topic | Our Implementation |
|--------------|-------------------|
| Frame-Based Animation | `requestAnimationFrame()` loop |
| Physics Animation | Gravity, friction in CelebrationParticles |
| Procedural Animation | `Math.sin(time)` for floating effect |
| Keyframing Concept | Smooth interpolation for celebrations |

---

# 🗂️ FILE REFERENCE

```
src/components/graphics/
├── ParticleBackground.jsx     ← Moving dots on landing page
├── GradientMeshBackground.jsx ← Shader background on login/signup
├── Progress3DTrophy.jsx       ← 3D trophy on dashboard  
├── Mascot3D.jsx               ← 3D robot on all pages
├── CelebrationParticles.jsx   ← Confetti when robot clicked
└── index.js                   ← Exports all components

src/components/dashboard/
├── WeeklyActivityChart.jsx    ← Bar chart (2D graphics)
├── ProductivityTrend.jsx      ← Line chart (2D graphics)
└── CategoryDistribution.jsx   ← Pie chart (2D graphics)

src/pages/
├── LandingPage.jsx            ← Uses ParticleBackground
├── Login.jsx                  ← Uses GradientMeshBackground
├── Signup.jsx                 ← Uses GradientMeshBackground
└── Dashboard.jsx              ← Uses Progress3DTrophy, Charts

src/components/layout/
└── Layout.jsx                 ← Uses Mascot3D, CelebrationParticles
```

---

# 💡 HOW TO EXPLAIN EACH FEATURE

## When someone asks about the Moving Dots:
> "This demonstrates **2D graphics and animation**. Each dot is a data structure with position (x, y) and velocity. We use **Canvas API** to draw circles as **output primitives**. The animation runs at **60 frames per second** using `requestAnimationFrame`, which syncs with the screen's **refresh rate**. When dots get close, we draw **lines** between them using the **line drawing** concepts we learned."

## When someone asks about the Gradient Background:
> "This uses **WebGL shaders** for **per-pixel shading**. The **fragment shader** runs for every single pixel on screen and calculates its color using **Perlin noise** for organic movement. It's like **Phong shading** but custom - we mix three colors based on mathematical functions that change over time."

## When someone asks about the 3D Trophy:
> "This is a complete **3D graphics** implementation. We have a **scene, camera, and renderer** - the basic **3D pipeline**. The trophy uses **polygon meshes** (LatheGeometry spins a 2D profile to make 3D), multiple **light types** (ambient, directional, point), and **Phong materials** for realistic shading. It demonstrates **3D transformations** by rotating and floating, and uses **perspective projection** so farther things look smaller."

## When someone asks about the Robot:
> "The robot demonstrates **3D modeling with primitives** - boxes for head/body, spheres for antenna tip, cylinders for antenna. It uses **MeshPhongMaterial** for realistic **lighting** with ambient and diffuse components. The animation shows **procedural animation** using sine waves, and the celebration shows **keyframe-like** animation with different poses."

## When someone asks about the Confetti:
> "This is a **particle system** with **physics-based animation**. Each confetti piece has velocity, gravity, friction, and rotation - real physics! We create many particles when clicked, update their positions using physics every frame, and remove them when they fade out. This demonstrates **rendering algorithms** for particle effects."

## When someone asks about the Charts:
> "The charts demonstrate **2D graphics fundamentals**. The bar chart uses **rectangles** (filled areas), the line chart uses **polylines** (connected points), and the pie chart uses **arcs**. They all show how to map **data to visual representations** using **coordinate systems** where x-axis is categories and y-axis is values."

---

# ✅ SUMMARY CHECKLIST

| Topic | Sub-Topic | Covered? | Where? |
|-------|-----------|----------|--------|
| **7. 2D/3D Graphics** | Raster Graphics | ✅ | ParticleBackground, Charts |
| | Vector Graphics | ✅ | SVG icons throughout app |
| | Frame Buffer | ✅ | Canvas, WebGL |
| | Output Primitives | ✅ | Lines, Circles, Arcs |
| | 3D Coordinates | ✅ | Trophy, Robot |
| | 3D Transformations | ✅ | Rotation, Translation, Scaling |
| | 3D Pipeline | ✅ | Three.js rendering |
| | Perspective Projection | ✅ | Camera setup |
| | View Frustum | ✅ | Near/Far planes |
| **8. Animation** | Frame-Based | ✅ | All animated components |
| | Physics Animation | ✅ | CelebrationParticles |
| | Procedural Animation | ✅ | Floating/bouncing effects |
| **9. Lighting/Shading** | Light Types | ✅ | Ambient, Point, Directional |
| | Phong Model | ✅ | MeshPhongMaterial |
| | Per-Pixel Shading | ✅ | GLSL fragment shader |
| | Gouraud vs Phong | ✅ | flatShading option |
| **10. Rendering** | Pipeline | ✅ | Three.js WebGL |
| | Double Buffering | ✅ | Automatic |
| | Z-Buffer | ✅ | Depth testing |
| | Particle Systems | ✅ | Multiple components |

---

**Document Version:** 1.0
**Last Updated:** December 14, 2025
**Course:** HCI & Computer Graphics
**Project:** RoutineMate - Productivity Application
