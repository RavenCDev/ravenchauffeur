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
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  // fecha clicando fora do painel
  menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });

  // fecha ao clicar em links normais
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  // fecha no ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // submenu mobile
  menu.querySelectorAll(".menu-parent").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".menu-group");
      const isOpen = group.classList.contains("is-open");

      group.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(!isOpen));

      const icon = btn.querySelector(".menu-parent__icon");
      if (icon) icon.textContent = isOpen ? "+" : "–";
    });
  });
}

function setupYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function setupFormspreeAjax() {
  const forms = document.querySelectorAll("#quoteForm, #contactForm");
  const modal = document.getElementById("luxuryModal");

  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const successMsg = form.querySelector(".form-success");
      const noteMsg = form.querySelector(".form-note");

      const originalBtnText = submitBtn ? submitBtn.textContent : "";

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
        }

        const formData = new FormData(form);

        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          form.reset();

          if (noteMsg) noteMsg.hidden = true;
          if (successMsg) successMsg.hidden = false;

          if (modal) {
            modal.classList.add("active");

            setTimeout(() => {
              modal.classList.remove("active");
            }, 3000);
          }
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch (error) {
        alert("Unable to send your request right now. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  });
}

(async () => {
  const isRoot =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname.split("/").filter(Boolean).length === 0;

  const rel = "..";

  await injectPartial("site-header", `${rel}/partials/header.html`);
  await injectPartial("site-footer", `${rel}/partials/footer.html`);

  // Corrige paths no GitHub Pages
  const base = getBasePath();
  prefixRootPaths(base);

  // Agora que o header existe no DOM, ativa menu
  setupOverlayMenu();
  setupYear();
  setupFormspreeAjax();
})();


//SLIDES WALKING 

function setupPremiumSlider() {
  const slider = document.querySelector(".premium-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".premium-slide"));
  const dots = Array.from(slider.querySelectorAll(".premium-slider__dot"));
  const prevBtn = slider.querySelector(".premium-slider__btn--prev");
  const nextBtn = slider.querySelector(".premium-slider__btn--next");

  if (!slides.length) return;

  let current = 0;
  let autoplay = null;
  let startX = 0;
  let endX = 0;

  function goToSlide(index) {
    slides[current].classList.remove("is-active");
    if (dots[current]) dots[current].classList.remove("is-active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    if (dots[current]) dots[current].classList.add("is-active");
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(nextSlide, 4000);
  }

  function stopAutoplay() {
    if (autoplay) {
      clearInterval(autoplay);
      autoplay = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoplay();
    });
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  slider.addEventListener("touchstart", (e) => {
    startX = e.changedTouches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
      startAutoplay();
    }
  }, { passive: true });

  startAutoplay();
}

(async () => {
  const isRoot =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname.split("/").filter(Boolean).length === 0;

  const rel = isRoot ? "." : "..";

  await injectPartial("site-header", `${rel}/partials/header.html`);
  await injectPartial("site-footer", `${rel}/partials/footer.html`);

  const base = getBasePath();
  prefixRootPaths(base);

  setupOverlayMenu();
  setupYear();
  setupFormspreeAjax();
  setupPremiumSlider();
})();