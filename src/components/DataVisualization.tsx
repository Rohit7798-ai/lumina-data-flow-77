
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from '@/lib/utils';

type DataVisualizationType = 'scatter' | 'bar' | 'surface';

type DataVisualizationProps = {
  data: {
    points: Array<{x: number, y: number, z: number, value: number}>,
    axisLabels: string[]
  };
  type?: DataVisualizationType;
  className?: string;
  isLoading?: boolean;
};

const DataVisualization = ({ 
  data, 
  type = 'scatter',
  className,
  isLoading = false 
}: DataVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up Three.js resources
  const cleanUp = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    
    if (sceneRef.current) {
      sceneRef.current.clear();
    }
    
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up previous scene if it exists
    cleanUp();
    
    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Add soft ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add a light on the opposite side
    const oppositeLight = new THREE.DirectionalLight(0x8B5CF6, 0.3);
    oppositeLight.position.set(-1, -1, -1);
    scene.add(oppositeLight);
    
    // Add a soft point light that will move
    const pointLight = new THREE.PointLight(0x00FFFF, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    // Grid helper (subtle)
    const gridHelper = new THREE.GridHelper(4, 10, 0x1A1F2C, 0x1A1F2C);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add axes labels
    const createAxisLabel = (text: string, position: THREE.Vector3, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(1, 0.25, 1);
      scene.add(sprite);
    };
    
    // Add subtle axes
    const axesHelper = new THREE.AxesHelper(2.5);
    (axesHelper.material as THREE.Material).opacity = 0.3;
    (axesHelper.material as THREE.Material).transparent = true;
    scene.add(axesHelper);
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Animate point light
      const time = Date.now() * 0.001;
      pointLight.position.x = Math.sin(time) * 3;
      pointLight.position.z = Math.cos(time) * 3;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      cleanUp();
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update visualization when data changes
  useEffect(() => {
    if (!sceneRef.current || isLoading || data.points.length === 0) return;
    
    const scene = sceneRef.current;
    
    // Remove any existing data points
    scene.children = scene.children.filter(child => 
      child instanceof THREE.AmbientLight || 
      child instanceof THREE.DirectionalLight || 
      child instanceof THREE.PointLight ||
      child instanceof THREE.GridHelper ||
      child instanceof THREE.AxesHelper
    );
    
    // Add axis labels
    if (data.axisLabels.length >= 3) {
      const createAxisLabel = (text: string, position: THREE.Vector3) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(0.5, 0.125, 1);
        scene.add(sprite);
      };
      
      createAxisLabel(data.axisLabels[0], new THREE.Vector3(2.7, 0, 0));
      createAxisLabel(data.axisLabels[1], new THREE.Vector3(0, 2.7, 0));
      createAxisLabel(data.axisLabels[2], new THREE.Vector3(0, 0, 2.7));
    }
    
    // Find min/max values for normalization
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    data.points.forEach(point => {
      minValue = Math.min(minValue, point.value);
      maxValue = Math.max(maxValue, point.value);
    });
    
    const valueRange = maxValue - minValue;
    
    // Create a color function based on point value
    const getColor = (value: number) => {
      const normalizedValue = valueRange ? (value - minValue) / valueRange : 0.5;
      
      // Generate a color based on value (blue -> purple -> pink)
      const h = 270 - normalizedValue * 60; // 270 (blue/purple) to 210 (pink)
      const s = 80 + normalizedValue * 20; // 80% to 100%
      const l = 50 + normalizedValue * 10; // 50% to 60%
      
      return `hsl(${h}, ${s}%, ${l}%)`;
    };
    
    // Create different visualizations based on type
    if (type === 'scatter') {
      // Create point cloud for scatter plot
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const colors: number[] = [];
      
      data.points.forEach(point => {
        positions.push(point.x * 2, point.y * 2, point.z * 2);
        
        // Convert hex color to RGB values
        const color = new THREE.Color(getColor(point.value));
        colors.push(color.r, color.g, color.b);
      });
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });
      
      const pointCloud = new THREE.Points(geometry, material);
      scene.add(pointCloud);
      
    } else if (type === 'bar') {
      // Create 3D bars
      data.points.forEach((point, index) => {
        const height = Math.abs(point.y) * 2;
        const geometry = new THREE.BoxGeometry(0.1, height, 0.1);
        
        // Position the bar at the bottom
        geometry.translate(0, height / 2, 0);
        
        const color = getColor(point.value);
        const material = new THREE.MeshPhongMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          emissive: color,
          emissiveIntensity: 0.2
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(point.x * 2, 0, point.z * 2);
        scene.add(bar);
      });
    }
    
  }, [data, type, isLoading]);

  return (
    <div className={cn(
      "w-full h-[400px] rounded-xl overflow-hidden glass",
      isLoading && "animate-pulse",
      className
    )}>
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50">Loading visualization...</div>
        </div>
      )}
      {!isLoading && data.points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50">Upload data to visualize</div>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;
