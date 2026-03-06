async function injectPartial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    console.error("Partial not found:", url, res.status);
    return;
  }
  el.innerHTML = await res.text();
}

// Detecta base do GitHub Pages (repo) ou root (Cloudflare)
function getBasePath() {
  const host = window.location.host;
  const path = window.location.pathname;

  if (!host.includes("github.io")) return "";
  const parts = path.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

function prefixRootPaths(base) {
  if (!base) return;

  document
    .querySelectorAll("a[href^='/'], img[src^='/'], link[href^='/'], script[src^='/']")
    .forEach((el) => {
      const attr =
        el.tagName === "IMG" ? "src" :
        el.tagName === "SCRIPT" ? "src" :
        "href";

      const val = el.getAttribute(attr);
      if (!val) return;
      if (val.startsWith("//") || val.startsWith("http")) return;
      if (val.startsWith(base + "/")) return;

      el.setAttribute(attr, base + val);
    });
}

function setupOverlayMenu() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("menuClose");

  if (!burger || !menu) {
    console.warn("Menu elements not found (burger/mobileMenu).");
    return;
  }

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", () => {
    // toggle (se já estiver aberto, fecha)
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  // fecha clicando fora do painel
  menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });

  // fecha ao clicar em link
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  // fecha no ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

function setupYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

(async () => {
  const isInPagesFolder = window.location.pathname.includes("/pages/");
  const rel = isInPagesFolder ? ".." : ".";

  await injectPartial("site-header", `${rel}/partials/header.html`);
  await injectPartial("site-footer", `${rel}/partials/footer.html`);

  // Corrige paths no GitHub Pages
  const base = getBasePath();
  prefixRootPaths(base);

  // Agora que o header existe no DOM, ativa menu
  setupOverlayMenu();

  setupYear();
})();