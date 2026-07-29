// --- Fondo futurista con Three.js ---
const canvas = document.getElementById('background-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const particlesCount = 300;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 15;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ color: 0x00f5ff, size: 0.05 });
const particles = new THREE.Points(geometry, material);
scene.add(particles);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.002;
  renderer.render(scene, camera);
}
animate();

// Ajuste al redimensionar
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Botón Regresar ---
document.getElementById("btn-regresar").addEventListener("click", () => {
  window.location.href = "../../pages/nosotros.html";
});
