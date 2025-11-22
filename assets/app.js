document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".floating-hearts");
  if (!container) return;

  function createHeart() {
    const heart = document.createElement("span");
    heart.style.left = Math.random() * 100 + "%";
    heart.style.animationDuration = Math.random() * 3 + 6 + "s";
    heart.style.opacity = Math.random() * 0.7 + 0.3;
    heart.style.transform = `scale(${Math.random() * 1 + 0.5})`;
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 9000);
  }

  setInterval(createHeart, 400);
});
