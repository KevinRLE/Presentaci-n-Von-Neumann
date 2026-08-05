// NOSOTROS.JS - VERSIÓN SIN REQUIRE
console.log('🚀 Nosotros.js cargado');

// Función para determinar si estamos en .exe
function isPackaged() {
  return window.location.href.includes('app.asar') || 
         navigator.userAgent.includes('Electron');
}

// Función para rutas
function getImagePath(filename) {
  if (isPackaged()) {
    // En .exe: usar ruta relativa desde root
    return `../assets/ElectroC/${filename}`;
  } else {
    // En desarrollo: desde pages/ necesitamos subir un nivel
    const currentPath = window.location.pathname;
    if (currentPath.includes('pages/') || currentPath.includes('modulo.html')) {
      return `../assets/ElectroC/${filename}`;
    } else {
      return `../assets/ElectroC/${filename}`;
    }
  }
}

function getIntegrantePage(filename) {
  if (window.location.href.includes('app.asar')) {
    // En .exe: estructura plana
    return `../Integrantes/${filename}`;
  } else {
    // En desarrollo: desde pages/nosotros.html
    return `../Integrantes/${filename}`; // O `../Integrantes/${filename}` si es necesario
  }
}
// CONFIG INTEGRANTES
// USO:
const CONFIG_INTEGRANTES = [
  {
    id: 1,
    nombre: "Diego Moré",
    rol: "Vocalista & Productora",
    imagenBW: getImagePath("r2.png"),
    imagenColor: getImagePath("r2.jpg"),
    pagina: getIntegrantePage("DiegoMore.html")  // ← FUNCIÓN
  },
  {
    id: 2,
    nombre: "Max DJ",
    rol: "DJ & Synth Artist",
    imagenBW: getImagePath("m2.png"),
    imagenColor: getImagePath("m2.jpg"),
    pagina: getIntegrantePage("MaxDJ.html")
  },
  {
    id: 3,
    nombre: "Kevin",
    rol: "Visual Artist & Diseñadora",
    imagenBW: getImagePath("k2.png"),
    imagenColor: getImagePath("k2.jpg"),
    pagina: getIntegrantePage("Kevin.html")
  }
];

// DEBUG
console.log('🔍 Config Nosotros:');
console.log('isPackaged:', isPackaged());
console.log('Rutas generadas:');
CONFIG_INTEGRANTES.forEach(int => {
  console.log(`${int.nombre}:`, {
    bw: int.imagenBW,
    color: int.imagenColor
  });
});

// El resto de tu código (funciones) queda igual...
// ======================
// 1. SISTEMA DE PARTÍCULAS 3D
// ======================

function inicializarParticulas() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) {
        console.log('Canvas no encontrado, continuando sin partículas...');
        return;
    }

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;
        
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Crear partículas
        const particulasGeometria = new THREE.BufferGeometry();
        const cuentaParticulas = 800;
        const posiciones = new Float32Array(cuentaParticulas * 3);

        for (let i = 0; i < cuentaParticulas * 3; i++) {
            posiciones[i] = (Math.random() - 0.5) * 15;
        }

        particulasGeometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));

        const materialParticulas = new THREE.PointsMaterial({
            size: 0.025,
            color: 0x1900FF,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const sistemaParticulas = new THREE.Points(particulasGeometria, materialParticulas);
        scene.add(sistemaParticulas);

        // Animación
        function animarParticulas() {
            requestAnimationFrame(animarParticulas);
            sistemaParticulas.rotation.x += 0.0002;
            sistemaParticulas.rotation.y += 0.0003;
            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animarParticulas();
        console.log('✅ Partículas 3D inicializadas');
    } catch (error) {
        console.log('❌ Error en partículas, continuando sin ellas:', error);
    }
}

// ======================
// 2. CREACIÓN Y ANIMACIÓN DE TARJETAS - COMPORTAMIENTO CORREGIDO
// ======================

function crearTarjetasIntegrantes() {
    const contenedor = document.getElementById('contenedor-integrantes');
    if (!contenedor) {
        console.error('Contenedor de integrantes no encontrado');
        return;
    }

    console.log('🎨 Creando tarjetas de integrantes...');

    // Crear HTML para cada integrante
    CONFIG_INTEGRANTES.forEach(integrante => {
        const tarjetaHTML = `
            <div class="tarjeta-integrante estado-inicial" data-id="${integrante.id}" data-pagina="${integrante.pagina}">
                <div class="contenedor-tarjeta">
                    <div class="cara frontal">
                        <img src="${integrante.imagenBW}" alt="${integrante.nombre}" 
                             onerror="manejarErrorImagen(this, '${integrante.nombre}')" />
                    </div>
                    <div class="cara trasera">
                        <img src="${integrante.imagenColor}" alt="${integrante.nombre}" 
                             onerror="manejarErrorImagen(this, '${integrante.nombre}', '${integrante.rol}')" />
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHTML;
    });

    // Configurar animación de despliegue
    setTimeout(animarDespliegueTarjetas, 300);
}

function manejarErrorImagen(img, nombre, rol = '') {
    const contenidoAlternativo = rol 
        ? `<div style="color:#00ffff; font-size:1.2rem; text-align:center; padding:20px; display:flex; flex-direction:column; justify-content:center; height:100%;">${nombre}<br><small style="font-size:0.9rem; color:#b3f0ff; margin-top:10px;">${rol}</small></div>`
        : `<div style="color:#00ffff; font-size:1.2rem; text-align:center; padding:20px; display:flex; align-items:center; justify-content:center; height:100%;">${nombre}</div>`;
    
    img.style.display = 'none';
    img.parentNode.innerHTML = contenidoAlternativo;
}

function animarDespliegueTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-integrante');

  if (tarjetas.length === 0) return;

  // Animación suave horizontal con GSAP
  gsap.fromTo(tarjetas, 
    { opacity: 0, y: 40, scale: 0.8 },
    { 
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.3,
      ease: "power3.out"
    }
  );

  configurarEventosClick();
}


function configurarEventosClick() {
    const tarjetas = document.querySelectorAll('.tarjeta-integrante');
    
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const pagina = this.getAttribute('data-pagina');
            const id = this.getAttribute('data-id');
            
            console.log(`🖱️ Click en tarjeta ${id}, navegando a: ${pagina}`);
            
            if (pagina) {
                // Efecto visual al hacer click
                gsap.to(this, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        navegarAPaginaIntegrante(pagina, id);
                    }
                });
            }
        });

        // Efecto hover mejorado - SIN MOVIMIENTO VERTICAL
        tarjeta.addEventListener('mouseenter', function() {
            if (this.classList.contains('animada')) {
                gsap.to(this, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        tarjeta.addEventListener('mouseleave', function() {
            if (this.classList.contains('animada')) {
                gsap.to(this, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    });
}

function navegarAPaginaIntegrante(pagina, idIntegrante) {
    console.log(`🚀 Navegando a página de integrante: ${pagina}`);
    
    if (window.parent !== window) {
        window.parent.postMessage({ 
            type: 'abrirPaginaIntegrante',
            url: pagina,
            integranteId: idIntegrante
        }, '*');
    } else {
        alert(`Navegando a: ${pagina}\n\n(En desarrollo - Esta página se creará después)`);
    }
}

// ======================
// 3. SISTEMA DE NAVEGACIÓN - CORREGIDO PARA OVERLAY
// ======================

function inicializarNavegacion() {
    const btnRegresar = document.getElementById('btn-regresar-modulos');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', function() {
            console.log('🔙 Botón regresar clickeado');
            
            // Si la página está dentro de un iframe (overlay)
            if (window.parent !== window) {
                console.log('📨 Enviando mensaje para cerrar overlay al padre');
                window.parent.postMessage('cerrarOverlay', '*');
            } else {
                // Si no está dentro de un iframe (por prueba directa)
                console.log('🌐 Cerrando pestaña directamente');
                window.close();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', inicializarNavegacion);



// ======================
// 4. INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Inicializando página Nosotros...');
    console.log('🔍 Elementos disponibles:', {
        canvas: !!document.getElementById('background-canvas'),
        contenedor: !!document.getElementById('contenedor-integrantes'),
        btnRegresar: !!document.getElementById('btn-regresar-modulos')
    });
    
    // Pequeño delay para asegurar DOM completo
    setTimeout(() => {
        inicializarParticulas();
        crearTarjetasIntegrantes();
        inicializarNavegacion();
        
        // Efecto de escritura
        const subtitulo = document.querySelector('.subtitulo');
        if (subtitulo) {
            const textoOriginal = subtitulo.textContent;
            subtitulo.textContent = '';
            
            let i = 0;
            const efectoEscritura = setInterval(() => {
                if (i < textoOriginal.length) {
                    subtitulo.textContent += textoOriginal.charAt(i);
                    i++;
                } else {
                    clearInterval(efectoEscritura);
                }
            }, 60);
        }
        
        console.log('✅ Página Nosotros inicializada correctamente');
    }, 100);
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('❌ Error global:', e.error);
});

// LÓGICA DE SIMULACIÓN UC & MMU
document.addEventListener('DOMContentLoaded', () => {
  const btnGenerar = document.getElementById('btn-generar-dir');
  const btnPasoMMU = document.getElementById('btn-paso-mmu');
  const btnForzarSwap = document.getElementById('btn-forzar-swap');
  
  const inputDirVirtual = document.getElementById('dir-virtual');
  const txtEstadoUC = document.getElementById('uc-estado');
  const txtDirFisica = document.getElementById('dir-fisica-res');
  const bloqueSwap = document.getElementById('bloque-swap');
  const txtSwapEstado = document.getElementById('txt-swap-estado');

  // 1. UC Genera dirección virtual aleatoria
  btnGenerar?.addEventListener('click', () => {
    const randomBin = Array.from({length: 11}, () => Math.round(Math.random())).join('');
    inputDirVirtual.value = randomBin;
    txtEstadoUC.textContent = 'Estado: Dirección enviada a la MMU';
    txtEstadoUC.style.color = '#00ffff';
  });

  // 2. MMU Traduce a Dirección Física en RAM
  btnPasoMMU?.addEventListener('click', () => {
    const dirVirt = inputDirVirtual.value;
    // Simulación de adición del Marco de Memoria
    const marco = "4005"; 
    txtDirFisica.textContent = `${marco}${dirVirt.slice(-6)}`;
    txtEstadoUC.textContent = 'Estado: Traducción exitosa -> RAM';
    txtEstadoUC.style.color = '#00ff88';
    
    bloqueSwap.className = 'bloque-memoria swap-inactivo';
    txtSwapEstado.textContent = 'Inactivo (Sin fallo de página)';
  });

  // 3. Simulación de Error / Page Fault / Invocación de Swap
    btnForzarSwap?.addEventListener('click', () => {
    txtEstadoUC.textContent = '⚠️ Error: Fallo de Página (Solicitando nueva dirección a la UC...)';
    txtEstadoUC.style.color = '#ff0055';
    
    txtDirFisica.textContent = 'Acceso Denegado en RAM';
    bloqueSwap.className = 'bloque-memoria swap-alerta';
    txtSwapEstado.textContent = '🚨 SWAP ACTIVO: Transfiriendo datos al Disco Duro (Memoria Virtual)';
    });
});