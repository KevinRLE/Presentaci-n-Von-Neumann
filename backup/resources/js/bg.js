function initParticles3D() {
    console.log('🎵 Iniciando partículas 3D MUY cercanas al logo...');
    
    const canvas = document.getElementById('background-canvas');
    if (!canvas) {
        console.error('❌ Canvas no encontrado');
        return;
    }

    // Verificar que Three.js esté cargado
    if (typeof THREE === 'undefined') {
        console.error('❌ Three.js no está cargado');
        return;
    }

    // SCENE
    const scene = new THREE.Scene();
    
    // CAMERA - MUCHO MÁS CERCANA
    const camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5; // Mucho más cerca
    
    // RENDERER
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    console.log('✅ Three.js inicializado correctamente');

    // CREAR SISTEMA DE PARTÍCULAS 3D MUY CERCANO
    const particlesCount = 2000; // Menos partículas para más cercanía
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    // RADIOS MUCHO MÁS PEQUEÑOS - partículas muy cerca del centro
    const sphereRadius = 2; // Reducido de 3 a 1.5
    const ringRadius = 1.9;   // Reducido de 2 a 1.2
    
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Distribución MUY compacta alrededor del centro
        let x, y, z;
        
        if (i % 4 === 0) {
            // Esfera interior - muy compacta
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = sphereRadius * (0.6 + Math.random() * 0.8);
            
            x = radius * Math.sin(phi) * Math.cos(theta);
            y = radius * Math.sin(phi) * Math.sin(theta);
            z = radius * Math.cos(phi);
        } else if (i % 4 === 1) {
            // Anillo ecuatorial cercano
            const angle = Math.random() * Math.PI * 2;
            const radius = ringRadius * (0.7 + Math.random() * 0.6);
            const height = (Math.random() - 0.5) * 0.8; // Muy poca altura
            
            x = Math.cos(angle) * radius;
            y = Math.sin(angle) * radius;
            z = height;
        } else if (i % 4 === 2) {
            // Anillo vertical cercano
            const angle = Math.random() * Math.PI * 2;
            const radius = ringRadius * (0.6 + Math.random() * 0.8);
            const height = (Math.random() - 0.5) * 1.0; // Poca altura
            
            x = Math.cos(angle) * radius;
            y = height;
            z = Math.sin(angle) * radius;
        } else {
            // Anillo diagonal - para llenar espacios
            const angle = Math.random() * Math.PI * 2;
            const radius = sphereRadius * (0.5 + Math.random() * 1.0);
            const tilt = Math.PI / 4; // 45 grados
            
            x = Math.cos(angle) * radius;
            y = Math.sin(angle) * Math.cos(tilt) * radius;
            z = Math.sin(angle) * Math.sin(tilt) * radius;
        }

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Colores más vibrantes para mejor contraste
        colors[i3] = 0.0 + Math.random() * 0.2;     // R - muy poco rojo
        colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G - mucho verde
        colors[i3 + 2] = 0.1 + Math.random() * 0.3; // B - algo de azul

        // Tamaños más consistentes
        sizes[i] = 0.02 + Math.random() * 0.03;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // MATERIAL con mejor visibilidad
    const material = new THREE.PointsMaterial({
        size: 0.05, // Un poco más grandes
        vertexColors: true,
        transparent: true,
        opacity: 0.8, // Máxima opacidad
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    console.log('✅ Partículas 3D creadas - MUY cercanas al logo central');

    // VARIABLES PARA ANIMACIÓN
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    // INTERACTIVIDAD CON MOUSE
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // ANIMACIÓN PRINCIPAL - más suave
    function animate() {
        requestAnimationFrame(animate);
        
        const time = clock.getElapsedTime();
        
        // Rotación automática SUAVE
        particles.rotation.x += 0.004;
        particles.rotation.y += 0.004;
        particles.rotation.z += 0.0009;
        
        // Efecto de respiración muy sutil
        const pulse = Math.sin(time * 0.2) * 0.09 + 0.97;
        particles.scale.set(pulse, pulse, pulse);
        
        // Influencia del mouse muy ligera
        particles.rotation.y += mouseX * 0.0007;
        particles.rotation.x += mouseY * 0.0007;
        
        // Animación individual de partículas - movimiento orbital suave
        const positions = geometry.attributes.position.array;
        const originalPositions = geometry.attributes.position.original;
        
        if (!originalPositions) {
            geometry.attributes.position.original = new Float32Array(positions);
        }
        
        const original = geometry.attributes.position.original;
        
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const particleTime = time + i * 0.001;
            
            // Movimiento orbital muy sutil
            const orbitSpeed = 0.2 + (i % 8) * 0.09;
            const orbitRadius = 0.02 + (i % 3) * 0.09;
            
            positions[i3] = original[i3] + Math.cos(particleTime * orbitSpeed) * orbitRadius;
            positions[i3 + 1] = original[i3 + 1] + Math.sin(particleTime * orbitSpeed) * orbitRadius;
            positions[i3 + 2] = original[i3 + 2] + Math.sin(particleTime * orbitSpeed * 0.3) * orbitRadius;
        }
        
        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    // MANEJO DE RESIZE
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    // EFECTO ESPECIAL AL HACER CLIC
    canvas.addEventListener('click', () => {
        gsap.to(particles.rotation, {
            x: particles.rotation.x + Math.PI * 0.3,
            y: particles.rotation.y + Math.PI * 0.3,
            duration: 1.5,
            ease: "power2.out"
        });
    });

    // INICIAR ANIMACIÓN
    console.log('🎬 Iniciando animación 3D con partículas muy cercanas...');
    animate();
    console.log('✅ Partículas orbitando MUY cerca del logo');
}

// ======================
// SONIDO PARA EL LOGO DE LA PÁGINA PRINCIPAL
// ======================
document.addEventListener('DOMContentLoaded', function() {
  const logo = document.getElementById("logo-navegacion");
  
  if (!logo) {
    console.log('🔍 Logo no encontrado (puede que no estemos en la página principal)');
    return;
  }
  
  console.log('🎵 Configurando sonido para el logo principal');
  
  // SONIDO para CLICK (navegación)
  const sonidoClick = new Audio("assets/sounds/Menu Botton.mp3");
  sonidoClick.volume = 0.4;
  sonidoClick.preload = "auto";
  
  // SONIDO para HOVER (opcional - si quieres)
  const sonidoHover = new Audio("assets/sounds/Menu Botton.mp3"); // Diferente sonido para hover
  sonidoHover.volume = 0.2; // Más bajo para hover
  sonidoHover.preload = "auto";
  
  // Verificar carga
  sonidoClick.addEventListener('canplay', function() {
    console.log('✅ Sonido de click cargado');
  });
  
  sonidoHover.addEventListener('canplay', function() {
    console.log('✅ Sonido de hover cargado');
  });
  
  sonidoClick.addEventListener('error', function(e) {
    console.error('❌ Error cargando sonido click:', this.src);
  });
  
  sonidoHover.addEventListener('error', function(e) {
    console.error('❌ Error cargando sonido hover:', this.src);
  });
  
  // Precargar
  sonidoClick.load();
  sonidoHover.load();
  
  // ======================
  // EVENTO HOVER (opcional)
  // ======================
  logo.addEventListener("mouseenter", function(e) {
    console.log('🖱️ Cursor sobre logo');
    
    if (sonidoHover.readyState >= 2) {
      try {
        sonidoHover.currentTime = 0;
        sonidoHover.play().catch(error => {
          // Ignorar errores de autoplay
        });
      } catch (error) {
        // Ignorar errores
      }
    }
  });
  
  // ======================
  // EVENTO CLICK (obligatorio - navegación)
  // ======================
  logo.addEventListener("click", function(e) {
    e.preventDefault();
    
    console.log('🖱️ Logo clickeado - navegando');
    
    // Reproducir sonido de click
    if (sonidoClick.readyState >= 2) {
      try {
        sonidoClick.currentTime = 0;
        const playPromise = sonidoClick.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('🔊 Sonido de click reproducido');
          }).catch(error => {
            console.log('🔇 Error de autoplay en click');
          });
        }
      } catch (error) {
        console.log('🔇 Error reproduciendo click');
      }
    }
    
    // Navegar inmediatamente
    window.location.href = "pages/modulo.html";
  });
  
  // ======================
  // PARA DISPOSITIVOS MÓVILES
  // ======================
  logo.addEventListener("touchstart", function(e) {
    e.preventDefault();
    console.log('📱 Logo tocado');
    
    // En móviles, no hay hover, solo click
    if (sonidoClick.readyState >= 2) {
      sonidoClick.currentTime = 0;
      sonidoClick.play().catch(() => {});
    }
    
    window.location.href = "pages/modulo.html";
  });
});

// INICIALIZACIÓN
function init() {
    if (typeof THREE === 'undefined') {
        setTimeout(init, 100);
        return;
    }
    setTimeout(initParticles3D, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}