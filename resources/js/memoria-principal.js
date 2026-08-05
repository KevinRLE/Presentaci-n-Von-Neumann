// memoria-principal.js
// Lógica interactiva del módulo "Memoria Principal" (Pantalla 1: Introducción)

document.addEventListener('DOMContentLoaded', () => {

  // ======================
  // NAVEGACIÓN ENTRE PANTALLAS (1 / 2)
  // ======================
  const screenDots = document.querySelectorAll('.mp-screen-dot');
  const pantallas = document.querySelectorAll('.mp-pantalla');

  screenDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const num = dot.getAttribute('data-screen');

      screenDots.forEach(d => d.classList.remove('activo'));
      dot.classList.add('activo');

      pantallas.forEach(p => {
        p.hidden = p.id !== `pantalla-${num}`;
      });
    });
  });

  // ======================
  // SISTEMA DE TABS / PANEL
  // ======================
  const tabButtons = document.querySelectorAll('.mp-tab-btn');
  const panels = document.querySelectorAll('.mp-panel-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('activo');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('activo');
      btn.setAttribute('aria-selected', 'true');

      panels.forEach(p => {
        p.classList.toggle('activo', p.getAttribute('data-panel') === target);
      });

      // Al salir de la pestaña "video", pausamos cualquier reproducción
      if (target !== 'video') {
        const iframe = document.querySelector('.mp-video-frame iframe');
        if (iframe) {
          const src = iframe.src;
          iframe.src = src; // reinicia/pausa el embed
        }
      }
    });
  });

  // ======================
  // MINI QUIZ (5 preguntas)
  // ======================
  const preguntas = document.querySelectorAll('.mp-pregunta');
  const btnVerificar = document.getElementById('mp-btn-verificar');
  const btnReintentar = document.getElementById('mp-btn-reintentar');
  const resultado = document.getElementById('mp-resultado');
  const resultadoPuntaje = document.getElementById('mp-resultado-puntaje');
  const resultadoMensaje = document.getElementById('mp-resultado-mensaje');

  const respuestas = new Array(preguntas.length).fill(null);

  preguntas.forEach((pregunta, idx) => {
    const opciones = pregunta.querySelectorAll('.mp-opcion');
    opciones.forEach(opcion => {
      opcion.addEventListener('click', () => {
        // Si el quiz ya fue verificado, no permitir cambios
        if (btnVerificar && btnVerificar.disabled) return;

        opciones.forEach(o => o.classList.remove('seleccionada'));
        opcion.classList.add('seleccionada');
        respuestas[idx] = opcion;
      });
    });
  });

  function calcularMensaje(puntaje, total) {
    if (puntaje === total) {
      return '¡Excelente! Dominas por completo el funcionamiento de la Memoria Principal. 🧠⚡';
    } else if (puntaje >= Math.ceil(total * 0.6)) {
      return '¡Buen trabajo! Tienes una buena base, repasa los detalles que fallaste.';
    } else {
      return 'Sigue repasando las secciones "¿Qué es?" y "¿Cómo funciona?" para reforzar el tema.';
    }
  }

  if (btnVerificar) {
    btnVerificar.addEventListener('click', () => {
      // Verificar que todas las preguntas tengan respuesta
      const sinResponder = respuestas.findIndex(r => r === null);
      if (sinResponder !== -1) {
        preguntas[sinResponder].scrollIntoView({ behavior: 'smooth', block: 'center' });
        preguntas[sinResponder].style.borderColor = '#ff4d6d';
        setTimeout(() => {
          preguntas[sinResponder].style.borderColor = '';
        }, 900);
        return;
      }

      let puntaje = 0;

      preguntas.forEach((pregunta, idx) => {
        const opciones = pregunta.querySelectorAll('.mp-opcion');
        const seleccionada = respuestas[idx];
        const esCorrecta = seleccionada.getAttribute('data-correcta') === 'true';

        if (esCorrecta) puntaje++;

        opciones.forEach(opcion => {
          opcion.disabled = true;
          if (opcion.getAttribute('data-correcta') === 'true') {
            opcion.classList.add('correcta');
          } else if (opcion === seleccionada) {
            opcion.classList.add('incorrecta');
          }
        });
      });

      resultadoPuntaje.textContent = `${puntaje} / ${preguntas.length}`;
      resultadoMensaje.textContent = calcularMensaje(puntaje, preguntas.length);
      resultado.classList.add('mostrar');
      resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      btnVerificar.disabled = true;
      btnVerificar.style.display = 'none';
      btnReintentar.style.display = 'inline-block';
    });
  }

  if (btnReintentar) {
    btnReintentar.addEventListener('click', () => {
      respuestas.fill(null);

      preguntas.forEach(pregunta => {
        const opciones = pregunta.querySelectorAll('.mp-opcion');
        opciones.forEach(opcion => {
          opcion.disabled = false;
          opcion.classList.remove('seleccionada', 'correcta', 'incorrecta');
        });
      });

      resultado.classList.remove('mostrar');
      btnVerificar.disabled = false;
      btnVerificar.style.display = 'inline-block';
      btnReintentar.style.display = 'none';

      document.querySelector('.mp-panel').scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ======================================================
  // PANTALLA 2: MATRIZ DE MEMORIA INTERACTIVA
  // ======================================================

  const grid = document.getElementById('mp2-grid');
  if (!grid) return; // seguridad por si la sección no existe

  // ---------- Modelo de memoria (100 direcciones: 00-99) ----------
  // 'libre' por defecto; se sobreescriben las direcciones ocupadas.
  //
  // IMPORTANTE: en JS, un objeto con claves tipo "10","11"..."99" las
  // reordena automáticamente como si fueran índices numéricos (van antes
  // que "00"-"09", que sí se tratan como texto por el cero a la izquierda).
  // Por eso mantenemos un arreglo `direcciones` aparte, en el orden real
  // 00→99, y SIEMPRE recorremos ese arreglo (nunca Object.keys(memoria))
  // para dibujar la matriz o iterar en orden.
  const TOTAL_DIRECCIONES = 100;
  const direcciones = Array.from({ length: TOTAL_DIRECCIONES }, (_, i) => i.toString().padStart(2, '0'));
  const memoria = {};

  direcciones.forEach(dir => {
    memoria[dir] = { tipo: 'libre', etiqueta: '000', contenido: 'Vacío' };
  });

  // Pequeño "programa" cargado en las primeras direcciones (00-09)
  const programa = [
    { etiqueta: 'LDA', contenido: 'LOAD A' },
    { etiqueta: 'LDB', contenido: 'LOAD B' },
    { etiqueta: 'ADD', contenido: 'ADD A, B' },
    { etiqueta: 'STC', contenido: 'STORE C' },
    { etiqueta: 'LDC', contenido: 'LOAD C' },
    { etiqueta: 'CMP', contenido: 'CMP C, 50' },
    { etiqueta: 'JZ',  contenido: 'JZ 09' },
    { etiqueta: 'SUB', contenido: 'SUB C, B' },
    { etiqueta: 'JMP', contenido: 'JMP 04' },
    { etiqueta: 'HLT', contenido: 'HALT' }
  ];
  programa.forEach((instr, idx) => {
    const dir = idx.toString().padStart(2, '0');
    memoria[dir] = { tipo: 'instruccion', etiqueta: instr.etiqueta, contenido: instr.contenido };
  });

  // Datos de ejemplo en las direcciones 20-29
  const datosEjemplo = [15, 42, 7, 99, 3, 128, 56, 8, 21, 64];
  datosEjemplo.forEach((valor, idx) => {
    const dir = (20 + idx).toString().padStart(2, '0');
    memoria[dir] = { tipo: 'dato', etiqueta: String(valor), contenido: String(valor) };
  });

  // Algunos datos sueltos adicionales, dispersos por la memoria
  const datosDispersos = { '50': 0, '77': 255, '90': 12 };
  Object.entries(datosDispersos).forEach(([dir, valor]) => {
    memoria[dir] = { tipo: 'dato', etiqueta: String(valor), contenido: String(valor) };
  });

  // ---------- Construcción de la matriz en el DOM ----------
  let celdaSeleccionada = null;

  direcciones.forEach(dir => {
    const info = memoria[dir];

    const celda = document.createElement('button');
    celda.type = 'button';
    celda.className = `mp2-celda ${info.tipo}`;
    celda.setAttribute('data-dir', dir);
    celda.setAttribute('role', 'gridcell');
    celda.setAttribute('aria-label', `Dirección ${dir}`);

    const spanDir = document.createElement('span');
    spanDir.className = 'mp2-dir';
    spanDir.textContent = dir;

    const spanCont = document.createElement('span');
    spanCont.className = 'mp2-cont';
    spanCont.textContent = info.tipo === 'libre' ? '000' : info.etiqueta;

    celda.appendChild(spanDir);
    celda.appendChild(spanCont);

    celda.addEventListener('click', () => seleccionarDireccion(dir, celda));

    grid.appendChild(celda);
  });

  // ---------- Panel lateral: mostrar info de la dirección ----------
  const placeholder = document.getElementById('mp2-placeholder');
  const datosPanel = document.getElementById('mp2-datos');
  const elDireccion = document.getElementById('mp2-dato-direccion');
  const elContenido = document.getElementById('mp2-dato-contenido');
  const elTipo = document.getElementById('mp2-dato-tipo');
  const elEstado = document.getElementById('mp2-dato-estado');
  const elExplicacion = document.getElementById('mp2-dato-explicacion');
  const elDirActual = document.getElementById('mp2-dir-actual');

  function explicacionPara(info) {
    if (info.tipo === 'instruccion') {
      return 'Esta dirección contiene una instrucción que posteriormente será leída por la CPU.';
    }
    if (info.tipo === 'dato') {
      return 'Esta dirección almacena un dato que podrá ser utilizado por un programa.';
    }
    return 'Esta dirección aún no contiene datos ni instrucciones.';
  }

  function seleccionarDireccion(dir, celda) {
    if (celdaSeleccionada) celdaSeleccionada.classList.remove('seleccionada');
    celda.classList.add('seleccionada');
    celdaSeleccionada = celda;

    const info = memoria[dir];

    placeholder.hidden = true;
    datosPanel.hidden = false;

    elDireccion.textContent = dir;
    elContenido.textContent = info.tipo === 'libre' ? 'Vacío' : info.contenido;

    elTipo.textContent = info.tipo === 'instruccion' ? 'Instrucción' : (info.tipo === 'dato' ? 'Dato' : '—');
    elTipo.className = info.tipo === 'instruccion' ? 'tipo-instruccion' : (info.tipo === 'dato' ? 'tipo-dato' : '');

    const ocupada = info.tipo !== 'libre';
    elEstado.textContent = ocupada ? 'Ocupada' : 'Libre';
    elEstado.className = ocupada ? 'estado-ocupada' : 'estado-libre';

    elExplicacion.textContent = explicacionPara(info);

    elDirActual.textContent = dir;
  }

  // ---------- Estadísticas de simulación (memoria ocupada) ----------
  const elOcupada = document.getElementById('mp2-ocupada');

  function calcularOcupacion() {
    const ocupadas = Object.values(memoria).filter(c => c.tipo !== 'libre').length;
    const porcentaje = Math.round((ocupadas / TOTAL_DIRECCIONES) * 100);
    if (elOcupada) elOcupada.textContent = `${porcentaje}%`;
  }

  calcularOcupacion();

  // Exponer el modelo para que los próximos controles de simulación
  // (Play / Paso a paso / Reiniciar) puedan reutilizarlo.
  window.mpMemoria = memoria;
  window.mpSeleccionarDireccion = seleccionarDireccion;

});