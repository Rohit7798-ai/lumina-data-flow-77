
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cn } from '@/lib/utils';

type DataVisualizationType = 'scatter' | 'bar' | 'surface' | 'heatmap' | 'contour' | 'streamgraph';

type DataVisualizationProps = {
  data: {
    points: Array<{x: number, y: number, z: number, value: number}>,
    axisLabels: string[]
  };
  type?: DataVisualizationType;
  className?: string;
  isLoading?: boolean;
  colorScheme?: 'default' | 'rainbow' | 'heatmap' | 'cool' | 'warm';
  showAxes?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  rotationSpeed?: number;
};

const DataVisualization = ({ 
  data, 
  type = 'scatter',
  className,
  isLoading = false,
  colorScheme = 'default',
  showAxes = true,
  showGrid = true,
  showLabels = true,
  interactive = true,
  rotationSpeed = 0
}: DataVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number,
    position: THREE.Vector3,
    value: number
  } | null>(null);

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

  // Color helper function
  const getColorByScheme = (value: number, min: number, max: number) => {
    const normalizedValue = (value - min) / (max - min);
    
    switch(colorScheme) {
      case 'rainbow':
        return new THREE.Color().setHSL(normalizedValue, 0.8, 0.5);
      case 'heatmap':
        return new THREE.Color().setHSL(0.05 + (1 - normalizedValue) * 0.25, 0.8, 0.5);
      case 'cool':
        return new THREE.Color().setHSL(0.5 + normalizedValue * 0.2, 0.8, 0.5);
      case 'warm':
        return new THREE.Color().setHSL(normalizedValue * 0.15, 0.8, 0.5);
      default:
        // Purple to cyan gradient (default)
        const h = 270 - normalizedValue * 60;
        const s = 80 + normalizedValue * 20;
        const l = 50 + normalizedValue * 10;
        return new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    cleanUp();
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = viewMode === '3d' ? 5 : 7;
    camera.position.y = viewMode === '2d' ? 5 : 2;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = interactive;
    
    if (viewMode === '2d') {
      controls.enableRotate = false;
      camera.lookAt(0, 0, 0);
    } else {
      controls.enableRotate = true;
    }
    
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const oppositeLight = new THREE.DirectionalLight(0x8B5CF6, 0.3);
    oppositeLight.position.set(-1, -1, -1);
    scene.add(oppositeLight);
    
    const pointLight = new THREE.PointLight(0x00FFFF, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    // Grid setup
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(4, 10, 0x1A1F2C, 0x1A1F2C);
      gridHelper.material.opacity = 0.1;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
    }
    
    // Axes setup
    if (showAxes) {
      const axesHelper = new THREE.AxesHelper(2.5);
      (axesHelper.material as THREE.Material).opacity = 0.3;
      (axesHelper.material as THREE.Material).transparent = true;
      scene.add(axesHelper);
    }
    
    // Axis labels
    if (showLabels && data.axisLabels.length >= 3) {
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
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Moving point light for dynamic lighting
      pointLight.position.x = Math.sin(time) * 3;
      pointLight.position.z = Math.cos(time) * 3;
      
      // Auto-rotation if enabled
      if (rotationSpeed !== 0 && viewMode === '3d') {
        scene.rotation.y += rotationSpeed * 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cleanUp();
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, showAxes, showGrid, showLabels, interactive, rotationSpeed, data.axisLabels]);

  useEffect(() => {
    if (!sceneRef.current || isLoading || data.points.length === 0) return;
    
    const scene = sceneRef.current;
    
    // Clear previous visualization
    scene.children = scene.children.filter(child => 
      child instanceof THREE.AmbientLight || 
      child instanceof THREE.DirectionalLight || 
      child instanceof THREE.PointLight ||
      child instanceof THREE.GridHelper ||
      child instanceof THREE.AxesHelper ||
      child instanceof THREE.Sprite
    );
    
    // Find min/max values for color scaling
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    data.points.forEach(point => {
      minValue = Math.min(minValue, point.value);
      maxValue = Math.max(maxValue, point.value);
    });
    
    // Create appropriate visualization based on type
    if (type === 'scatter') {
      // Scatter plot
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const colors: number[] = [];
      const pointsData: { 
        position: THREE.Vector3, 
        originalIndex: number, 
        value: number 
      }[] = [];
      
      data.points.forEach((point, idx) => {
        const position = new THREE.Vector3(point.x * 2, point.y * 2, point.z * 2);
        positions.push(position.x, position.y, position.z);
        
        const color = getColorByScheme(point.value, minValue, maxValue);
        colors.push(color.r, color.g, color.b);
        
        pointsData.push({
          position,
          originalIndex: idx,
          value: point.value
        });
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
      
      // Raycaster for point interactions
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points = { threshold: 0.1 };
      
      const mouse = new THREE.Vector2();
      
      // Add mouse move event listener
      const handleMouseMove = (event: MouseEvent) => {
        if (!containerRef.current || !cameraRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObject(pointCloud);
        
        if (intersects.length > 0) {
          const intersect = intersects[0];
          const index = intersect.index as number;
          
          if (index !== undefined) {
            const pointData = pointsData[index];
            setHoveredPoint({
              index: pointData.originalIndex,
              position: pointData.position,
              value: pointData.value
            });
          }
        } else {
          setHoveredPoint(null);
        }
      };
      
      containerRef.current?.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      };
      
    } else if (type === 'bar') {
      // Bar chart
      data.points.forEach((point, index) => {
        const height = Math.abs(point.y) * 2;
        const geometry = new THREE.BoxGeometry(0.1, height, 0.1);
        
        geometry.translate(0, height / 2, 0);
        
        const color = getColorByScheme(point.value, minValue, maxValue);
        const material = new THREE.MeshPhongMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          emissive: color,
          emissiveIntensity: 0.2
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(point.x * 2, 0, point.z * 2);
        bar.castShadow = true;
        bar.receiveShadow = true;
        scene.add(bar);
      });
    } else if (type === 'surface') {
      // Surface plot
      // Group points by X and Z to form a grid
      const xValues = [...new Set(data.points.map(p => p.x))].sort((a, b) => a - b);
      const zValues = [...new Set(data.points.map(p => p.z))].sort((a, b) => a - b);
      
      if (xValues.length > 1 && zValues.length > 1) {
        const xSize = xValues.length;
        const zSize = zValues.length;
        
        const geometry = new THREE.PlaneGeometry(
          4, // width
          4, // height
          xSize - 1, // widthSegments
          zSize - 1  // heightSegments
        );
        
        // Create lookup table for data points
        const pointsMap = new Map<string, number>();
        data.points.forEach(point => {
          pointsMap.set(`${point.x},${point.z}`, point.y);
        });
        
        // Update vertices based on y values
        const positionAttribute = geometry.getAttribute('position');
        const colors = new Float32Array(positionAttribute.count * 3);
        
        for (let i = 0; i < zSize; i++) {
          for (let j = 0; j < xSize; j++) {
            const vertexIndex = i * xSize + j;
            const x = xValues[j];
            const z = zValues[i];
            const key = `${x},${z}`;
            
            if (pointsMap.has(key)) {
              const y = pointsMap.get(key) || 0;
              
              // Scale to fit our scene
              const xPos = (x / Math.max(...xValues)) * 2 - 1;
              const zPos = (z / Math.max(...zValues)) * 2 - 1;
              const yPos = y * 2;
              
              positionAttribute.setXYZ(vertexIndex, xPos, yPos, zPos);
              
              // Set color based on height
              const color = getColorByScheme(y, minValue, maxValue);
              colors[vertexIndex * 3] = color.r;
              colors[vertexIndex * 3 + 1] = color.g;
              colors[vertexIndex * 3 + 2] = color.b;
            }
          }
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhongMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          shininess: 70,
          flatShading: false,
          wireframe: false
        });
        
        const surface = new THREE.Mesh(geometry, material);
        surface.rotation.x = -Math.PI / 2;
        surface.castShadow = true;
        surface.receiveShadow = true;
        scene.add(surface);
        
        // Add wireframe overlay
        const wireframe = new THREE.WireframeGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2
        });
        const surfaceWireframe = new THREE.LineSegments(wireframe, lineMaterial);
        surfaceWireframe.rotation.x = -Math.PI / 2;
        scene.add(surfaceWireframe);
      }
    } else if (type === 'heatmap') {
      // Heatmap
      const segmentSize = 0.1;
      const planeSize = 4;
      const segments = Math.floor(planeSize / segmentSize);
      
      // Create a grid of squares
      const geometry = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const colors = new Float32Array(positionAttribute.count * 3);
      
      // Map data points to grid cells
      const gridData = new Map<string, number>();
      for (const point of data.points) {
        // Normalize x,z to [0, segments]
        const gridX = Math.floor((point.x + 1) * segments / 2);
        const gridZ = Math.floor((point.z + 1) * segments / 2);
        const key = `${gridX},${gridZ}`;
        
        if (gridData.has(key)) {
          gridData.set(key, (gridData.get(key) || 0) + point.value);
        } else {
          gridData.set(key, point.value);
        }
      }
      
      // Color the vertices based on mapped values
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const vertexIndex = i * (segments + 1) + j;
          
          // Find the closest grid cell
          const gridX = Math.floor(j);
          const gridZ = Math.floor(i);
          const key = `${gridX},${gridZ}`;
          
          if (gridData.has(key)) {
            const value = gridData.get(key) || 0;
            const color = getColorByScheme(value, minValue, maxValue);
            
            colors[vertexIndex * 3] = color.r;
            colors[vertexIndex * 3 + 1] = color.g;
            colors[vertexIndex * 3 + 2] = color.b;
          } else {
            // Default color for empty cells
            colors[vertexIndex * 3] = 0.1;
            colors[vertexIndex * 3 + 1] = 0.1;
            colors[vertexIndex * 3 + 2] = 0.2;
          }
        }
      }
      
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide
      });
      
      const heatmap = new THREE.Mesh(geometry, material);
      heatmap.rotation.x = -Math.PI / 2;
      heatmap.position.y = -0.01; // Slightly below
      scene.add(heatmap);
      
      // Add grid lines
      const gridLines = new THREE.GridHelper(planeSize, segments, 0xffffff, 0xffffff);
      gridLines.rotation.x = Math.PI / 2;
      gridLines.material.opacity = 0.1;
      gridLines.material.transparent = true;
      scene.add(gridLines);
    } else if (type === 'contour') {
      // Contour plot
      // Sort data points by value to create contour levels
      const sortedPoints = [...data.points].sort((a, b) => a.value - b.value);
      const valueRange = maxValue - minValue;
      
      // Create contour levels
      const numLevels = 10;
      const levels = Array.from({ length: numLevels }, (_, i) => 
        minValue + (valueRange * (i / (numLevels - 1)))
      );
      
      levels.forEach((level, levelIndex) => {
        const contourPoints: THREE.Vector3[] = [];
        
        // Find points close to this contour level
        sortedPoints.forEach(point => {
          if (Math.abs(point.value - level) < valueRange / (2 * numLevels)) {
            contourPoints.push(new THREE.Vector3(
              point.x * 2, 
              0.05 * levelIndex, // Small height offset for each level
              point.z * 2
            ));
          }
        });
        
        if (contourPoints.length > 1) {
          // Create a line for this contour
          const geometry = new THREE.BufferGeometry().setFromPoints(contourPoints);
          
          const levelColor = getColorByScheme(level, minValue, maxValue);
          const material = new THREE.LineBasicMaterial({
            color: levelColor,
            linewidth: 1,
            opacity: 0.7,
            transparent: true
          });
          
          const line = new THREE.Line(geometry, material);
          scene.add(line);
        }
      });
    } else if (type === 'streamgraph') {
      // Stream graph (simplified as flowing curves)
      // Group by x value
      const xValues = [...new Set(data.points.map(p => p.x))].sort((a, b) => a - b);
      
      const curves: THREE.Vector3[][] = [];
      const numCurves = 5; // Number of streamlines
      
      for (let i = 0; i < numCurves; i++) {
        const curve: THREE.Vector3[] = [];
        const zOffset = (i / (numCurves - 1) - 0.5) * 3; // Distribute curves across z-axis
        
        xValues.forEach(x => {
          // Find points with this x-value
          const pointsAtX = data.points.filter(p => p.x === x);
          const avgY = pointsAtX.reduce((sum, p) => sum + p.y, 0) / (pointsAtX.length || 1);
          
          // Add some variation based on value
          const variationY = pointsAtX.length 
            ? Math.sin((x + i) * 0.5) * (pointsAtX[0].value / maxValue) * 0.5
            : 0;
          
          curve.push(new THREE.Vector3(
            x * 2 - 1, // Scale and center x
            (avgY + variationY) * 2, // Scale y
            zOffset + Math.sin(x * 2 + i) * 0.2 // Z with some flow variation
          ));
        });
        
        curves.push(curve);
      }
      
      // Create tubes for each curve
      curves.forEach((curvePoints, i) => {
        if (curvePoints.length < 2) return;
        
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeometry = new THREE.TubeGeometry(
          curve, 
          64, // tubularSegments
          0.06 + (i / numCurves) * 0.04, // radius
          8, // radiusSegments
          false // closed
        );
        
        const color = getColorByScheme(minValue + (i / (numCurves - 1)) * valueRange, minValue, maxValue);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          transparent: true,
          opacity: 0.7,
          emissive: color,
          emissiveIntensity: 0.3,
          shininess: 70
        });
        
        const tube = new THREE.Mesh(tubeGeometry, material);
        tube.castShadow = true;
        scene.add(tube);
      });
    }
    
  }, [data, type, colorScheme, isLoading]);

  return (
    <div className={cn(
      "w-full h-[400px] rounded-xl overflow-hidden glass relative",
      isLoading && "animate-pulse",
      className
    )}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Visualization controls */}
      <div className="absolute top-2 right-2 flex flex-wrap gap-2">
        <button 
          onClick={() => setViewMode(prev => prev === '3d' ? '2d' : '3d')}
          className="px-2 py-1 text-xs bg-black/30 backdrop-blur-md rounded-md text-white/80 hover:bg-black/50 transition-colors"
        >
          {viewMode === '3d' ? '2D View' : '3D View'}
        </button>
      </div>
      
      {/* Tooltip for hovered point */}
      {hoveredPoint && (
        <div className="absolute pointer-events-none bg-black/80 text-white text-xs p-2 rounded-md backdrop-blur-md"
          style={{
            left: `${containerRef.current?.clientWidth ? 
              ((hoveredPoint.position.x / 2 + 1) / 2) * containerRef.current.clientWidth : 0}px`,
            top: `${containerRef.current?.clientHeight ? 
              ((1 - (hoveredPoint.position.y / 2 + 1) / 2)) * containerRef.current.clientHeight : 0}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          <div className="font-medium">Point {hoveredPoint.index + 1}</div>
          <div>Value: {hoveredPoint.value.toFixed(2)}</div>
          <div className="text-white/70">
            X: {(hoveredPoint.position.x / 2).toFixed(2)}, 
            Y: {(hoveredPoint.position.y / 2).toFixed(2)}, 
            Z: {(hoveredPoint.position.z / 2).toFixed(2)}
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50">Loading visualization...</div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && data.points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50">Upload data to visualize</div>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;
