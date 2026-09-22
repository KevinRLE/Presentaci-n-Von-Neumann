/* =========================================================================
   simulacion-grafica.js
   SIMULACIÓN GRÁFICA E INTERACTIVA DEL MODELO DE VON NEUMANN
   -------------------------------------------------------------------------
   · Se dibuja ENCIMA del modelo que ya dibuja modulos.js (no lo modifica).
   · Envuelve las funciones globales draw() / mousePressed() de p5.js.
   · Todo su estado vive dentro de este IIFE, con prefijo sg-/SG.
   · Historia simulada (combina las dos ideas del proyecto):
        FASE 1  El usuario abre Word con el mouse -> el programa se carga en RAM
        FASE 2  Ciclo de instrucción: búsqueda, decodificación y ejecución
                de ENTRADA 12 (el usuario escribe una letra en el teclado)
        FASE 3  La ALU procesa el contador de caracteres
        FASE 4  El resultado sale por la unidad de E/S hacia la pantalla
   ========================================================================= */

(function () {
    'use strict';

    // =====================================================================
    // 1. ESTADO
    // =====================================================================
    const SG = {
        activa: false,
        corriendo: false,
        modo: 'auto',          // 'auto' = reproduce solo | 'manual' = paso a paso
        idx: 0,                // paso actual
        t: 0,                  // milisegundos transcurridos dentro del paso
        efectoHecho: false,
        pasos: [],

        // "Estado del computador" que se muestra en pantalla
        pc: '—',
        ir: '—',
        acum: '—',
        memoria: {},           // dirección -> { txt, tipo }
        celdasActivas: [],     // direcciones resaltadas
        resaltados: [],        // componentes resaltados en el paso actual
        dispositivos: [],      // dispositivos (mouse/teclado/monitor) resaltados
        pantalla: '',          // lo que se ve en el monitor simulado

        drawOriginal: null,
        mousePressedOriginal: null,
        touchStartedOriginal: null
    };

    const DUR_PAQUETE = 950;   // ms que tarda un paquete en recorrer un bus
    const DUR_ESPERA  = 1150;  // ms de pausa al terminar la animación del paso

    const COLORES = {
        base:    [0, 240, 255],    // cian del proyecto
        activo:  [0, 255, 170],    // verde del proyecto
        dato:    [255, 209, 102],  // datos
        control: [255, 140, 0],    // señales de control (igual que el módulo memoria)
        instr:   [179, 136, 255]   // instrucciones
    };

    // Programa "Word" simplificado que se cargará en memoria
    const PROGRAMA = [
        { dir: 0,  txt: 'ENTRADA 12', tipo: 'instr' },
        { dir: 1,  txt: 'CARGAR 13',  tipo: 'instr' },
        { dir: 2,  txt: 'SUMAR 1',    tipo: 'instr' },
        { dir: 3,  txt: 'GUARDAR 13', tipo: 'instr' },
        { dir: 4,  txt: 'SALIDA 12',  tipo: 'instr' },
        { dir: 5,  txt: 'PARAR',      tipo: 'instr' },
        { dir: 12, txt: '···',        tipo: 'dato'  },
        { dir: 13, txt: '0',          tipo: 'dato'  }
    ];

    const TOTAL_CELDAS = 16;

    // =====================================================================
    // 2. GUION DE LA SIMULACIÓN
    // =====================================================================
    function construirPasos() {
        return [
            // ---------------- FASE 1: CARGA DEL PROGRAMA ----------------
            {
                fase: 'FASE 1 · CARGA DEL PROGRAMA',
                titulo: 'El usuario abre Microsoft Word',
                accion: 'Se hace doble clic sobre el icono del programa.',
                componente: 'Mouse (periférico de entrada) → Periférico 1',
                info: 'Una señal eléctrica que representa el clic.',
                despues: 'El periférico entregará esa señal a la Unidad de E/S.',
                resaltar: ['p1'],
                dispositivos: ['mouse'],
                paquetes: [{ de: 'mouse', a: 'p1', etiqueta: 'clic', color: 'dato' }]
            },
            {
                fase: 'FASE 1 · CARGA DEL PROGRAMA',
                titulo: 'La señal llega a la Unidad de E/S y luego a la CPU',
                accion: 'La Unidad de E/S traduce la señal del periférico a un formato que la CPU entiende y avisa a la Unidad de Control.',
                componente: 'Periférico 1 → Unidad de E/S → Unidad de Control',
                info: 'Petición: «abrir el programa Word».',
                despues: 'La Unidad de Control decidirá qué hacer con esa petición.',
                resaltar: ['p1', 'io', 'uc'],
                paquetes: [
                    { de: 'p1', a: 'io', etiqueta: 'señal de clic', color: 'dato' },
                    { de: 'io', a: 'uc', etiqueta: 'abrir Word',    color: 'control' }
                ]
            },
            {
                fase: 'FASE 1 · CARGA DEL PROGRAMA',
                titulo: 'La Unidad de Control ordena leer el programa',
                accion: 'La UC envía una señal de control para que el programa se lea del almacenamiento secundario.',
                componente: 'Unidad de Control → Unidad de E/S → Periférico 2 (disco)',
                info: 'Orden de lectura + ubicación del archivo Word.exe.',
                despues: 'El disco entregará el programa a la Unidad de E/S.',
                resaltar: ['uc', 'io', 'p2'],
                paquetes: [
                    { de: 'uc', a: 'io', etiqueta: 'orden: leer',  color: 'control' },
                    { de: 'p2', a: 'io', etiqueta: 'Word.exe',     color: 'instr'   }
                ]
            },
            {
                fase: 'FASE 1 · CARGA DEL PROGRAMA',
                titulo: 'El programa se copia en la memoria principal',
                accion: 'Las instrucciones y los datos del programa se escriben en direcciones de la RAM.',
                componente: 'Unidad de E/S → Memoria principal',
                info: 'Instrucciones (direcciones 00–05) y datos (12–13).',
                despues: 'Ya en memoria, la CPU podrá leer el programa instrucción por instrucción.',
                resaltar: ['io', 'mem'],
                paquetes: [{ de: 'io', a: 'mem', etiqueta: 'instrucciones + datos', color: 'instr' }],
                efecto: function () {
                    PROGRAMA.forEach(function (c) {
                        SG.memoria[c.dir] = { txt: c.txt, tipo: c.tipo };
                    });
                }
            },
            {
                fase: 'FASE 1 · CARGA DEL PROGRAMA',
                titulo: 'La CPU se prepara para ejecutar',
                accion: 'La Unidad de Control coloca en el Contador de Programa (PC) la dirección de la primera instrucción.',
                componente: 'Unidad de Control (registro PC)',
                info: 'PC = 00.',
                despues: 'Comienza el ciclo de instrucción: búsqueda, decodificación y ejecución.',
                resaltar: ['uc'],
                efecto: function () { SG.pc = '00'; }
            },

            // ---------------- FASE 2: CICLO DE INSTRUCCIÓN ----------------
            {
                fase: 'FASE 2 · CICLO DE INSTRUCCIÓN',
                titulo: 'BÚSQUEDA: la CPU trae la instrucción de la memoria',
                accion: 'La UC pone la dirección del PC en el bus de direcciones; la memoria devuelve su contenido por el bus de datos.',
                componente: 'Unidad de Control ↔ Memoria principal',
                info: 'Dirección 00 → instrucción «ENTRADA 12».',
                despues: 'La instrucción se guarda en el registro de instrucción (IR) y el PC avanza.',
                resaltar: ['uc', 'mem'],
                celdas: [0],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 00', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'ENTRADA 12',   color: 'instr' }
                ],
                efecto: function () { SG.ir = 'ENTRADA 12'; SG.pc = '01'; }
            },
            {
                fase: 'FASE 2 · CICLO DE INSTRUCCIÓN',
                titulo: 'DECODIFICACIÓN: la UC interpreta la instrucción',
                accion: 'La Unidad de Control analiza el código de la instrucción y determina qué unidad debe actuar.',
                componente: 'Unidad de Control (decodificador)',
                info: '«ENTRADA 12» = leer un dato del periférico de entrada y guardarlo en la dirección 12.',
                despues: 'La UC enviará la orden de lectura a la Unidad de E/S.',
                resaltar: ['uc']
            },
            {
                fase: 'FASE 2 · CICLO DE INSTRUCCIÓN',
                titulo: 'EJECUCIÓN: se pide un dato al periférico de entrada',
                accion: 'La UC envía por el bus de control la orden de leer el teclado y el sistema queda a la espera.',
                componente: 'Unidad de Control → Unidad de E/S → Periférico 1',
                info: 'Señal de control: «esperar entrada del usuario».',
                despues: 'El usuario escribirá un carácter en el teclado.',
                resaltar: ['uc', 'io', 'p1'],
                dispositivos: ['teclado'],
                paquetes: [{ de: 'uc', a: 'io', etiqueta: 'leer entrada', color: 'control' }]
            },
            {
                fase: 'FASE 2 · CICLO DE INSTRUCCIÓN',
                titulo: 'El usuario escribe la letra «A»',
                accion: 'El teclado convierte la pulsación en un código binario y lo entrega al sistema.',
                componente: 'Teclado → Periférico 1 → Unidad de E/S',
                info: 'Carácter «A» = 01000001 (65 en decimal).',
                despues: 'La Unidad de E/S enviará ese dato a la memoria.',
                resaltar: ['p1', 'io'],
                dispositivos: ['teclado'],
                paquetes: [
                    { de: 'teclado', a: 'p1', etiqueta: 'tecla A',     color: 'dato' },
                    { de: 'p1',      a: 'io', etiqueta: '01000001',    color: 'dato' }
                ]
            },
            {
                fase: 'FASE 2 · CICLO DE INSTRUCCIÓN',
                titulo: 'El dato se almacena en la memoria principal',
                accion: 'El carácter recibido se escribe en la dirección indicada por la instrucción.',
                componente: 'Unidad de E/S → Memoria principal (dirección 12)',
                info: 'Dirección 12 ← «A».',
                despues: 'Termina la primera instrucción; la CPU buscará la siguiente.',
                resaltar: ['io', 'mem'],
                celdas: [12],
                paquetes: [{ de: 'io', a: 'mem', etiqueta: 'A → dir 12', color: 'dato' }],
                efecto: function () { SG.memoria[12] = { txt: 'A', tipo: 'dato' }; }
            },

            // ---------------- FASE 3: PROCESAMIENTO EN LA ALU ----------------
            {
                fase: 'FASE 3 · PROCESAMIENTO EN LA ALU',
                titulo: 'BÚSQUEDA y DECODIFICACIÓN de «CARGAR 13»',
                accion: 'La CPU repite el ciclo: lee la instrucción de la dirección 01 y la interpreta.',
                componente: 'Unidad de Control ↔ Memoria principal',
                info: 'Dirección 01 → «CARGAR 13» (llevar el contador de caracteres a la ALU).',
                despues: 'El dato de la dirección 13 viajará hasta la Unidad Aritmético-Lógica.',
                resaltar: ['uc', 'mem'],
                celdas: [1],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 01', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'CARGAR 13',    color: 'instr' }
                ],
                efecto: function () { SG.ir = 'CARGAR 13'; SG.pc = '02'; }
            },
            {
                fase: 'FASE 3 · PROCESAMIENTO EN LA ALU',
                titulo: 'EJECUCIÓN: el dato entra en los registros de la ALU',
                accion: 'La memoria envía por el bus de datos el contenido de la dirección 13 y se guarda en el acumulador.',
                componente: 'Memoria principal → Unidad Aritmética (registros)',
                info: 'Contador de caracteres = 0.',
                despues: 'La ALU ya tiene el dato listo para operar.',
                resaltar: ['mem', 'alu'],
                celdas: [13],
                paquetes: [{ de: 'mem', a: 'alu', etiqueta: 'contador = 0', color: 'dato' }],
                efecto: function () { SG.acum = '0'; }
            },
            {
                fase: 'FASE 3 · PROCESAMIENTO EN LA ALU',
                titulo: 'BÚSQUEDA y DECODIFICACIÓN de «SUMAR 1»',
                accion: 'La CPU lee la instrucción de la dirección 02 y reconoce que es una operación aritmética.',
                componente: 'Unidad de Control ↔ Memoria principal',
                info: 'Dirección 02 → «SUMAR 1».',
                despues: 'La UC ordenará a la ALU realizar la suma.',
                resaltar: ['uc', 'mem'],
                celdas: [2],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 02', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'SUMAR 1',      color: 'instr' }
                ],
                efecto: function () { SG.ir = 'SUMAR 1'; SG.pc = '03'; }
            },
            {
                fase: 'FASE 3 · PROCESAMIENTO EN LA ALU',
                titulo: 'EJECUCIÓN: la ALU realiza la operación',
                accion: 'Bajo la señal de control de la UC, la Unidad Aritmético-Lógica suma 1 al valor del acumulador.',
                componente: 'Unidad de Control → Unidad Aritmética (ALU)',
                info: '0 + 1 = 1 (el documento ya tiene 1 carácter).',
                despues: 'El resultado deberá guardarse de nuevo en la memoria.',
                resaltar: ['uc', 'alu'],
                paquetes: [{ de: 'uc', a: 'alu', etiqueta: 'orden: sumar', color: 'control' }],
                efecto: function () { SG.acum = '1'; }
            },
            {
                fase: 'FASE 3 · PROCESAMIENTO EN LA ALU',
                titulo: 'BÚSQUEDA y EJECUCIÓN de «GUARDAR 13»',
                accion: 'La CPU lee la instrucción de la dirección 03 y la ALU devuelve su resultado a la memoria.',
                componente: 'Unidad de Control ↔ Memoria · ALU → Memoria',
                info: 'Dirección 13 ← 1.',
                despues: 'Solo falta mostrar el carácter al usuario.',
                resaltar: ['uc', 'alu', 'mem'],
                celdas: [3, 13],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 03', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'GUARDAR 13',   color: 'instr' },
                    { de: 'alu', a: 'mem', etiqueta: 'resultado = 1', color: 'dato' }
                ],
                efecto: function () {
                    SG.ir = 'GUARDAR 13';
                    SG.pc = '04';
                    SG.memoria[13] = { txt: '1', tipo: 'dato' };
                }
            },

            // ---------------- FASE 4: SALIDA ----------------
            {
                fase: 'FASE 4 · SALIDA DE RESULTADOS',
                titulo: 'BÚSQUEDA y DECODIFICACIÓN de «SALIDA 12»',
                accion: 'La CPU lee la instrucción de la dirección 04 y entiende que debe enviar un dato a un periférico.',
                componente: 'Unidad de Control ↔ Memoria principal',
                info: 'Dirección 04 → «SALIDA 12».',
                despues: 'El contenido de la dirección 12 viajará hacia la pantalla.',
                resaltar: ['uc', 'mem'],
                celdas: [4],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 04', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'SALIDA 12',    color: 'instr' }
                ],
                efecto: function () { SG.ir = 'SALIDA 12'; SG.pc = '05'; }
            },
            {
                fase: 'FASE 4 · SALIDA DE RESULTADOS',
                titulo: 'EJECUCIÓN: el carácter aparece en la pantalla',
                accion: 'El dato sale de la memoria, pasa por la Unidad de E/S y se envía al periférico de salida.',
                componente: 'Memoria → Unidad de E/S → Periférico 1 → Monitor',
                info: 'Carácter «A» mostrado en el documento.',
                despues: 'La CPU buscará la última instrucción del programa.',
                resaltar: ['mem', 'io', 'p1'],
                celdas: [12],
                dispositivos: ['monitor'],
                paquetes: [
                    { de: 'mem', a: 'io',      etiqueta: 'dato «A»', color: 'dato' },
                    { de: 'io',  a: 'p1',      etiqueta: '01000001', color: 'dato' },
                    { de: 'p1',  a: 'monitor', etiqueta: 'A',        color: 'activo' }
                ],
                efecto: function () { SG.pantalla = 'A'; }
            },
            {
                fase: 'FASE 4 · SALIDA DE RESULTADOS',
                titulo: 'La CPU lee «PARAR» y el ciclo se detiene',
                accion: 'La última instrucción indica a la Unidad de Control que finalice la ejecución.',
                componente: 'Unidad de Control ↔ Memoria principal',
                info: 'Dirección 05 → «PARAR».',
                despues: 'Con cada nueva tecla que pulse el usuario, el ciclo volverá a repetirse.',
                resaltar: ['uc', 'mem'],
                celdas: [5],
                paquetes: [
                    { de: 'uc',  a: 'mem', etiqueta: 'dirección 05', color: 'base'  },
                    { de: 'mem', a: 'uc',  etiqueta: 'PARAR',        color: 'instr' }
                ],
                efecto: function () { SG.ir = 'PARAR'; SG.pc = '06'; }
            },
            {
                fase: 'RESUMEN',
                titulo: 'Así funciona el modelo de Von Neumann',
                accion: 'Los periféricos entregan datos, la memoria guarda juntos datos e instrucciones, la Unidad de Control dirige y la ALU calcula.',
                componente: 'Todos los módulos del modelo',
                info: 'Un único camino (los buses) comunica la CPU con la memoria y con la E/S.',
                despues: 'Usa «Reiniciar» para repetir la simulación o «Paso» para revisarla con calma.',
                resaltar: ['alu', 'uc', 'mem', 'io', 'p1', 'p2']
            }
        ];
    }

    // =====================================================================
    // 3. UTILIDADES DE POSICIÓN
    // =====================================================================
    // modulos.js declara `let modules`, `let canvasWidth`... y las variables
    // declaradas con let/const NO quedan colgadas de window: hay que leerlas
    // como identificadores globales, no como propiedades de window.
    function cuadro() {
        return (typeof frameCount !== 'undefined') ? frameCount : 0;
    }

    function mods() {
        try {
            if (typeof modules !== 'undefined' && modules && modules.length) return modules;
        } catch (e) { /* aún no existe */ }
        if (window.modules && window.modules.length) return window.modules;
        return [];
    }

    function anchoLienzo() {
        if (typeof width !== 'undefined' && width) return width;
        return window.innerWidth || 0;
    }

    function altoLienzo() {
        if (typeof height !== 'undefined' && height) return height;
        return window.innerHeight || 0;
    }

    function posicion(id) {
        const m = mods();
        const W = anchoLienzo();
        const H = altoLienzo();
        if (m.length < 6) return { x: W / 2, y: H / 2 };

        switch (id) {
            case 'alu': return { x: m[0].x, y: m[0].y };
            case 'uc':  return { x: m[1].x, y: m[1].y };
            case 'mem': return { x: m[2].x, y: m[2].y };
            case 'io':  return { x: m[3].x, y: m[3].y };
            case 'p1':  return { x: m[4].x, y: m[4].y };
            case 'p2':  return { x: m[5].x, y: m[5].y };
            case 'mouse':   return { x: W * 0.770, y: H * 0.095 };
            case 'teclado': return { x: W * 0.862, y: H * 0.095 };
            case 'monitor': return { x: W * 0.954, y: H * 0.095 };
            default:    return { x: W / 2, y: H / 2 };
        }
    }

    function moduloDe(id) {
        const m = mods();
        const mapa = { alu: 0, uc: 1, mem: 2, io: 3, p1: 4, p2: 5 };
        return (id in mapa) ? m[mapa[id]] : null;
    }

    // =====================================================================
    // 4. DIBUJO SOBRE EL LIENZO
    // =====================================================================
    function dibujarSimulacion() {
        if (!SG.activa || mods().length < 6) return;

        push();
        rectMode(CENTER);
        textAlign(CENTER, CENTER);

        dibujarDispositivos();
        dibujarMemoriaSimulada();
        dibujarRegistros();
        dibujarResaltados();
        dibujarPaquetes();

        pop();
    }

    // ---------- 4.1 Resaltado de componentes activos ----------
    function dibujarResaltados() {
        const pulso = 0.5 + 0.5 * Math.sin(cuadro() * 0.09);

        SG.resaltados.forEach(function (id) {
            const mod = moduloDe(id);
            if (!mod) return;

            push();
            rectMode(CENTER);
            noFill();

            // halo exterior
            stroke(COLORES.activo[0], COLORES.activo[1], COLORES.activo[2], 60 + pulso * 90);
            strokeWeight(6);
            rect(mod.x, mod.y, mod.w + 18 + pulso * 6, mod.h + 18 + pulso * 6, 8);

            // borde nítido
            stroke(COLORES.activo[0], COLORES.activo[1], COLORES.activo[2], 220);
            strokeWeight(2.5);
            rect(mod.x, mod.y, mod.w + 8, mod.h + 8, 6);

            pop();
        });
    }

    // ---------- 4.2 Dispositivos periféricos (parte superior) ----------
    function dibujarDispositivos() {
        const lista = [
            { id: 'mouse',   etiqueta: 'MOUSE'   },
            { id: 'teclado', etiqueta: 'TECLADO' },
            { id: 'monitor', etiqueta: 'MONITOR' }
        ];
        const pulso = 0.5 + 0.5 * Math.sin(cuadro() * 0.12);

        lista.forEach(function (d) {
            const p = posicion(d.id);
            const activo = SG.dispositivos.indexOf(d.id) !== -1;
            const c = activo ? COLORES.activo : COLORES.base;
            const alfa = activo ? 200 + pulso * 55 : 120;
            const s = Math.max(16, Math.min(anchoLienzo() * 0.018, 26)); // tamaño base

            push();
            rectMode(CENTER);
            stroke(c[0], c[1], c[2], alfa);
            strokeWeight(activo ? 2.2 : 1.4);
            fill(8, 14, 30, 220);

            if (d.id === 'mouse') {
                rect(p.x, p.y, s * 0.85, s * 1.25, s * 0.42);
                line(p.x, p.y - s * 0.45, p.x, p.y - s * 0.05);
            } else if (d.id === 'teclado') {
                rect(p.x, p.y, s * 1.6, s * 0.95, 3);
                noFill();
                for (let f = 0; f < 3; f++) {
                    for (let col = 0; col < 5; col++) {
                        rect(p.x - s * 0.62 + col * s * 0.31,
                             p.y - s * 0.26 + f * s * 0.26,
                             s * 0.2, s * 0.16, 1);
                    }
                }
            } else {
                rect(p.x, p.y - s * 0.12, s * 1.65, s * 1.05, 3);
                line(p.x, p.y + s * 0.40, p.x, p.y + s * 0.58);
                line(p.x - s * 0.35, p.y + s * 0.58, p.x + s * 0.35, p.y + s * 0.58);
                // carácter mostrado en la "pantalla"
                if (SG.pantalla) {
                    noStroke();
                    fill(COLORES.activo[0], COLORES.activo[1], COLORES.activo[2], 240);
                    textSize(s * 0.62);
                    textStyle(BOLD);
                    text(SG.pantalla, p.x, p.y - s * 0.12);
                }
            }

            // etiqueta
            noStroke();
            fill(c[0], c[1], c[2], activo ? 255 : 150);
            textSize(8.5);
            textStyle(NORMAL);
            textAlign(CENTER, TOP);
            text(d.etiqueta, p.x, p.y + s * 0.85);

            // conexión hacia el Periférico 1 cuando está activo
            if (activo) {
                const p1 = moduloDe('p1');
                if (p1) {
                    stroke(c[0], c[1], c[2], 90 + pulso * 80);
                    strokeWeight(1.4);
                    drawingContext.setLineDash([5, 5]);
                    line(p.x, p.y + s * 1.05, p1.x, p1.y - p1.h / 2);
                    drawingContext.setLineDash([]);
                }
            }
            pop();
        });
    }

    // ---------- 4.3 Memoria exclusiva de la simulación ----------
    function dibujarMemoriaSimulada() {
        const mem = moduloDe('mem');
        if (!mem) return;

        const pulso = 0.5 + 0.5 * Math.sin(cuadro() * 0.14);

        push();
        rectMode(CENTER);

        // Fondo opaco: tapa el contenido original SOLO mientras dura la simulación
        noStroke();
        fill(8, 12, 28, 248);
        rect(mem.x, mem.y, mem.w - 4, mem.h - 4, 3);

        // Título interno
        noStroke();
        fill(COLORES.base[0], COLORES.base[1], COLORES.base[2], 230);
        textSize(Math.min(mem.w * 0.085, 10));
        textStyle(BOLD);
        textAlign(CENTER, TOP);
        text('MEMORIA PRINCIPAL', mem.x, mem.y - mem.h / 2 + 7);
        textSize(7.5);
        textStyle(NORMAL);
        fill(127, 223, 255, 190);
        text('RAM · simulación', mem.x, mem.y - mem.h / 2 + 19);

        // Rejilla de celdas
        const x0 = mem.x - mem.w / 2 + 6;
        const ancho = mem.w - 12;
        const y0 = mem.y - mem.h / 2 + 32;
        const alto = mem.h - 40;
        const filaH = alto / TOTAL_CELDAS;
        const anchoDir = Math.min(ancho * 0.3, 26);
        const fuente = Math.max(6, Math.min(filaH * 0.52, 9));

        rectMode(CORNER);
        for (let i = 0; i < TOTAL_CELDAS; i++) {
            const y = y0 + i * filaH;
            const celda = SG.memoria[i];
            const activa = SG.celdasActivas.indexOf(i) !== -1;

            let c = [0, 240, 255];
            let relleno = 12;
            if (celda) {
                c = (celda.tipo === 'instr') ? COLORES.instr : COLORES.dato;
                relleno = 26;
            }
            if (activa) relleno = 60 + pulso * 70;

            // fondo de la fila
            noStroke();
            fill(c[0], c[1], c[2], relleno);
            rect(x0, y, ancho, filaH - 1.5, 2);

            // borde
            noFill();
            stroke(c[0], c[1], c[2], activa ? 255 : 90);
            strokeWeight(activa ? 1.6 : 0.7);
            rect(x0, y, ancho, filaH - 1.5, 2);
            line(x0 + anchoDir, y, x0 + anchoDir, y + filaH - 1.5);

            // dirección
            noStroke();
            fill(COLORES.activo[0], COLORES.activo[1], COLORES.activo[2], activa ? 255 : 190);
            textSize(fuente);
            textAlign(CENTER, CENTER);
            text(('0' + i).slice(-2), x0 + anchoDir / 2, y + filaH / 2);

            // contenido
            fill(activa ? 255 : 223, activa ? 255 : 251, 255, celda ? 235 : 70);
            textAlign(LEFT, CENTER);
            text(celda ? celda.txt : '—', x0 + anchoDir + 4, y + filaH / 2);
        }

        pop();
    }

    // ---------- 4.4 Registros PC / IR / Acumulador ----------
    function dibujarRegistros() {
        const uc = moduloDe('uc');
        const alu = moduloDe('alu');

        push();
        rectMode(CENTER);
        textStyle(BOLD);

        // --- PC dentro de la Unidad de Control (sobre la cajita existente) ---
        if (uc) {
            const pcW = uc.w * 0.20;
            const pcX = uc.x + uc.w / 2 - pcW / 2 - 12;
            const pcY = uc.y;

            noStroke();
            fill(8, 12, 28, 235);
            rect(pcX, pcY, pcW - 2, uc.h * 0.43, 2);

            noStroke();
            fill(COLORES.base[0], COLORES.base[1], COLORES.base[2], 220);
            textSize(9);
            textAlign(CENTER, CENTER);
            text('PC', pcX, pcY - uc.h * 0.10);

            fill(COLORES.activo[0], COLORES.activo[1], COLORES.activo[2], 245);
            textSize(13);
            text(SG.pc, pcX, pcY + uc.h * 0.08);

            // --- IR (registro de instrucción) dentro de la UC ---
            const irW = uc.w * 0.40;
            const irX = uc.x - uc.w * 0.42 + irW / 2;
            const irY = uc.y + uc.h * 0.28;

            noFill();
            stroke(COLORES.base[0], COLORES.base[1], COLORES.base[2], 170);
            strokeWeight(1);
            rect(irX, irY, irW, uc.h * 0.26, 2);

            noStroke();
            fill(COLORES.base[0], COLORES.base[1], COLORES.base[2], 210);
            textSize(8);
            textAlign(LEFT, CENTER);
            text('IR', irX - irW / 2 + 5, irY);
            fill(COLORES.instr[0], COLORES.instr[1], COLORES.instr[2], 245);
            textSize(9);
            text(SG.ir, irX - irW / 2 + 22, irY);
        }

        // --- Acumulador dentro de la Unidad Aritmética ---
        if (alu) {
            const accW = alu.w * 0.78;
            const accY = alu.y - alu.h * 0.08;

            noStroke();
            fill(8, 12, 28, 235);
            rect(alu.x, accY, accW, alu.h * 0.17, 3);
            noFill();
            stroke(COLORES.base[0], COLORES.base[1], COLORES.base[2], 180);
            strokeWeight(1);
            rect(alu.x, accY, accW, alu.h * 0.17, 3);

            noStroke();
            fill(COLORES.base[0], COLORES.base[1], COLORES.base[2], 210);
            textSize(8);
            textAlign(LEFT, CENTER);
            text('ACUM', alu.x - accW / 2 + 5, accY);
            fill(COLORES.dato[0], COLORES.dato[1], COLORES.dato[2], 245);
            textSize(11);
            textAlign(RIGHT, CENTER);
            text(SG.acum, alu.x + accW / 2 - 6, accY);
        }

        pop();
    }

    // ---------- 4.5 Paquetes que viajan por los buses ----------
    function dibujarPaquetes() {
        const paso = SG.pasos[SG.idx];
        if (!paso || !paso.paquetes || !paso.paquetes.length) return;

        paso.paquetes.forEach(function (pk, i) {
            const ini = i * DUR_PAQUETE;
            const fin = ini + DUR_PAQUETE;
            if (SG.t < ini) return;

            const avance = Math.min((SG.t - ini) / DUR_PAQUETE, 1);
            const a = posicion(pk.de);
            const b = posicion(pk.a);
            const x = a.x + (b.x - a.x) * avance;
            const y = a.y + (b.y - a.y) * avance;
            const c = COLORES[pk.color] || COLORES.base;

            // los paquetes ya entregados se quedan como estela tenue
            const terminado = SG.t >= fin;
            const alfa = terminado ? 70 : 255;

            push();
            rectMode(CENTER);

            // línea del recorrido
            stroke(c[0], c[1], c[2], terminado ? 40 : 110);
            strokeWeight(1.6);
            drawingContext.setLineDash([6, 6]);
            line(a.x, a.y, x, y);
            drawingContext.setLineDash([]);

            if (!terminado) {
                // resplandor
                noStroke();
                fill(c[0], c[1], c[2], 55);
                circle(x, y, 26);
                fill(c[0], c[1], c[2], 110);
                circle(x, y, 16);
                fill(255, 255, 255, 235);
                circle(x, y, 7);
            }

            // etiqueta del dato transferido
            if (pk.etiqueta) {
                textSize(9.5);
                textAlign(CENTER, CENTER);
                textStyle(BOLD);
                const w = textWidth(pk.etiqueta) + 14;
                noStroke();
                fill(4, 10, 24, terminado ? 130 : 235);
                rect(x, y - 19, w, 15, 7);
                noFill();
                stroke(c[0], c[1], c[2], alfa);
                strokeWeight(1);
                rect(x, y - 19, w, 15, 7);
                noStroke();
                fill(c[0], c[1], c[2], alfa);
                text(pk.etiqueta, x, y - 19);
            }
            pop();
        });
    }

    // =====================================================================
    // 5. MOTOR DE LA SIMULACIÓN
    // =====================================================================
    function duracionAnimacion(paso) {
        if (!paso) return 0;
        const n = (paso.paquetes && paso.paquetes.length) ? paso.paquetes.length : 0;
        return n > 0 ? n * DUR_PAQUETE : 600;
    }

    function duracionTotal(paso) {
        return duracionAnimacion(paso) + DUR_ESPERA;
    }

    function actualizarMotor() {
        if (!SG.activa) return;
        const paso = SG.pasos[SG.idx];
        if (!paso) return;

        if (SG.corriendo) {
            SG.t += (typeof deltaTime !== 'undefined' ? deltaTime : 16);
        }

        // Aplicar el efecto del paso justo cuando termina su animación
        if (!SG.efectoHecho && SG.t >= duracionAnimacion(paso)) {
            SG.efectoHecho = true;
            if (typeof paso.efecto === 'function') paso.efecto();
            actualizarPanel();
        }

        if (SG.t >= duracionTotal(paso)) {
            if (SG.modo === 'auto' && SG.idx < SG.pasos.length - 1) {
                irAPaso(SG.idx + 1);
            } else {
                SG.t = duracionTotal(paso);
                SG.corriendo = false;   // en modo manual espera al usuario
                actualizarBotones();
            }
        }

        actualizarProgreso();
    }

    function irAPaso(n) {
        SG.idx = Math.max(0, Math.min(n, SG.pasos.length - 1));
        SG.t = 0;
        SG.efectoHecho = false;

        const paso = SG.pasos[SG.idx];
        SG.resaltados   = paso.resaltar     || [];
        SG.dispositivos = paso.dispositivos || [];
        SG.celdasActivas = paso.celdas      || [];

        actualizarPanel();
        actualizarBotones();
    }

    function reiniciarEstado() {
        SG.idx = 0;
        SG.t = 0;
        SG.efectoHecho = false;
        SG.corriendo = false;
        SG.pc = '—';
        SG.ir = '—';
        SG.acum = '—';
        SG.pantalla = '';
        SG.memoria = {};
        SG.celdasActivas = [];
        SG.resaltados = [];
        SG.dispositivos = [];
        irAPaso(0);
    }

    // =====================================================================
    // 6. PANEL DE EXPLICACIÓN (HTML)
    // =====================================================================
    let barra, elFase, elContador, elTitulo, elAccion, elComponente,
        elInfo, elDespues, elProgreso, elPc, elIr, elAcum,
        btnPlay, btnPaso, btnReiniciar, btnSalir;

    function crearBarra() {
        if (barra) return;

        barra = document.createElement('section');
        barra.className = 'sg-barra';
        barra.innerHTML =
            '<div class="sg-info">' +
                '<div class="sg-encabezado">' +
                    '<span class="sg-fase" id="sg-fase">SIMULACIÓN</span>' +
                    '<span class="sg-contador" id="sg-contador">Paso 1 / 1</span>' +
                    '<h3 class="sg-titulo" id="sg-titulo">—</h3>' +
                '</div>' +
                '<div class="sg-progreso"><div class="sg-progreso-relleno" id="sg-progreso"></div></div>' +
                '<div class="sg-detalles">' +
                    '<div class="sg-campo"><h4>¿Qué ocurre?</h4><p id="sg-accion">—</p></div>' +
                    '<div class="sg-campo"><h4>Componente</h4><p id="sg-componente">—</p></div>' +
                    '<div class="sg-campo"><h4>Información que viaja</h4><p id="sg-info-dato">—</p></div>' +
                    '<div class="sg-campo"><h4>¿Qué sigue?</h4><p id="sg-despues">—</p></div>' +
                '</div>' +
                '<div class="sg-registros">' +
                    '<span class="sg-chip">PC <b id="sg-pc">—</b></span>' +
                    '<span class="sg-chip">IR <b id="sg-ir">—</b></span>' +
                    '<span class="sg-chip">ACUM <b id="sg-acum">—</b></span>' +
                '</div>' +
            '</div>' +
            '<div class="sg-controles">' +
                '<button type="button" class="sg-btn sg-principal" id="sg-btn-play">▶ Iniciar</button>' +
                '<button type="button" class="sg-btn" id="sg-btn-paso">⏭ Paso</button>' +
                '<button type="button" class="sg-btn" id="sg-btn-reiniciar">↺ Reiniciar</button>' +
                '<button type="button" class="sg-btn sg-salir" id="sg-btn-salir">✕ Salir de la simulación</button>' +
            '</div>';

        document.body.appendChild(barra);

        elFase       = document.getElementById('sg-fase');
        elContador   = document.getElementById('sg-contador');
        elTitulo     = document.getElementById('sg-titulo');
        elAccion     = document.getElementById('sg-accion');
        elComponente = document.getElementById('sg-componente');
        elInfo       = document.getElementById('sg-info-dato');
        elDespues    = document.getElementById('sg-despues');
        elProgreso   = document.getElementById('sg-progreso');
        elPc         = document.getElementById('sg-pc');
        elIr         = document.getElementById('sg-ir');
        elAcum       = document.getElementById('sg-acum');

        btnPlay      = document.getElementById('sg-btn-play');
        btnPaso      = document.getElementById('sg-btn-paso');
        btnReiniciar = document.getElementById('sg-btn-reiniciar');
        btnSalir     = document.getElementById('sg-btn-salir');

        btnPlay.addEventListener('click', alternarReproduccion);
        btnPaso.addEventListener('click', avanzarUnPaso);
        btnReiniciar.addEventListener('click', function () {
            reiniciarEstado();
            SG.modo = 'auto';
            actualizarBotones();
        });
        btnSalir.addEventListener('click', cerrarSimulacion);
    }

    function actualizarPanel() {
        if (!barra) return;
        const paso = SG.pasos[SG.idx];
        if (!paso) return;

        elFase.textContent       = paso.fase;
        elContador.textContent   = 'Paso ' + (SG.idx + 1) + ' / ' + SG.pasos.length;
        elTitulo.textContent     = paso.titulo;
        elAccion.textContent     = paso.accion     || '—';
        elComponente.textContent = paso.componente || '—';
        elInfo.textContent       = paso.info       || '—';
        elDespues.textContent    = paso.despues    || '—';

        elPc.textContent   = SG.pc;
        elIr.textContent   = SG.ir;
        elAcum.textContent = SG.acum;
    }

    function actualizarProgreso() {
        if (!elProgreso) return;
        const paso = SG.pasos[SG.idx];
        const dentro = Math.min(SG.t / duracionTotal(paso), 1);
        const total = ((SG.idx + dentro) / SG.pasos.length) * 100;
        elProgreso.style.width = total.toFixed(1) + '%';
    }

    function actualizarBotones() {
        if (!btnPlay) return;
        const ultimo = SG.idx >= SG.pasos.length - 1 &&
                       SG.t >= duracionTotal(SG.pasos[SG.idx]);

        if (ultimo) {
            btnPlay.textContent = '✔ Finalizada';
            btnPlay.disabled = true;
            btnPaso.disabled = true;
        } else {
            btnPlay.disabled = false;
            btnPaso.disabled = false;
            btnPlay.textContent = (SG.corriendo && SG.modo === 'auto') ? '⏸ Pausar' : '▶ Iniciar';
            if (!SG.corriendo && SG.idx > 0) btnPlay.textContent = '▶ Reanudar';
        }
    }

    function alternarReproduccion() {
        if (SG.corriendo && SG.modo === 'auto') {
            SG.corriendo = false;                     // pausar
        } else {
            SG.modo = 'auto';
            // si el paso ya terminó, saltar al siguiente antes de reanudar
            const paso = SG.pasos[SG.idx];
            if (SG.t >= duracionTotal(paso) && SG.idx < SG.pasos.length - 1) {
                irAPaso(SG.idx + 1);
            }
            SG.corriendo = true;
        }
        actualizarBotones();
    }

    function avanzarUnPaso() {
        SG.modo = 'manual';
        const paso = SG.pasos[SG.idx];
        const total = duracionTotal(paso);

        if (SG.t === 0) {
            // el paso todavía no se ha reproducido: animarlo y detenerse al final
            SG.corriendo = true;
        } else if (SG.t < total) {
            // se está reproduciendo: completarlo de inmediato
            SG.t = total;
            if (!SG.efectoHecho) {
                SG.efectoHecho = true;
                if (typeof paso.efecto === 'function') paso.efecto();
            }
            SG.corriendo = false;
            actualizarPanel();
        } else if (SG.idx < SG.pasos.length - 1) {
            irAPaso(SG.idx + 1);
            SG.corriendo = true;   // anima el paso siguiente y se detiene al final
        }
        actualizarBotones();
    }

    // =====================================================================
    // 7. ABRIR / CERRAR
    // =====================================================================
    function abrirSimulacion() {
        if (SG.activa) { cerrarSimulacion(); return; }

        SG.pasos = construirPasos();
        crearBarra();
        document.body.classList.add('sg-activa');

        // El lienzo se reduce; modulos.js recoloca todo de forma responsive
        window.dispatchEvent(new Event('resize'));

        SG.activa = true;
        SG.modo = 'auto';
        reiniciarEstado();
        actualizarBotones();
    }

    function cerrarSimulacion() {
        SG.activa = false;
        SG.corriendo = false;
        document.body.classList.remove('sg-activa');

        if (barra) {
            barra.remove();
            barra = null;
            btnPlay = btnPaso = btnReiniciar = btnSalir = null;
        }

        // Devolver el lienzo a su tamaño original
        window.dispatchEvent(new Event('resize'));
    }

    // =====================================================================
    // 8. ENGANCHE CON p5.js (sin tocar modulos.js)
    // =====================================================================
    function engancharP5() {
        if (typeof window.draw !== 'function' || SG.drawOriginal) return true;

        SG.drawOriginal = window.draw;
        window.draw = function () {
            SG.drawOriginal();          // el modelo original se dibuja igual
            if (SG.activa) {
                actualizarMotor();
                dibujarSimulacion();    // la simulación se superpone
            }
        };

        // Durante la simulación, los clics no abren los módulos
        if (typeof window.mousePressed === 'function') {
            SG.mousePressedOriginal = window.mousePressed;
            window.mousePressed = function () {
                if (SG.activa) return;
                return SG.mousePressedOriginal.apply(this, arguments);
            };
        }
        if (typeof window.touchStarted === 'function') {
            SG.touchStartedOriginal = window.touchStarted;
            window.touchStarted = function () {
                if (SG.activa) return false;
                return SG.touchStartedOriginal.apply(this, arguments);
            };
        }
        return true;
    }

    // =====================================================================
    // 9. INICIALIZACIÓN
    // =====================================================================
    function init() {
        // Esperar a que p5 y modulos.js estén listos
        let intentos = 0;
        let reloj = null;
        reloj = setInterval(function () {
            intentos++;
            if (engancharP5() || intentos > 200) {
                if (reloj !== null) clearInterval(reloj);
            }
        }, 50);

        const boton = document.getElementById('btn-sim-grafica');
        if (boton) {
            boton.addEventListener('click', function (e) {
                e.preventDefault();
                abrirSimulacion();
            });
        }

        // Atajos de teclado cómodos para exponer el proyecto
        document.addEventListener('keydown', function (e) {
            if (!SG.activa) return;
            if (e.key === 'Escape')      cerrarSimulacion();
            else if (e.key === ' ')      { e.preventDefault(); alternarReproduccion(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); avanzarUnPaso(); }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
