
// PERIFÉRICO 1 - TECLADO (Entrada)

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    
    const lastKey = document.getElementById('lastKey');
    const asciiValue = document.getElementById('asciiValue');
    const bitsBinary = document.getElementById('bitsBinary');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const periChip = document.getElementById('periChip');
    const keys = document.querySelectorAll('.key');

    if (!periChip) return;

    //Funciones
    function toBinary8bit(value) {
        return (value & 0xFF).toString(2).padStart(8, '0').split('').map(Number);
    }

    function renderBits(container, value, className = '') {
        if (!container) return;
        const bits = toBinary8bit(value);
        const children = container.children;
        for (let i = 0; i < 8 && i < children.length; i++) {
            const bit = bits[i];
            children[i].textContent = bit;
            children[i].className = `bit ${className} ${bit === 1 ? 'on' : 'off'}`;
        }
    }

    function procesarTecla(key) {
        if (!key || key.length === 0) return;

        const ascii = key.charCodeAt(0);
        const binary = toBinary8bit(ascii);

        // Animación de procesamiento
        periChip.classList.remove('active');
        statusDot.className = 'status-dot';
        statusText.textContent = '⏳ Procesando...';

        setTimeout(function() {
            // Actualizar pantalla
            lastKey.textContent = key === ' ' ? 'ESPACIO' : key.toUpperCase();
            lastKey.style.color = '#00d4ff';

            // Actualizar ASCII
            asciiValue.textContent = ascii;
            asciiValue.style.color = '#a78bfa';

            // Actualizar binario
            renderBits(bitsBinary, ascii, '');

            // Estado
            periChip.classList.add('active');
            statusDot.className = 'status-dot active';
            statusText.textContent = `✅ Tecla "${key.toUpperCase()}" enviada a la CPU`;

            console.log(`⌨️ Tecla: "${key}" | ASCII: ${ascii} | Binario: ${binary.join('')}`);
        }, 200);
    }

    //Eventos

    // Teclado virtual (clic)
    keys.forEach(function(key) {
        key.addEventListener('click', function() {
            this.style.background = 'rgba(0, 212, 255, 0.3)';
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.background = '';
                this.style.transform = '';
            }, 150);

            procesarTecla(this.dataset.key);
        });
    });

    // Teclado físico
    document.addEventListener('keydown', function(e) {
        if (e.key.length === 1) {
            e.preventDefault();

            const keyElement = document.querySelector(`.key[data-key="${e.key.toUpperCase()}"]`);
            if (keyElement) {
                keyElement.style.background = 'rgba(0, 212, 255, 0.3)';
                keyElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    keyElement.style.background = '';
                    keyElement.style.transform = '';
                }, 150);
            }

            procesarTecla(e.key);
        }
    });

    //Iniciacion
    renderBits(bitsBinary, 0, '');
    statusText.textContent = '⌨️ Esperando tecla...';

    console.log('⌨️ Periférico 1 (Teclado) inicializado ✅');

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

    // BOTÓN REGRESAR
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
});