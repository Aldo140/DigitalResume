window.addEventListener("load", () => {
  console.log("✅ tech-toggle.js window fully loaded");

  const toggleBtn = document.getElementById("toggle-techstack");
  const techGrids = document.querySelectorAll(".tech-grid");

  console.log("🔍 toggleBtn found:", !!toggleBtn);
  console.log("🔍 techGrids found:", techGrids.length);

  if (!toggleBtn || techGrids.length === 0) {
    console.warn("⚠️ Toggle button or tech grids not found.");
    return;
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    techGrids.forEach(grid => grid.classList.add("collapsed"));
    toggleBtn.style.display = "inline-block";
    toggleBtn.setAttribute("aria-expanded", "false");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

      techGrids.forEach(grid => {
        grid.classList.toggle("collapsed", isExpanded);
      });

      toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      toggleBtn.textContent = isExpanded ? "See All" : "Collapse";
    });
  } else {
    toggleBtn.style.display = "none"; // hide toggle on desktop
  }
});
