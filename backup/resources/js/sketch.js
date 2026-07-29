let modules = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  modules.push(new Module("Intro", width * 0.2, height * 0.5, 60));
  modules.push(new Module("Nosotros", width * 0.35, height * 0.5, 60));
  modules.push(new Module("Biografía", width * 0.5, height * 0.5, 60));
  modules.push(new Module("Trayectoria", width * 0.65, height * 0.5, 60));
  modules.push(new Module("Covers", width * 0.8, height * 0.5, 60));
}

function draw() {
  background(10, 10, 30);
  
  // Fondo dinámico futurista
  for (let i = 0; i < 50; i++) {
    stroke(0, 255, 255, 50);
    point(random(width), random(height));
  }

  // Dibujar módulos
  for (let m of modules) {
    m.display();
  }
}

function mousePressed() {
  for (let i = 0; i < modules.length; i++) {
    let module = modules[i];
    let d = dist(mouseX, mouseY, module.x, module.y);
    if (d < module.radius) {
      if (i === 0) {
        mostrarVideo('../assets/PROMO ELECTRO COVER WEB 2.mp4');
      } else if (i === 1) {
        mostrarNosotros();
      } else if (i === 2) {
        mostrarPagina('../assets/biografia.html');
      } else if (i === 3) {
        mostrarPagina('../assets/trayectoria.html');
      } else if (i === 4) {
        mostrarPagina('../assets/covers.html');
      }
    }
  }
}
