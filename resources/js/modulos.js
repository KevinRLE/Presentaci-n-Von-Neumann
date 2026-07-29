// modulos.js - SISTEMA COMPLETO DE MÓDULOS INTERACTIVOS
// modulos.js - VERSIÓN RESPONSIVE

// ======================
// VARIABLES GLOBALES
// ======================
let modules = [];
let canvas;
let canvasWidth, canvasHeight;

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
    const radioBase = Math.min(canvasWidth, canvasHeight) * 0.04;

    // Proporciones para rectángulos
    const wEstandar = canvasWidth * 0.12;
    const hEstandar = canvasHeight * 0.22;

    modules = [
        {
            // 0: ALU / Registros
            x: canvasWidth * 0.18,
            y: canvasHeight * 0.30,
            w: wEstandar,
            h: hEstandar,
            glow: 0,
            titulo: "UNIDAD ARITMÉTICA",
            descripcion: "Procesamiento de datos y almacenamiento temporal.",
            imagen: "../assets/Logo C.png"
        },
        {
            // 1: Unidad de Control (Más ancha como en el diagrama)
            x: canvasWidth * 0.18,
            y: canvasHeight * 0.72,
            w: canvasWidth * 0.22,
            h: canvasHeight * 0.16,
            glow: 0,
            titulo: "UNIDAD DE CONTROL",
            descripcion: "Direccionamiento y control de flujo de instrucciones.",
            imagen: "../assets/Integrantes.png"
        },
        {
            // 2: Memoria Principal
            x: canvasWidth * 0.45,
            y: canvasHeight * 0.50,
            w: canvasWidth * 0.12,
            h: canvasHeight * 0.58,
            glow: 0,
            titulo: "MEMORIA PRINCIPAL",
            descripcion: "Almacenamiento de programas y datos activos.",
            imagen: "../assets/ElectroCover Post.png"
        },
        {
            // 3: Unidad de E/S
            x: canvasWidth * 0.68,
            y: canvasHeight * 0.50,
            w: canvasWidth * 0.08,
            h: canvasHeight * 0.70,
            glow: 0,
            titulo: "UNIDAD DE E/S",
            descripcion: "Interfaz con dispositivos periféricos.",
            imagen: "../assets/No voy en tren poster.png"
        },
        {
            // 4: Periférico 1
            x: canvasWidth * 0.86,
            y: canvasHeight * 0.30,
            w: canvasWidth * 0.11,
            h: canvasHeight * 0.12,
            glow: 0,
            titulo: "PERIFÉRICO 1",
            descripcion: "Dispositivo de Entrada / Salida.",
            imagen: "../assets/Barak.png"
        },
        {
            // 5: Periférico 2
            x: canvasWidth * 0.86,
            y: canvasHeight * 0.70,
            w: canvasWidth * 0.11,
            h: canvasHeight * 0.12,
            glow: 0,
            titulo: "PERIFÉRICO 2",
            descripcion: "Dispositivo secundario o almacenamiento.",
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
    push();
    
    // ==========================================
    // 1. CONTENEDOR ESQUEMÁTICO UCP (Forma de "L" punteada)
    // ==========================================
    stroke(0, 240, 255, 180);
    strokeWeight(2);
    noFill();
    drawingContext.setLineDash([8, 6]); // Línea punteada neón

    // Dibujar forma en L que envuelve UAP y UC
    beginShape();
    vertex(canvasWidth * 0.05, canvasHeight * 0.12); // Esquina sup-izq
    vertex(canvasWidth * 0.30, canvasHeight * 0.12); // Esquina sup-der
    vertex(canvasWidth * 0.30, canvasHeight * 0.58); // Bajada hasta antes de la Memoria
    vertex(canvasWidth * 0.41, canvasHeight * 0.58); // Extensión hacia la derecha bajo la memoria
    vertex(canvasWidth * 0.41, canvasHeight * 0.88); // Esquina inf-der
    vertex(canvasWidth * 0.05, canvasHeight * 0.88); // Esquina inf-izq
    endShape(CLOSE);

    drawingContext.setLineDash([]); // Reset a línea continua

    // Texto de etiqueta "UCP"
    noStroke();
    fill(0, 240, 255, 255);
    textSize(20);
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    text("UCP", canvasWidth * 0.175, canvasHeight * 0.11);

    // ==========================================
    // 2. FLECHAS DIAGONALES (UC -> ALU y UC -> Memoria)
    // ==========================================
    const alu = modules[0];
    const uc = modules[1];
    const mem = modules[2];
    const io = modules[3];
    const p1 = modules[4];
    const p2 = modules[5];

    // UC -> ALU (Diagonal)
    drawArrow(uc.x - uc.w * 0.2, uc.y - uc.h/2, alu.x - alu.w * 0.2, alu.y + alu.h/2, true);
    // UC -> Memoria (Diagonal)
    drawArrow(uc.x + uc.w * 0.2, uc.y - uc.h/2, mem.x - mem.w/2, mem.y + mem.h * 0.3, true);

    // ==========================================
    // 3. BUSES PRINCIPALES CON FLECHAS
    // ==========================================
    // UCP <-> Memoria
    drawArrow(alu.x + alu.w/2, alu.y, mem.x - mem.w/2, alu.y, true);
    
    // Memoria <-> E/S
    drawArrow(mem.x + mem.w/2, mem.y, io.x - io.w/2, mem.y, true);

    // E/S <-> Periféricos
    drawArrow(io.x + io.w/2, p1.y, p1.x - p1.w/2, p1.y, true);
    drawArrow(io.x + io.w/2, p2.y, p2.x - p2.w/2, p2.y, true);

    // UC <-> E/S (Bus inferior)
    drawArrow(uc.x + uc.w/2, uc.y, io.x - io.w/2, uc.y, true);

    // ==========================================
    // 4. LÍNEA DIVISORIA VERTICAL
    // ==========================================
    stroke(0, 240, 255, 80);
    strokeWeight(1);
    line(canvasWidth * 0.58, canvasHeight * 0.15, canvasWidth * 0.58, canvasHeight * 0.85);

    pop();
}

// Función auxiliar para dibujar líneas con flechas en los extremos
function drawArrow(x1, y1, x2, y2, doubleHead = false) {
    stroke(0, 240, 255, 200);
    strokeWeight(2);
    line(x1, y1, x2, y2);

    let angle = atan2(y2 - y1, x2 - x1);
    let arrowSize = 6;

    // Flecha en punto final
    push();
    translate(x2, y2);
    rotate(angle);
    fill(0, 240, 255);
    triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
    pop();

    // Flecha en punto inicial (si es bidireccional)
    if (doubleHead) {
        push();
        translate(x1, y1);
        rotate(angle + PI);
        fill(0, 240, 255);
        triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2);
        pop();
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
// Detección de Hover basada en límites rectangulares (Bounding Box)
function updateModules() {
    let hoverEnAlgunModulo = false;
    
    for (let module of modules) {
        let isHover = mouseX >= module.x - module.w/2 && 
                      mouseX <= module.x + module.w/2 && 
                      mouseY >= module.y - module.h/2 && 
                      mouseY <= module.y + module.h/2;
        
        if (isHover && !module.estabaEnHover) {
            reproducirSonido('hover', 0.18);
        }
        
        module.estabaEnHover = isHover;
        
        if (isHover && module.glow < 1) {
            gsap.to(module, { glow: 1, duration: 0.3 });
            hoverEnAlgunModulo = true;
        } else if (!isHover && module.glow > 0) {
            gsap.to(module, { glow: 0, duration: 0.5 });
        }
        
        drawModule(module);
    }
    
    return hoverEnAlgunModulo;
}

// Dibujo del bloque/módulo estilo Von Neumann
function drawModule(module) {
    rectMode(CENTER);
    
    // 1. Resplandor Exterior (Glow)
    noStroke();
    fill(0, 240, 255, 20 + module.glow * 60);
    rect(module.x, module.y, module.w + 12, module.h + 12, 6);
    
    // 2. Fondo del Bloque
    stroke(0, 240, 255, 180 + module.glow * 75);
    strokeWeight(2 + module.glow * 2);
    fill(10 + module.glow * 15, 15 + module.glow * 15, 30 + module.glow * 20);
    rect(module.x, module.y, module.w, module.h, 4);
    
    // 3. Texto del Bloque (Título)
    noStroke();
    fill(0, 240, 255, 220 + module.glow * 35);
    textSize(Math.min(module.w * 0.08, 13));
    textStyle(BOLD);

    if (module.titulo.includes("CONTROL")) {
        // Para la Unidad de Control: Alineado a la izquierda sin salirse del bloque
        textAlign(LEFT, CENTER);
        let textoX = module.x - module.w * 0.42;
        text("UNIDAD DE CONTROL", textoX, module.y);
    } else if (module.titulo.includes("ARITMÉTICA")) {
        // Para la Unidad Aritmética: Desplazado hacia abajo para no colisionar con REGISTROS
        textAlign(CENTER, CENTER);
        text("UNIDAD ARITMÉTICA", module.x, module.y + module.h * 0.2, module.w - 10, module.h * 0.4);
    } else {
        // Para los demás módulos
        textAlign(CENTER, CENTER);
        text(module.titulo, module.x, module.y, module.w - 10, module.h - 10);
    }
    
    // 4. Muescas tácticas en las esquinas (Detalle Cyberpunk)
    stroke(0, 240, 255, 255);
    strokeWeight(2);
    let cornerSize = 6;
    // Esquina Superior Izquierda
    line(module.x - module.w/2, module.y - module.h/2 + cornerSize, module.x - module.w/2, module.y - module.h/2);
    line(module.x - module.w/2, module.y - module.h/2, module.x - module.w/2 + cornerSize, module.y - module.h/2);
    // Esquina Inferior Derecha
    line(module.x + module.w/2, module.y + module.h/2 - cornerSize, module.x + module.w/2, module.y + module.h/2);
    line(module.x + module.w/2, module.y + module.h/2, module.x + module.w/2 - cornerSize, module.y + module.h/2);

    // --- Elementos Estáticos Internos ---
    if (module.titulo.includes("ARITMÉTICA")) {
        // Rejilla de REGISTROS estática en la parte superior del módulo
        push();
        stroke(0, 240, 255, 180);
        strokeWeight(1);
        noFill();
        let regW = module.w * 0.6;
        let regH = module.h * 0.25;
        let regX = module.x - regW/2;
        let regY = module.y - module.h/2 + 12;

        rect(regX + regW/2, regY + regH/2, regW, regH);
        // Dibujar divisiones de los registros
        for(let i = 1; i < 4; i++) {
            let yLine = regY + (regH / 4) * i;
            line(regX, yLine, regX + regW, yLine);
        }
        
        noStroke();
        fill(0, 240, 255, 200);
        textSize(9);
        textAlign(CENTER, BOTTOM);
        text("REGISTROS", module.x, regY - 2);
        pop();
    }

    if (module.titulo.includes("CONTROL")) {
        // Cajita estática del Program Counter (PC)
        push();
        stroke(0, 240, 255, 180);
        strokeWeight(1);
        noFill();
        let pcW = module.w * 0.20;
        let pcH = module.h * 0.45;
        // Posicionada en la parte derecha de la caja para que el texto de la izquierda respire
        let pcX = module.x + module.w/2 - pcW/2 - 12;
        let pcY = module.y;

        rectMode(CENTER);
        rect(pcX, pcY, pcW, pcH, 2);
        
        noStroke();
        fill(0, 240, 255, 220);
        textSize(10);
        textAlign(CENTER, CENTER);
        text("PC", pcX, pcY);
        pop();
    }
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
        
        if (mouseX >= module.x - module.w/2 && 
            mouseX <= module.x + module.w/2 && 
            mouseY >= module.y - module.h/2 && 
            mouseY <= module.y + module.h/2) {
            console.log(`🔘 Módulo ${i} clickeado: ${module.titulo}`);
            reproducirSonido('click', 0.25);
            moduloClickeado = true;
            
            // 🔇 CAMBIAR A ESTADO "DENTRO DE MÓDULO"
            if (window.musicStateManager && window.musicStateManager.entrarModulo) {
                window.musicStateManager.entrarModulo();
            }
            
            switch(i) {
                case 0:
                    mostrarPagina('../pages/ALU.html');
                    break;
                case 1:
                    mostrarPagina('../pages/UnidadControl.html');
                    break;
                case 2:
                    mostrarPagina('../pages/MemoriaPrincipal.html');
                    break;
                case 3:
                    mostrarPagina('../pages/UnidadES.html');
                    break;
                case 4:
                    mostrarPagina('../pages/Periferico1.html');
                    break;
                case 5:
                    mostrarPagina('../pages/Periferico2.html');
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