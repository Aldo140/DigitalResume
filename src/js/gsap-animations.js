// iOS detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Ensure visibility before animating
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.invisible-before-load').forEach(el => {
    el.classList.remove('invisible-before-load');
    el.classList.add('visible');
  });
});

// Wait for all hero elements before animating
function waitForHeroElements(callback) {
  const checkInterval = setInterval(() => {
    const profileWrapper = document.querySelector(".profile-image-wrapper");
    const userName = document.getElementById("user-name");
    const bio = document.getElementById("bio");
    const buttons = document.querySelectorAll(".hero-social-buttons a");

    if (profileWrapper && userName && bio && buttons.length > 0) {
      clearInterval(checkInterval);
      callback({ profileWrapper, userName, bio, buttons });
    }
  }, 50); // check every 50ms
}

window.addEventListener("load", () => {
  if (!isIOS) {
    waitForHeroElements(({ profileWrapper, userName, bio, buttons }) => {
      gsap.from(profileWrapper, {
        duration: 0.8,
        x: -50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.2
      });

      gsap.from(userName, {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: "power2.out",
        delay: 0.3
      });

      gsap.from(bio, {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: "power2.out",
        delay: 0.4
      });

      buttons.forEach((button, index) => {
        gsap.fromTo(button,
          { opacity: 0, y: 20 },
          {
            duration: 0.5,
            opacity: 1,
            y: 0,
            ease: "power2.out",
            delay: 0.7 + (index * 0.1),
            clearProps: "all"
          }
        );
      });
    });
  }
});

// Scroll Progress Bar
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (window.scrollY / windowHeight) * 100;
  scrollProgress.style.width = `${progress}%`;
});

// Scroll-triggered fade-in animations
const sections = document.querySelectorAll('.section--page');
sections.forEach(section => {
  gsap.fromTo(section,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );
});

// Content reveal on scroll for accessibility
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '50px'
});

sections.forEach(section => observer.observe(section));
