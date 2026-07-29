// biografia.js
const { random, atan2, cos, sin, hypot } = Math;
const max = 200;
const canvas = document.getElementById("canvas");
const $ = canvas.getContext('2d');
const body = document.body;
const fondoNeon = document.querySelector('.fondo-neon'); 
const particles = [];

canvas.id = "fondo-particulas";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-3"; // debajo del fondo neón

// Insertar el canvas *detrás* del fondo visual (si existe .fondo-neon)
if (fondoNeon) {
  fondoNeon.parentNode.insertBefore(canvas, fondoNeon);
} else {
  body.prepend(canvas);
}

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let point = { x: width/2, y: height/2 };
let hue = 0;

function Particle() {}

Particle.prototype = {
    init() {
        this.hue = hue;
        this.alpha = 0;
        this.size = this.random(1, 5);
        this.x = this.random(0, width);
        this.y = this.random(0, height);
        this.velocity = this.size * .5;
        this.changed = null;
        this.changedFrame = 0;
        this.maxChangedFrames = 50;
        return this;
    },
    draw() {
        $.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        $.beginPath();
        $.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        $.stroke();
        this.update();
    },
    update() {
        if (this.changed) {
            this.alpha *= .92;
            this.size += 2;
            this.changedFrame++;
            if (this.changedFrame > this.maxChangedFrames) {
                this.reset();
            }
        } else if (this.distance(point.x, point.y) < 50) {
            this.changed = true;
        } else {
            let dx = point.x - this.x;
            let dy = point.y - this.y;
            let angle = atan2(dy, dx);
            this.alpha += .01;
            this.x += this.velocity * cos(angle);
            this.y += this.velocity * sin(angle);
            this.velocity += .02;
        }
    },
    reset() {
        this.init();
    },
    distance(x, y) {
        return hypot(x - this.x, y - this.y);
    },
    random(min, max) {
        return random() * (max - min) + min;
    }
};

function animate() {
    $.fillStyle = "rgba(0,0,0, .2)";
    $.fillRect(0, 0, width, height);
    particles.forEach((p) => {
        p.draw();
    });
    hue += .3;
    window.requestAnimationFrame(animate);
}

function touches(e) {
    point.x = e.touches ? e.touches[0].clientX : e.clientX;
    point.y = e.touches ? e.touches[0].clientY : e.clientY;
}

function setup() {
    for (let i = 0; i < max; i++) {
        setTimeout(() => {
            let p = new Particle().init();
            particles.push(p);
        }, i * 10);
    }
    canvas.addEventListener("mousemove", touches);
    canvas.addEventListener("touchmove", touches);
    canvas.addEventListener("mouseleave", () => {
        point = { x: width/2, y: height/2 };
    });
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        point = { x: width/2, y: height/2 };
    });
    animate();
}



// ==================
// ZOOM DE IMÁGENES TRAYECTORIA
// ==================
document.addEventListener("DOMContentLoaded", () => {

  const imagenes = document.querySelectorAll(".evento img");
  const modal = document.getElementById("modal-imagen");
  const imagenGrande = document.getElementById("imagen-ampliada");

  if (!modal || !imagenGrande) return;

  imagenes.forEach(img => {
    img.addEventListener("click", e => {
      e.stopPropagation();
      imagenGrande.src = img.src;
      modal.classList.add("activo");
    });
  });

  modal.addEventListener("click", () => {
    modal.classList.remove("activo");
  });

});
//aqui acaba cambio Rocio
setup();