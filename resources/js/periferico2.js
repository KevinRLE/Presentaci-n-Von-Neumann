// PERIFÉRICO 2 - MONITOR (Salida / Videojuego)

document.addEventListener('DOMContentLoaded', function() {
    'use strict';


    const periChip = document.getElementById('periChip');
    const canvas = document.getElementById('gameScreen');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const monitorLed = document.getElementById('monitorLed');
    const gpuMode = document.getElementById('gpuMode');
    const gpuFps = document.getElementById('gpuFps');
    const gpuPixels = document.getElementById('gpuPixels');

    const sceneSelect = document.getElementById('sceneSelect');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (!canvas || !ctx) {
        console.error('❌ No se encontró el canvas del monitor');
        return;
    }

    // ===== VARIABLES DE ESTADO =====
    let animationId = null;
    let running = true;
    let currentScene = 'space';
    let speed = 5;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    let fps = 0;
    let pixelsDrawn = 0;

    // Variables de las escenas
    let stars = [];
    let waveOffset = 0;

    const W = canvas.width;
    const H = canvas.height;

    // ===== INICIALIZAR ESCENAS =====
    function initSpace() {
        stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: Math.random() * 2.5 + 0.5,
                speed: Math.random() * 3 + 0.5
            });
        }
    }

    function initWave() {
        waveOffset = 0;
    }

    // ===== DIBUJAR ESCENAS =====

    // Escena 1: ESPACIO
    function drawSpace() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        stars.forEach(star => {
            star.y += star.speed * (speed / 5);
            if (star.y > H) {
                star.y = 0;
                star.x = Math.random() * W;
            }

            // Estela
            ctx.fillStyle = `rgba(0, 212, 255, ${0.2 + star.size / 4})`;
            ctx.fillRect(star.x, star.y - 4, star.size, star.size * 3);

            // Punto brillante
            ctx.fillStyle = `rgba(200, 240, 255, ${0.6 + star.size / 5})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
            pixelsDrawn += 2;
        });
    }

    // Escena 2: ONDA
    function drawWave() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        waveOffset += 0.05 * (speed / 5);

        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            const color = ['#00d4ff', '#a78bfa', '#00ff88'][w];
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;

            for (let x = 0; x < W; x++) {
                const y = H / 2 +
                    Math.sin(x * 0.015 + waveOffset + w) * 50 +
                    Math.sin(x * 0.04 + waveOffset * 1.5) * 25;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                pixelsDrawn++;
            }
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }

    function gameLoop(timestamp) {
        if (!running) return;

        // Actualizar FPS
        frameCount++;
        if (timestamp - lastFpsUpdate >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsUpdate = timestamp;
            gpuFps.textContent = fps;
        }

        // Resetear contador de píxeles
        pixelsDrawn = 0;

        // Dibujar escena actual
        switch (currentScene) {
            case 'space': drawSpace(); break;
            case 'wave': drawWave(); break;
        }

        // Actualizar info
        gpuPixels.textContent = pixelsDrawn.toLocaleString();

        animationId = requestAnimationFrame(gameLoop);
    }

    // ===== Controles =====

    // Cambiar escena
    sceneSelect.addEventListener('change', function() {
        currentScene = this.value;
        gpuMode.textContent = this.options[this.selectedIndex].text;

        if (currentScene === 'space') initSpace();
        if (currentScene === 'wave') initWave();

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        statusText.textContent = `🎮 Escena: ${this.options[this.selectedIndex].text}`;
        console.log(`🎨 Escena cambiada a: ${currentScene}`);
    });

    // Velocidad
    speedRange.addEventListener('input', function() {
        speed = parseInt(this.value);
        speedValue.textContent = speed;
    });

    // Pausar/Reanudar
    pauseBtn.addEventListener('click', function() {
        running = !running;
        if (running) {
            this.textContent = '⏸️ Pausar';
            animationId = requestAnimationFrame(gameLoop);
            monitorLed.classList.add('active');
            statusText.textContent = '▶️ Reproduciendo...';
            statusDot.className = 'status-dot active';
        } else {
            this.textContent = '▶️ Reanudar';
            cancelAnimationFrame(animationId);
            monitorLed.classList.remove('active');
            statusText.textContent = '⏸️ Pausado';
            statusDot.className = 'status-dot';
        }
    });

    // Reiniciar
    resetBtn.addEventListener('click', function() {
        if (currentScene === 'space') initSpace();
        if (currentScene === 'wave') initWave();

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        statusText.textContent = '🔄 Escena reiniciada';
        console.log('🔄 Escena reiniciada');
    });

    initSpace();
    gpuMode.textContent = '🚀 Espacio';
    monitorLed.classList.add('active');
    statusDot.className = 'status-dot active';
    statusText.textContent = '✅ GPU enviando video al monitor';

    setTimeout(function() {
        periChip.classList.add('active');
        animationId = requestAnimationFrame(gameLoop);
        console.log('🖥️ Monitor iniciado ✅');
    }, 500);


    // SISTEMA DE TABS
    const tabs = document.querySelectorAll('.btn-peri-tab');
    const panels = document.querySelectorAll('.peri-panel-content');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('activo'));
            this.classList.add('activo');

            panels.forEach(p => p.classList.remove('activo'));
            const targetPanel = document.querySelector(`.peri-panel-content[data-panel="${this.dataset.tab}"]`);
            if (targetPanel) targetPanel.classList.add('activo');
        });
    });

  //Boton de regreso
    const btnRegresar = document.getElementById('btn-regresar-modulos');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    // ANIMACIONES GSAP
    try {
        if (typeof gsap !== 'undefined') {
            gsap.from("header", {
                y: -60, opacity: 0, duration: 1.2, ease: "power2.out"
            });
            gsap.from(".peri-tabs", {
                y: 30, opacity: 0, duration: 0.8, delay: 0.3, ease: "power2.out"
            });
        }
    } catch (e) {
        console.log('GSAP no disponible');
    }

    //CLEANUP
    window.addEventListener('beforeunload', function() {
        if (animationId) cancelAnimationFrame(animationId);
    });
});