// Hero entrance animation
gsap.from("#profile-pic", {
  duration: 0.8,
  x: -50,
  opacity: 0,
  ease: "power2.out",
  delay: 0.2
});

gsap.from("#user-name", {
  duration: 0.8,
  y: 20,
  opacity: 0,
  ease: "power2.out",
  delay: 0.3
});

gsap.from("#bio", {
  duration: 0.8,
  y: 20,
  opacity: 0,
  ease: "power2.out",
  delay: 0.4
});

// Contact info animations
const contactElements = document.querySelectorAll("#email, #location");
contactElements.forEach((element, index) => {
  gsap.fromTo(element,
    {
      opacity: 0,
      y: 20,
      visibility: "visible"
    },
    {
      duration: 0.5,
      opacity: 1,
      y: 0,
      ease: "power2.out",
      delay: 0.5 + (index * 0.1),
      visibility: "visible",
      clearProps: "all"
    }
  );
});

// Social buttons animation with improved stability
const socialButtons = document.querySelectorAll(".social-buttons a");
socialButtons.forEach((button, index) => {
  gsap.fromTo(button,
    {
      opacity: 0,
      y: 20,
      visibility: "visible"
    },
    {
      duration: 0.5,
      opacity: 1,
      y: 0,
      ease: "power2.out",
      delay: 0.7 + (index * 0.1),
      visibility: "visible",
      clearProps: "all"
    }
  );
});

// Scroll Progress Indicator
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (window.scrollY / windowHeight) * 100;
  scrollProgress.style.width = `${progress}%`;
});

// Enhanced Section Animations
const sections = document.querySelectorAll('.section--page');
sections.forEach((section, index) => {
  gsap.fromTo(section,
    {
      opacity: 0,
      y: 30
    },
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

// Content Loading Animation
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section--page');
    
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

    sections.forEach(section => {
        observer.observe(section);
    });
});

