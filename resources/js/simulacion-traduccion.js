document.addEventListener('DOMContentLoaded', () => {

  const TOTAL_CELDAS = 100;
  const TAMANIO_PAGINA = 10;
  const grid = document.getElementById('sim-matriz-grid');
  
  const elDirLogica = document.getElementById('sim-dir-logica');
  const elIR = document.getElementById('sim-ir');
  const elFase = document.getElementById('sim-fase');
  const elP1 = document.getElementById('mmu-p1');
  const elP2 = document.getElementById('mmu-p2');
  const elOffset = document.getElementById('mmu-offset');
  const elFrame = document.getElementById('mmu-frame');
  const elDirFisica = document.getElementById('mmu-dir-fisica');
  const elAsm = document.getElementById('sim-asm');
  const elBin = document.getElementById('sim-bin');
  const elAccion = document.getElementById('sim-accion-desc');

  const btnStep = document.getElementById('sim-btn-step');
  const btnPlay = document.getElementById('sim-btn-play');
  const btnReset = document.getElementById('sim-btn-reset');
  const btnRandom = document.getElementById('sim-btn-random');
  const selectSpeed = document.getElementById('sim-speed');

  const DICCIONARIO_OPCODES = {
    'LDA': { hex: '0xA1', bin: '10100001' },
    'LDB': { hex: '0xA2', bin: '10100010' },
    'ADD': { hex: '0xB1', bin: '10110001' },
    'SUB': { hex: '0xB2', bin: '11000010' },
    'STC': { hex: '0xC1', bin: '11000001' },
    'HLT': { hex: '0xFF', bin: '11111111' }
  };

  let memoriaRAM = {};
  let tablaPaginasNivel2 = {};
  let dirVirtualPC = 0;
  let faseActual = 0; 
  let timerInterval = null;
  let celdaPreviaDOM = null;

  function traducirMMU(direccionVirtual) {
    const p1 = Math.floor(direccionVirtual / 50);
    const p2 = Math.floor((direccionVirtual % 50) / TAMANIO_PAGINA);
    const offset = direccionVirtual % TAMANIO_PAGINA;
    const paginaVirtual = Math.floor(direccionVirtual / TAMANIO_PAGINA);
    
    const marcoFisico = tablaPaginasNivel2[paginaVirtual] ?? paginaVirtual;
    const direccionFisica = (marcoFisico * TAMANIO_PAGINA) + offset;

    return { p1, p2, offset, marcoFisico, direccionFisica };
  }

// 1. GENERACIÓN DE PROGRAMA CON PROCESOS DE FONDO (SO Y OTROS PROGRAMAS)
  function generarProgramaAleatorio() {
    memoriaRAM = {};
    tablaPaginasNivel2 = {};

    // Simular que el Sistema Operativo y otros procesos ocupan marcos aleatorios
    const procesosExternos = ['SO_Kernel', 'Browser_Process', 'Spotify_Daemon', 'Discord_Worker'];
    const marcosDisponibles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

    // Reservar 3 marcos aleatorios para el sistema y otros procesos
    const marcosOcupados = marcosDisponibles.splice(0, 3);
    marcosOcupados.forEach(marco => {
      const procNombre = procesosExternos[Math.floor(Math.random() * procesosExternos.length)];
      for (let offset = 0; offset < TAMANIO_PAGINA; offset++) {
        const dirFisica = (marco * TAMANIO_PAGINA) + offset;
        memoriaRAM[dirFisica.toString().padStart(2, '0')] = {
          contenido: 'RESERV',
          tipo: 'ocupado_externo',
          proceso: procNombre,
          estado: 'Ocupado (Otro Proceso)'
        };
      }
    });

    // Mapear las páginas virtuales de NUESTRO proceso en los marcos libres restantes
    for (let i = 0; i < 7; i++) {
      tablaPaginasNivel2[i] = marcosDisponibles[i];
    }

    // Ubicación de variables
    const vDirDato1 = Math.floor(Math.random() * 15) + 20; 
    const vDirDato2 = Math.floor(Math.random() * 15) + 35; 
    const vDirDestino = Math.floor(Math.random() * 15) + 50; 

    const val1 = Math.floor(Math.random() * 20) + 1;
    const val2 = Math.floor(Math.random() * 20) + 1;
    const opMath = Math.random() > 0.5 ? 'ADD' : 'SUB';

    // Guardar Instrucciones
    // Definimos la secuencia de direcciones virtuales salteadas
    const insts = [
      { vDir: 0,  contenido: `LDA vDir:${vDirDato1}`, op: 'LDA', refVDir: vDirDato1, siguienteVDir: 12 },
      { vDir: 12, contenido: `LDB vDir:${vDirDato2}`, op: 'LDB', refVDir: vDirDato2, siguienteVDir: 25 },
      { vDir: 25, contenido: opMath,                 op: opMath,                    siguienteVDir: 53 },
      { vDir: 53, contenido: `STC vDir:${vDirDestino}`,op: 'STC', refVDir: vDirDestino, siguienteVDir: 71 },
      { vDir: 71, contenido: 'HLT',                  op: 'HLT',                     siguienteVDir: null }
    ];

    insts.forEach(ins => {
      const t = traducirMMU(ins.vDir);
      memoriaRAM[t.direccionFisica.toString().padStart(2, '0')] = {
        contenido: ins.contenido, 
        tipo: 'instruccion', 
        op: ins.op, 
        refVDir: ins.refVDir,
        siguienteVDir: ins.siguienteVDir,
        proceso: 'MiPrograma.exe', 
        estado: 'Ocupado (Instrucción)'
      };
    });

    // Guardar Datos
    const tD1 = traducirMMU(vDirDato1);
    memoriaRAM[tD1.direccionFisica.toString().padStart(2, '0')] = {
      contenido: `DAT:${val1}`, tipo: 'dato', valorNum: val1,
      proceso: 'MiPrograma.exe', estado: 'Ocupado (Dato)'
    };

    const tD2 = traducirMMU(vDirDato2);
    memoriaRAM[tD2.direccionFisica.toString().padStart(2, '0')] = {
      contenido: `DAT:${val2}`, tipo: 'dato', valorNum: val2,
      proceso: 'MiPrograma.exe', estado: 'Ocupado (Dato)'
    };

    resetearEstado();
  }

  // 2. SISTEMA DE INSPECCIÓN POR CLIC EN CELDA (MODAL)
  const modal = document.getElementById('sim-modal');
  const modalDir = document.getElementById('modal-dir');
  const modalEstado = document.getElementById('modal-estado');
  const modalProceso = document.getElementById('modal-proceso');
  const modalContenido = document.getElementById('modal-contenido');
  const modalClose = document.getElementById('modal-btn-close');

  grid.addEventListener('click', (e) => {
    const celda = e.target.closest('.mp2-celda');
    if (!celda) return;

    const dirStr = celda.dataset.dir;
    const datos = memoriaRAM[dirStr];

    modalDir.textContent = `Celda RAM: ${dirStr}`;
    
    if (datos) {
      modalEstado.textContent = datos.estado || 'Ocupado';
      modalEstado.style.color = datos.tipo === 'ocupado_externo' ? '#ff5555' : '#00ffaa';
      modalProceso.textContent = datos.proceso || 'MiPrograma.exe';
      modalContenido.textContent = datos.contenido;
    } else {
      modalEstado.textContent = 'Libre (Disponible)';
      modalEstado.style.color = '#a78bfa';
      modalProceso.textContent = 'Ninguno';
      modalContenido.textContent = '00000000 (Vacío)';
    }

    modal.style.display = 'flex';
  });

  modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  function renderizarMatriz() {
    grid.innerHTML = '';
    for (let i = 0; i < TOTAL_CELDAS; i++) {
      const dirStr = i.toString().padStart(2, '0');
      const celdaData = memoriaRAM[dirStr];

      const div = document.createElement('div');
      div.className = 'mp2-celda';
      div.dataset.dir = dirStr;

      if (celdaData) {
        div.classList.add(`mp2-celda-${celdaData.tipo}`);
        div.innerHTML = `<span class="mp2-dir">${dirStr}</span><span class="mp2-val">${celdaData.contenido}</span>`;
      } else {
        div.classList.add('mp2-celda-libre');
        div.innerHTML = `<span class="mp2-dir">${dirStr}</span><span class="mp2-val">00</span>`;
      }

      grid.appendChild(div);
    }
  }

  function avanzarPaso() {
    const t = traducirMMU(dirVirtualPC);
    const dirFisicaStr = t.direccionFisica.toString().padStart(2, '0');
    const celdaDOM = document.querySelector(`.mp2-celda[data-dir="${dirFisicaStr}"]`);
    const datoMemoria = memoriaRAM[dirFisicaStr];

    if (celdaPreviaDOM) celdaPreviaDOM.classList.remove('seleccionada');

    // FASE 0: FETCH
    if (faseActual === 0) {
      elFase.textContent = 'FETCH & MMU';
      elFase.style.color = '#00f0ff';

      elDirLogica.textContent = `vDir: ${dirVirtualPC.toString().padStart(2, '0')}`;
      elP1.textContent = `P1:${t.p1}`;
      elP2.textContent = `P2:${t.p2}`;
      elOffset.textContent = `+${t.offset}`;
      elFrame.textContent = `Marco ${t.marcoFisico}`;
      elDirFisica.textContent = `RAM ${dirFisicaStr}`;

      if (celdaDOM) {
        celdaDOM.classList.add('seleccionada', 'visitada'); // MARCA PERMANENTE
        celdaPreviaDOM = celdaDOM;
      }

      if (datoMemoria && datoMemoria.tipo === 'instruccion') {
        elIR.textContent = datoMemoria.contenido;
        elAccion.textContent = `[MMU] vDir:${dirVirtualPC} ➔ RAM:${dirFisicaStr} (Marco ${t.marcoFisico}). Lectura de instrucción.`;
      } else {
        elAccion.textContent = `[FETCH] Fin de secuencia o celda vacía.`;
        detenerAuto();
        return;
      }

      faseActual = 1;
    }
    
    // FASE 1: DECODE
    else if (faseActual === 1) {
      elFase.textContent = 'DECODE';
      elFase.style.color = '#ff8c00';

      const op = datoMemoria.op;
      const dec = DICCIONARIO_OPCODES[op] || { hex: '0x00', bin: '00000000' };

      elAsm.textContent = datoMemoria.contenido;
      elBin.textContent = `${dec.hex} (${dec.bin})`;
      elAccion.textContent = `[DECODE] Traduciendo '${op}' a Binario ${dec.bin}.`;

      faseActual = 2;
    }

    // FASE 2: EXECUTE
    else if (faseActual === 2) {
      elFase.textContent = 'EXECUTE';
      elFase.style.color = '#00ffaa';

      elAccion.textContent = `[EXECUTE] Procesando '${datoMemoria.contenido}'.`;

      // Si accede a otra dirección para leer o escribir dato
      if (datoMemoria.refVDir !== undefined) {
        const tRef = traducirMMU(datoMemoria.refVDir);
        const refFisicaStr = tRef.direccionFisica.toString().padStart(2, '0');
        const celdaRef = document.querySelector(`.mp2-celda[data-dir="${refFisicaStr}"]`);
        
        if (celdaRef) {
          if (datoMemoria.op === 'STC') {
            celdaRef.classList.add('modificada');
          } else {
            celdaRef.classList.add('visitada');
          }
        }
      }

      if (datoMemoria.op === 'HLT') {
        elAccion.textContent = '🛑 [HALT] Ejecución finalizada con éxito.';
        detenerAuto();
        return;
      }

      // 🎯 ACTUALIZACIÓN CORRECTA DEL PC PARA EL SIGUIENTE PASO
      if (datoMemoria.siguienteVDir !== undefined && datoMemoria.siguienteVDir !== null) {
        dirVirtualPC = datoMemoria.siguienteVDir;
      } else {
        dirVirtualPC++;
      }

      faseActual = 0;
    }
  }

  function iniciarAuto() {
    detenerAuto();
    const ms = parseInt(selectSpeed.value, 10);
    btnPlay.textContent = '⏸ Pausa';
    timerInterval = setInterval(avanzarPaso, ms);
  }

  function detenerAuto() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      btnPlay.textContent = '▶ Auto';
    }
  }

  function resetearEstado() {
    detenerAuto();
    dirVirtualPC = 0;
    faseActual = 0;
    elDirLogica.textContent = 'vDir: 00';
    elIR.textContent = '—';
    elP1.textContent = '-';
    elP2.textContent = '-';
    elOffset.textContent = '-';
    elFrame.textContent = '-';
    elDirFisica.textContent = '-';
    elAsm.textContent = '—';
    elBin.textContent = '—';
    elFase.textContent = 'FETCH';
    elAccion.textContent = 'Memoria limpia. Selecciona velocidad e inicia.';
    renderizarMatriz();
  }

  btnStep.addEventListener('click', () => { detenerAuto(); avanzarPaso(); });
  btnPlay.addEventListener('click', () => {
    if (timerInterval) detenerAuto();
    else iniciarAuto();
  });

  selectSpeed.addEventListener('change', () => {
    if (timerInterval) iniciarAuto(); // Reajusta velocidad al vuelo
  });

  btnReset.addEventListener('click', resetearEstado);
  btnRandom.addEventListener('click', generarProgramaAleatorio);

  generarProgramaAleatorio();
});