function mostrarPagina(url) {
  limpiarUI();
  let iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.className = "iframe-contenido";
  document.body.appendChild(iframe);
}

function mostrarVideo(src) {
  limpiarUI();
  let video = document.createElement("video");
  video.src = src;
  video.controls = true;
  video.autoplay = true;
  video.className = "iframe-contenido";
  document.body.appendChild(video);
}

function mostrarNosotros() {
  limpiarUI();
  let div = document.createElement("div");
  div.className = "iframe-contenido";
  div.innerHTML = `
    <h2>Nosotros</h2>
    <p>Somos Electro Cover, una banda dedicada a reinterpretar clásicos con un estilo electrónico futurista.</p>
  `;
  document.body.appendChild(div);
}

function limpiarUI() {
  let elementos = document.querySelectorAll(".iframe-contenido");
  elementos.forEach(e => e.remove());
}
