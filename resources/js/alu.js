document.addEventListener("DOMContentLoaded", () => {

    //  TABS 
    const tabs = document.querySelectorAll(".btn-alu-tab");
    const panels = document.querySelectorAll(".alu-panel-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("activo"));
            panels.forEach(p => p.classList.remove("activo"));

            this.classList.add("activo");

            const target = this.dataset.tab;
            const panel = document.querySelector(
                `.alu-panel-content[data-panel="${target}"]`
            );

            if (panel) panel.classList.add("activo");
        });
    });

    // Boton de regresar
    const btnRegresar = document.getElementById("btn-regresar-modulos");
    if (btnRegresar) {
        btnRegresar.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    }

    //
    const inputA = document.getElementById("inputA");
    const inputB = document.getElementById("inputB");
    const opSelect = document.getElementById("opSelect");
    const executeBtn = document.getElementById("executeBtn");

    const bitsA = document.querySelectorAll("#bitsA .bit");
    const bitsB = document.querySelectorAll("#bitsB .bit");
    const bitsResult = document.querySelectorAll("#bitsResult .bit");

    const resultDecimal = document.getElementById("resultDecimal");
    const statusText = document.getElementById("statusText");
    const statusDot = document.getElementById("statusDot");
    const currentOp = document.getElementById("currentOp");
    const aluChip = document.getElementById("aluChip");

    const gates = document.querySelectorAll(".gate");

    //Funciones

    function to8Bits(num) {
        return (num & 0xff).toString(2).padStart(8, "0");
    }

    function renderBits(bitElements, value, isResult = false) {
        const bin = to8Bits(value);

        bitElements.forEach((bit, i) => {
            bit.textContent = bin[i];

            if (isResult) {
                bit.className = "bit result";
                if (bin[i] === "1") {
                    bit.style.boxShadow = "0 0 18px rgba(124,58,237,.45)";
                } else {
                    bit.style.boxShadow = "none";
                }
            } else {
                bit.className = bin[i] === "1" ? "bit on" : "bit off";
            }
        });
    }

    function activateGate(op) {
        gates.forEach(g => g.classList.remove("active"));
        const gate = document.querySelector(`.gate[data-op="${op}"]`);
        if (gate) gate.classList.add("active");
    }

    function animateChip() {
        aluChip.classList.add("active");
        statusDot.classList.add("active");

        setTimeout(() => {
            aluChip.classList.remove("active");
            statusDot.classList.remove("active");
        }, 800);
    }

    function ejecutarALU() {
        let A = parseInt(inputA.value);
        let B = parseInt(inputB.value);

        if (isNaN(A)) A = 0;
        if (isNaN(B)) B = 0;

        A = Math.max(0, Math.min(255, A));
        B = Math.max(0, Math.min(255, B));

        inputA.value = A;
        inputB.value = B;

        const op = opSelect.value;
        let result = 0;
        let opName = "";

        switch (op) {
            case "add":
                result = A + B;
                opName = "ADD";
                break;

            case "sub":
                result = A - B;
                if (result < 0) result = (result + 256) & 0xff;
                opName = "SUB";
                break;

            case "and":
                result = A & B;
                opName = "AND";
                break;

            case "or":
                result = A | B;
                opName = "OR";
                break;

            case "xor":
                result = A ^ B;
                opName = "XOR";
                break;
        }

        result = result & 0xff;

        // Renderizar bits
        renderBits(bitsA, A);
        renderBits(bitsB, B);
        renderBits(bitsResult, result, true);

        // Actualizar texto
        resultDecimal.textContent = result;
        currentOp.textContent = opName;
        statusText.textContent = `Operación ejecutada: ${opName}`;

        // Activar compuerta
        activateGate(op);

        // Animación
        animateChip();
    }

    // Eventos

    executeBtn.addEventListener("click", ejecutarALU);

    /* Ejecutar automáticamente al cambiar valores
    inputA.addEventListener("input", ejecutarALU);
    inputB.addEventListener("input", ejecutarALU);
    opSelect.addEventListener("change", ejecutarALU);

    // Inicializar
    ejecutarALU();*/
});