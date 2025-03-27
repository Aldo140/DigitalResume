window.addEventListener("load", () => {
  console.log("✅ tech-toggle.js fully loaded");

  const toggleBtn = document.getElementById("toggle-techstack");
  const techItems = document.querySelectorAll(".tech-items");

  const isLargeScreen = window.innerWidth >= 769;

  if (!toggleBtn || techItems.length === 0) {
    // Quietly exit if the button or grids aren’t found
    return;
  }

  if (isLargeScreen) {
    // Desktop/tablet: collapsed by default
    techItems.forEach(grid => grid.classList.add("collapsed"));
    toggleBtn.style.display = "inline-block";
    toggleBtn.setAttribute("aria-expanded", "false");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

      techItems.forEach(grid => {
        grid.classList.toggle("collapsed", isExpanded);
      });

      toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      toggleBtn.textContent = isExpanded ? "See All" : "Collapse";
    });
  } else {
    // Mobile: everything open, no toggle button
    techItems.forEach(grid => grid.classList.remove("collapsed"));
    toggleBtn.style.display = "none";
  }
});
