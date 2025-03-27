window.addEventListener("load", () => {
  console.log("✅ tech-toggle.js fully loaded");

  const toggleBtn = document.getElementById("toggle-techstack");
  const hiddenBoxes = document.querySelectorAll(".hidden-box");

  const isSmallScreen = window.innerWidth <= 768;

  if (!toggleBtn || hiddenBoxes.length === 0) {
    console.warn("⚠️ Toggle button or hidden boxes not found.");
    return;
  }

  if (isSmallScreen) {
    // Start collapsed
    hiddenBoxes.forEach(box => box.style.display = "none");
    toggleBtn.style.display = "inline-block";
    toggleBtn.setAttribute("aria-expanded", "false");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

      hiddenBoxes.forEach(box => {
        box.style.display = isExpanded ? "none" : "block";
      });

      toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      toggleBtn.textContent = isExpanded ? "View All" : "Collapse";
    });
  } else {
    // Desktop view — always show everything and hide the toggle button
    hiddenBoxes.forEach(box => box.style.display = "block");
    toggleBtn.style.display = "none";
  }
});
