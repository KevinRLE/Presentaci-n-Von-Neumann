// Efecto suave al cargar videos
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll("video");
  videos.forEach(video => {
    video.addEventListener("mouseenter", () => video.play());
    video.addEventListener("mouseleave", () => video.pause());
  });
});
