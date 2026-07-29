// modulos.js - SISTEMA COMPLETO DE MÓDULOS INTERACTIVOS
// modulos.js - VERSIÓN RESPONSIVE

// ======================
// VARIABLES GLOBALES
// ======================
let modules = [];
let canvas;
let canvasWidth, canvasHeight;

// ======================
// DEBUG: Verificar electronAPI
// ======================
// DEBUG MEJORADO
console.log('=== DEBUG PRELOAD ===');
console.log('1. window.__PRELOAD_LOADED__:', window.__PRELOAD_LOADED__);
console.log('2. electronAPI:', window.electronAPI);
console.log('3. typeof electronAPI:', typeof window.electronAPI);

// Intentar llamar directamente
if (window.electronAPI && window.electronAPI.test) {
  console.log('4. Test result:', window.electronAPI.test());
} else {
  console.log('4. ❌ electronAPI.test no disponible');
}
// ======================
// SISTEMA DE SONIDOS
// ======================
let sonidos = {
    hover: null,
    click: null,
    boton: null,
    error: null
};

let sonidosCargados = false;

// ======================
// CONFIGURACIÓN P5.JS - RESPONSIVE
// ======================
function setup() {
    // Obtener tamaño del contenedor
    const container = document.getElementById('canvas-container');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    
    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    
    // Configurar módulos con posiciones relativas
    configurarModulos();
    
    // Redimensionar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', redimensionarCanvas);
}

function redimensionarCanvas() {
    const container = document.getElementById('canvas-container');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    resizeCanvas(canvasWidth, canvasHeight);
    configurarModulos(); // Reconfigurar módulos para nuevo tamaño
}

// ======================
// CONFIGURACIÓN DE MÓDULOS
// ======================
function configurarModulos() {
    // Posiciones en porcentajes relativos al canvas
    const posicionesRelativas = [
        { x: 0.125, y: 0.167 }, // 12.5% ancho, 16.7% alto
        { x: 0.25, y: 0.667 },  // 25% ancho, 66.7% alto
        { x: 0.375, y: 0.333 }, // 37.5% ancho, 33.3% alto
        { x: 0.625, y: 0.5 },   // 62.5% ancho, 50% alto
        { x: 0.75, y: 0.833 },  // 75% ancho, 83.3% alto
        { x: 0.875, y: 0.25 }   // 87.5% ancho, 25% alto
    ];

    // Radio base responsive (se adapta al tamaño)
    const radioBase = Math.min(canvasWidth, canvasHeight) * 0.04;

    modules = [
        {
            x: posicionesRelativas[0].x * canvasWidth,
            y: posicionesRelativas[0].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Biografía",
            descripcion: "Conoce nuestra historia y evolución.",
            imagen: "../assets/Logo C.png"
        },
        {
            x: posicionesRelativas[1].x * canvasWidth,
            y: posicionesRelativas[1].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Nosotros",
            descripcion: "Mira quiénes somos en la banda.",
            imagen: "../assets/Integrantes.png"
        },
        {
            x: posicionesRelativas[2].x * canvasWidth,
            y: posicionesRelativas[2].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Trayectoria",
            descripcion: "Nuestro recorrido musical.",
            imagen: "../assets/ElectroCover Post.png"
        },
        {
            x: posicionesRelativas[3].x * canvasWidth,
            y: posicionesRelativas[3].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Nuestros Covers",
            descripcion: "Escucha nuestras versiones.",
            imagen: "../assets/No voy en tren poster.png"
        },
        {
            x: posicionesRelativas[4].x * canvasWidth,
            y: posicionesRelativas[4].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Colaboración",
            descripcion: "Colaboración y Apoyo",
            imagen: "../assets/Barak.png"
        },
        {
            x: posicionesRelativas[5].x * canvasWidth,
            y: posicionesRelativas[5].y * canvasHeight,
            radius: radioBase,
            glow: 0,
            titulo: "Contactanos",
            descripcion: "Unete a Electrocover",
            imagen: "../assets/Post Electrocover.jpg"
        }
    ];
}

// ======================
// FUNCIÓN PRINCIPAL DE DIBUJO
// ======================
function draw() {
    background(10, 10, 26);
    
    // Dibujar rejilla de fondo - RESPONSIVE
    drawGrid();
    
    // Dibujar líneas animadas - RESPONSIVE
    drawAnimatedLines();
    
    // Dibujar rutas visuales - RESPONSIVE
    drawVisualPaths();
    
    // Actualizar y dibujar módulos
    updateModules();
    
    // Verificar hover para el HUD
    verificarHoverHUD();
}

// ======================
// FUNCIONES DE DIBUJO - RESPONSIVE
// ======================
function drawGrid() {
    stroke(0, 240, 255, 30);
    strokeWeight(1);
    
    // Calcular espaciado responsive
    const gridSpacing = Math.min(canvasWidth, canvasHeight) * 0.05;
    
    for (let y = 0; y < canvasHeight; y += gridSpacing) {
        line(0, y, canvasWidth, y);
    }
    
    for (let x = 0; x < canvasWidth; x += gridSpacing) {
        line(x, 0, x, canvasHeight);
    }
}

function drawAnimatedLines() {
    const numLines = Math.floor(canvasWidth * canvasHeight / 4000); // Ajustar densidad
    
    for (let i = 0; i < numLines; i++) {
        let speedFactor = 0.5;
        let noiseSpeed = 0.001;
        let x1 = (frameCount * speedFactor + i * 45) % canvasWidth;
        let y1 = noise(i * 0.1, frameCount * noiseSpeed) * canvasHeight;
        let angle = frameCount * 0.01 + i;
        let x2 = x1 + sin(angle) * (canvasWidth * 0.04);
        let y2 = y1 + cos(angle) * (canvasHeight * 0.03);
        
        stroke(0, 240, 255, 60);
        line(x1, y1, x2, y2);
        
        fill(0, 240, 255, 220);
        noStroke();
        circle(x1, y1, canvasWidth * 0.005);
        circle(x2, y2, canvasWidth * 0.002);
    }
}

function drawVisualPaths() {
    // Primera serie de rutas
    for (let i = 0; i < 3; i++) {
        let offset = i * (canvasWidth * 0.0125); // offset responsive
        drawPath([
            {x: 0, y: canvasHeight * 0.183 - offset},
            {x: canvasWidth * 0.25 + offset, y: canvasHeight * 0.183 - offset},
            {x: canvasWidth * 0.25 + offset, y: canvasHeight * 0.5 + offset},
            {x: canvasWidth * 0.5 + offset, y: canvasHeight * 0.5 + offset},
            {x: canvasWidth * 0.5 + offset, y: canvasHeight * 0.833 + offset},
            {x: canvasWidth * 0.75 + offset, y: canvasHeight * 0.833 + offset},
            {x: canvasWidth * 0.75 + offset, y: canvasHeight * 0.233 + offset},
            {x: canvasWidth + offset, y: canvasHeight * 0.233 + offset}
        ]);
    }
    
    // Segunda serie de rutas
    for (let i = 0; i < 3; i++) {
        let offset = i * (canvasWidth * 0.0125);
        drawPath([
            {x: 0, y: canvasHeight * 0.683 - offset},
            {x: canvasWidth * 0.6375 - offset, y: canvasHeight * 0.683 - offset},
            {x: canvasWidth * 0.6375 - offset, y: canvasHeight * 0.183 + offset},
            {x: canvasWidth * 0.3875 - offset, y: canvasHeight * 0.183 + offset},
            {x: canvasWidth * 0.3875 - offset, y: canvasHeight * 0.917 + offset},
            {x: canvasWidth * 0.25 - offset, y: canvasHeight * 0.917 + offset},
            {x: canvasWidth * 0.25 - offset, y: canvasHeight * 0.917 + offset},
            {x: 0, y: canvasHeight * 0.917 + offset}
        ]);
    }
    
    // Tercera serie de rutas
    for (let i = 0; i < 3; i++) {
        let offset = i * (canvasWidth * 0.0125);
        drawPath([
            {x: canvasWidth, y: canvasHeight * 0.517 - offset},
            {x: canvasWidth * 0.6375 - offset, y: canvasHeight * 0.517 - offset},
            {x: canvasWidth * 0.6375 - offset, y: canvasHeight * 0.517 + offset}
        ]);
    }
}

function drawPath(points, color = [0, 240, 255], weight = 2, glowOpacity = 60) {
    stroke(...color, glowOpacity);
    strokeWeight(weight * 2);
    noFill();
    beginShape();
    for (let pt of points) vertex(pt.x, pt.y);
    endShape();
    
    stroke(...color, 255);
    strokeWeight(weight);
    noFill();
    beginShape();
    for (let pt of points) vertex(pt.x, pt.y);
    endShape();
}

// ======================
// FUNCIONES DE SONIDO
// ======================



// ======================
// FUNCIONES DE SONIDO - MODIFICADAS
// ======================

function cargarSonidos() {
    try {
        sonidos.hover = new Audio('../assets/sounds/Gamemode Select.mp3');
        sonidos.click = new Audio('../assets/sounds/Click.mp3');
        
        // VOLUMEN ADAPTADO A NUEVO SISTEMA
        Object.values(sonidos).forEach(sonido => {
            if (sonido) {
                sonido.volume = 0.5; // ⬅️ 12% base
                sonido.preload = 'auto';
            }
        });
        
        sonidosCargados = true;
        console.log('🔊 Sonidos cargados (12% volumen base)');
        
    } catch (error) {
        console.warn('⚠️ Error cargando sonidos:', error);
        sonidosCargados = false;
    }
}

function reproducirSonido(tipo, volumenPersonalizado = null) {
    if (!sonidosCargados || !sonidos[tipo]) return;
    
    try {
        const sonido = sonidos[tipo].cloneNode();
        
        // AJUSTE AUTOMÁTICO SEGÚN ESTADO DE MÚSICA
        let volumenBase = volumenPersonalizado !== null ? volumenPersonalizado : 0.12;
        
        // Si hay gestor de estados, ajustar según estado actual
        if (window.musicStateManager) {
            const estado = window.musicStateManager.getEstado();
            
            // Sonidos más audibles cuando música está baja
            switch(estado) {
                case 'modulo':
                    volumenBase *= 0.2; // +30% en módulos
                    break;
                case 'video':
                    volumenBase *= 1.5; // +50% con video
                    break;
                case 'normal':
                    volumenBase *= 0.9; // -10% normal
                    break;
            }
        }
        
        // Limitar volumen máximo
        sonido.volume = Math.min(volumenBase, 0.4);
        
        sonido.play().catch(e => {
            // Silenciar error
        });
        
    } catch (error) {
        // Silenciar error
    }
}

// Función alternativa para cargar sonidos
function cargarSonidosAlternativos() {
    console.log('🔄 Intentando cargar sonidos alternativos...');
    
    // Usar los elementos audio del HTML como respaldo
    const sndHover = document.getElementById('snd-hover');
    const sndEnter = document.getElementById('snd-enter');
    
    if (sndHover && sndEnter) {
        sonidos.hover = sndHover;
        sonidos.click = sndEnter;
        sonidos.boton = sndEnter.cloneNode();
        sonidosCargados = true;
        console.log('✅ Sonidos cargados desde elementos HTML');
    } else {
        console.warn('⚠️ No se encontraron elementos audio en el HTML');
        sonidosCargados = false;
    }
}

// Función para reproducir sonido
function reproducirSonido(tipo, volumenPersonalizado = null) {
    if (!sonidosCargados || !sonidos[tipo]) return;
    
    try {
        const sonido = sonidos[tipo].cloneNode(); // Clonar para reproducir múltiples veces
        if (volumenPersonalizado !== null) {
            sonido.volume = volumenPersonalizado;
        }
        sonido.play().catch(e => {
            console.log('🔇 Sonido no reproducido (interacción requerida)');
        });
    } catch (error) {
        console.log('🔇 Error reproduciendo sonido:', error);
    }
}

// ======================
// GESTIÓN DE MÓDULOS
// ======================
function updateModules() {
    let hoverEnAlgunModulo = false;
    
    for (let module of modules) {
        let d = dist(mouseX, mouseY, module.x, module.y);
        let isHover = d < module.radius;
        
        // SONIDO HOVER (MANTENER)
        if (isHover && !module.estabaEnHover) {
            reproducirSonido('hover', 0.18);
        }
        
        // ⛔ ELIMINAR O COMENTAR ESTO - NO ATENUAR POR HOVER
        // if (isHover && !module.estabaEnHover) {
        //     if (window.menuHoverHandler && window.menuHoverHandler.onHoverStart) {
        //         window.menuHoverHandler.onHoverStart();
        //     }
        // }
        
        module.estabaEnHover = isHover;
        
        // Animación de glow (MANTENER)
        if (isHover && module.glow < 1) {
            gsap.to(module, { glow: 1, duration: 0.4 });
            hoverEnAlgunModulo = true;
        } else if (!isHover && module.glow > 0) {
            gsap.to(module, { glow: 0, duration: 0.6 });
        }
        
        drawModule(module);
    }
    
    return hoverEnAlgunModulo;
}

function drawModule(module) {
    // Dibujo del resplandor exterior
    noStroke();
    fill(0, 240, 255, 50 + module.glow * 100);
    circle(module.x, module.y, module.radius * 2.5 + module.glow * 15);
    
    fill(0, 240, 255, 100 + module.glow * 80);
    circle(module.x, module.y, module.radius * 2 + module.glow * 10);
    
    // Círculo central
    stroke(0, 240, 255);
    strokeWeight(3);
    fill(10 + module.glow * 10, 10 + module.glow * 10, 26 + module.glow * 10);
    circle(module.x, module.y, module.radius * 2);
    
    // Cruces internas
    stroke(0, 240, 255, 50);
    strokeWeight(1);
    line(module.x - module.radius, module.y, module.x + module.radius, module.y);
    line(module.x, module.y - module.radius, module.x, module.y + module.radius);
    
    // Puntos en los extremos
    for (let angle = 0; angle < 180; angle += 90) {
        let rad = radians(angle);
        let cx = module.x + cos(rad) * module.radius;
        let cy = module.y + sin(rad) * module.radius;
        fill(0, 240, 255, 200);
        noStroke();
        circle(cx, cy, 5);
    }
    
    // Pulso exterior animado
    let pulse = sin(frameCount * 0.05) * 10 + module.glow * 10;
    noFill();
    stroke(0, 240, 255, 100);
    strokeWeight(2);
    circle(module.x, module.y, module.radius * 2 + pulse);
}

// ======================
// SISTEMA HUD (HEADS-UP DISPLAY)
// ======================

// Función para detectar si es un dispositivo táctil
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Función para verificar si el mouse está sobre el HUD
function isMouseOverHUD() {
    const hud = document.getElementById('hud-info');
    if (!hud || !hud.classList.contains('visible')) return false;
    
    const hudRect = hud.getBoundingClientRect();
    return (
        mouseX >= hudRect.left && 
        mouseX <= hudRect.right && 
        mouseY >= hudRect.top && 
        mouseY <= hudRect.bottom
    );
}

function verificarHoverHUD() {
    let hovered = false;
    
    // En dispositivos táctiles, mostrar HUD temporalmente al tocar
    if (isTouchDevice()) {
        for (let module of modules) {
            let d = dist(mouseX, mouseY, module.x, module.y);
            if (d < module.radius) {
                hovered = true;
                mostrarHud(module);
                
                // En táctil, mantener el HUD visible por más tiempo
                clearTimeout(window.hudTimeout);
                window.hudTimeout = setTimeout(() => {
                    if (!isMouseOverHUD()) {
                        ocultarHud();
                    }
                }, 3000); // Ocultar después de 3 segundos
                break;
            }
        }
    } else {
        // Comportamiento original para mouse
        for (let module of modules) {
            let d = dist(mouseX, mouseY, module.x, module.y);
            if (d < module.radius) {
                hovered = true;
                mostrarHud(module);
                break;
            }
        }
    }
    
    if (!hovered && !isMouseOverHUD()) {
        ocultarHud();
    }
}

function mostrarHud(modulo) {
    const hud = document.getElementById('hud-info');
    const hudImg = document.getElementById('hud-img');
    const hudTitle = document.getElementById('hud-title');
    const hudDesc = document.getElementById('hud-desc');
    
    if (!hud) {
        console.error('❌ No se encontró el elemento HUD');
        return;
    }
    
    hud.classList.add('visible');
    hud.classList.remove('hidden');
    
    // Cargar imagen con manejo de errores
    if (hudImg && modulo.imagen) {
        hudImg.onerror = function() {
            console.warn('⚠️ No se pudo cargar la imagen:', modulo.imagen);
            this.style.display = 'none';
        };
        hudImg.onload = function() {
            this.style.display = 'block';
        };
        hudImg.src = modulo.imagen;
    }
    
    if (hudTitle) hudTitle.textContent = modulo.titulo || '';
    if (hudDesc) hudDesc.textContent = modulo.descripcion || '';
    
    // 🔧 Ajuste automático de posición (MEJORADO)
    const hudWidth = hud.offsetWidth || 300;
    const hudHeight = hud.offsetHeight || 200;
    const offset = 20;
    
    let left = mouseX + offset;
    let top = mouseY + offset;
    
    // Ajustes para no salirse de los bordes
    if (left + hudWidth > canvasWidth) {
        left = mouseX - hudWidth - offset;
    }
    
    if (top + hudHeight > canvasHeight) {
        top = mouseY - hudHeight - offset;
    }
    
    // Límites mínimos
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    // Límites máximos
    left = Math.min(canvasWidth - hudWidth - 10, left);
    top = Math.min(canvasHeight - hudHeight - 10, top);
    
    hud.style.left = `${left}px`;
    hud.style.top = `${top}px`;
    
    console.log(`📱 HUD mostrado: ${modulo.titulo}`);
}

function ocultarHud() {
    const hud = document.getElementById('hud-info');
    hud.classList.remove('visible');
    hud.classList.add('hidden');
}

// ======================
// MANEJO DE INTERACCIONES (ACTUALIZADO PARA TÁCTIL)
// ======================

// Variables para control de doble clic/tap
let lastTap = 0;
let tapTimeout;

function mousePressed() {
    handleModuleClick();
}

// Nueva función para manejar toques táctiles
function touchStarted() {
    handleModuleClick();
    return false; // Prevenir comportamiento por defecto
}

// Función unificada para clics y toques
function handleModuleClick() {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    // Detectar si es doble clic/tap (menos de 300ms entre toques)
    if (tapLength < 300 && tapLength > 0) {
        // Es un doble clic/tap - procesar inmediatamente
        processModuleClick();
        clearTimeout(tapTimeout);
        return;
    }
    
    // Es un clic/tap simple - esperar para ver si viene otro
    tapTimeout = setTimeout(() => {
        processModuleClick();
    }, 300);
    
    lastTap = currentTime;
}

// Función que procesa el clic en los módulos
function processModuleClick() {
    let moduloClickeado = false;
    
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        let d = dist(mouseX, mouseY, module.x, module.y);
        
        if (d < module.radius) {
            console.log(`🔘 Módulo ${i} clickeado: ${module.titulo}`);
            reproducirSonido('click', 0.25);
            moduloClickeado = true;
            
            // 🔇 CAMBIAR A ESTADO "DENTRO DE MÓDULO"
            if (window.musicStateManager && window.musicStateManager.entrarModulo) {
                window.musicStateManager.entrarModulo();
            }
            
            switch(i) {
                case 0:
                    mostrarPagina('../pages/biografia.html');
                    break;
                case 1:
                    mostrarPagina('../pages/nosotros.html');
                    break;
                case 2:
                    mostrarPagina('../pages/trayectoria.html');
                    break;
                case 3:
                    mostrarPagina('../pages/covers.html');
                    break;
                case 4:
                    mostrarPagina('../pages/barak.html');
                    break;
                case 5:
                    mostrarPagina('../pages/conexion.html');
                    break;
                default:
                    console.log('Módulo no reconocido');
                    reproducirSonido('error', 0.15);
            }
            break;
        }
    }
    
    if (!moduloClickeado) {
        reproducirSonido('error', 0.12);
    }
}

// ======================
// SISTEMA DE OVERLAY
// ======================
function mostrarPagina(pagina) {
    const overlay = document.getElementById('content-overlay');
    const contentArea = document.getElementById('content-area');
    overlay.classList.remove('hidden');
    contentArea.innerHTML = `<iframe src="${pagina}" style="width: 100%; height: 100%; border: none;"></iframe>`;
}

function mostrarMensaje(titulo, mensaje) {
    const overlay = document.getElementById('content-overlay');
    const contentArea = document.getElementById('content-area');
    overlay.classList.remove('hidden');
    contentArea.innerHTML = `
        <button id="close-btn">X</button>
        <div style="padding: 40px; text-align: center; color: white;">
            <h2 style="color: #00ffff; margin-bottom: 20px;">${titulo}</h2>
            <p style="font-size: 18px;">${mensaje}</p>
        </div>
    `;
}

function mostrarVideo(videoPath) {
    const overlay = document.getElementById('content-overlay');
    const contentArea = document.getElementById('content-area');
    overlay.classList.remove('hidden');
    contentArea.innerHTML = `
        <button id="close-btn">X</button>
        <video controls autoplay style="width: 100%; height: 100%;">
            <source src="${videoPath}" type="video/mp4">
            Tu navegador no soporta el video.
        </video>
    `;
}

// ======================
// FUNCIONES PARA BOTONES CON SONIDO
// ======================

// Función para inicializar botón con sonido
// Encuentra esta función y elimina las líneas de sonido:
function inicializarBotonConSonido(botonId, accion, tipoSonido = 'boton') {
    const boton = document.getElementById(botonId);
    
    if (!boton) {
        console.error(`❌ No se encontró el botón ${botonId}`);
        return null;
    }
    
    // Clonar botón para limpiar listeners previos
    const nuevoBoton = boton.cloneNode(true);
    boton.parentNode.replaceChild(nuevoBoton, boton);
    
    // 🔇 ELIMINA O COMENTA ESTAS LÍNEAS DE SONIDO:
    // // Reproducir sonido
    // reproducirSonido(tipoSonido, 0.4);
    
    nuevoBoton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Efecto visual (mantener si quieres)
        this.style.transform = 'scale(0.95)';
        
        // 🔇 NO REPRODUCIR SONIDO
        
        // Restaurar transformación
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Ejecutar acción
        if (typeof accion === 'function') {
            accion.call(this, e);
        }
    });
    
    // También eliminar de touchstart/touchend si existe
    nuevoBoton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.style.transform = 'scale(0.95)';
    });
    
    nuevoBoton.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.style.transform = 'scale(1)';
        // 🔇 SIN SONIDO
        if (typeof accion === 'function') {
            accion.call(this, e);
        }
    });
    
    return nuevoBoton;
}

// ======================
// INICIALIZACIÓN Y EVENTOS
// ======================
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById('content-overlay');
    const contentArea = document.getElementById('content-area');
    
    console.log('✅ Sistema de módulos inicializado');
    
    // CARGAR SONIDOS AL INICIAR
    cargarSonidos();
    
    // INICIALIZAR BOTÓN REGRESAR CON SONIDO
    inicializarBotonConSonido('btn-regresar-menu', function() {
        console.log('🔙 Navegando al menú principal...');
        window.location.href = '../index.html';
    }, 'boton');
    
    // Event delegation para el botón de cerrar
    document.addEventListener('click', function(e) {
        if (e.target.id === 'close-btn') {
            // Reproducir sonido
            reproducirSonido('boton', 0.3);
            
            // Efecto visual
            e.target.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
                overlay.classList.add('hidden');
                contentArea.innerHTML = '';
                console.log('Overlay cerrado con sonido');
            }, 150);
        }
    });

    // También cerrar al hacer clic fuera del contenido
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            reproducirSonido('boton', 0.2);
            overlay.classList.add('hidden');
            contentArea.innerHTML = '';
            console.log('Overlay cerrado (click fuera)');
        }
    });

    // Event listeners mejorados para táctiles
    if (isTouchDevice()) {
        console.log('🔄 Configurando eventos táctiles...');
        document.addEventListener('touchmove', function(e) {
            e.preventDefault(); // Prevenir scroll no deseado
        }, { passive: false });
    }

    console.log('🎮 Sistema de módulos inicializado correctamente');
});

// ======================
// COMUNICACIÓN ENTRE VENTANAS
// ======================
window.addEventListener('message', (event) => {
    // Manejar páginas de integrantes
    if (event.data.type === 'abrirPaginaIntegrante') {
        const overlay = document.getElementById('content-overlay');
        const contentArea = document.getElementById('content-area');
        overlay.classList.remove('hidden');
        contentArea.innerHTML = `
            <button id="close-btn">X</button>
            <iframe src="../pages/Integrantes/${event.data.url}" style="width:100%; height:100%; border:none;"></iframe>
        `;
        console.log(`📄 Cargando página del integrante: ${event.data.url}`);
    }
    // Manejar cierre de overlay
    else if (event.data === 'cerrarOverlay') {
        const overlay = document.getElementById('content-overlay');
        const contentArea = document.getElementById('content-area');
        console.log('📩 Mensaje recibido: cerrarOverlay');
        
        // Animación de cierre suave
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                overlay.classList.add('hidden');
                overlay.style.opacity = 1; // restaurar para próxima apertura
                contentArea.innerHTML = '';
            }
        });
    }
});