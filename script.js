(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".page-progress");
  const backToTop = document.querySelector(".back-to-top");
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const themeToggle = document.querySelector(".theme-toggle");

  const setHeaderState = () => {
    const scrolled = window.scrollY > 24;
    header.classList.toggle("scrolled", scrolled);
    backToTop.classList.toggle("visible", window.scrollY > 600);
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? (window.scrollY / height) * 100 : 0;
    progress.style.width = `${pct}%`;
  };

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  navToggle.addEventListener("click", () => {
    const open = navPanel.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navPanel.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  const savedTheme = localStorage.getItem("tree-csp-theme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const dark = body.classList.contains("dark");
    localStorage.setItem("tree-csp-theme", dark ? "dark" : "light");
    themeToggle.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    renderCharts();
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".timeline-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".timeline-item").forEach((node) => node.classList.remove("active"));
      item.classList.add("active");
    });
  });

  const counters = document.querySelectorAll(".counter");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "true";
      const target = Number(entry.target.dataset.target);
      const duration = 1300;
      const start = performance.now();

      const tick = (now) => {
        const progressValue = Math.min((now - start) / duration, 1);
        entry.target.textContent = Math.floor(progressValue * target);
        if (progressValue < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }, { threshold: 0.35 });

  counters.forEach((counter) => counterObserver.observe(counter));

  const galleryItems = document.querySelectorAll(".gallery-item");

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxText = lightbox.querySelector("p");
  const lightboxClose = document.querySelector(".lightbox-close");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImg.src = item.dataset.img;
      lightboxImg.alt = item.dataset.title;
      lightboxText.innerHTML = `${item.dataset.title}<small>${item.dataset.desc || ""}</small>`;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  let barChart;
  let pieChart;
  const surveyLabels = ["Aware of Benefits", "Future Activities", "Need More Trees", "Awareness Programs"];
  const surveyValues = [80, 89, 94, 85];

  function chartTextColor() {
    return body.classList.contains("dark") ? "#eef8f0" : "#102018";
  }

  function renderCharts() {
    if (!window.Chart) return;
    const barCanvas = document.getElementById("barChart");
    const pieCanvas = document.getElementById("pieChart");
    if (!barCanvas || !pieCanvas) return;

    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    Chart.defaults.color = chartTextColor();
    Chart.defaults.font.family = "Inter";

    barChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: surveyLabels,
        datasets: [{
          label: "Survey Response (%)",
          data: surveyValues,
          borderRadius: 8,
          backgroundColor: ["#1f8a4c", "#2da9a0", "#f2b84b", "#57c77d"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => `${context.raw}%` } }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: "rgba(120, 150, 130, 0.18)" },
            ticks: { callback: (value) => `${value}%` }
          },
          x: { grid: { display: false } }
        }
      }
    });

    pieChart = new Chart(pieCanvas, {
      type: "doughnut",
      data: {
        labels: surveyLabels,
        datasets: [{
          data: surveyValues,
          backgroundColor: ["#1f8a4c", "#2da9a0", "#f2b84b", "#dd6b4d"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, padding: 16 }
          },
          tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}%` } }
        }
      }
    });
  }

  if (window.AOS) {
    AOS.init({
      duration: 750,
      once: true,
      offset: 80
    });
  }

  if (window.Swiper) {
    new Swiper(".species-swiper", {
      slidesPerView: 1,
      spaceBetween: 18,
      loop: true,
      autoplay: {
        delay: 2600,
        disableOnInteraction: false
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      breakpoints: {
        680: { slidesPerView: 2 },
        1000: { slidesPerView: 4 }
      }
    });
  }

  renderCharts();
})();
