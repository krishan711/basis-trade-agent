const revealTargets = document.querySelectorAll('.reveal-section, .reveal-card');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.18 }
);

revealTargets.forEach((target) => observer.observe(target));
