// Grab all theme switcher elements
const themes = document.getElementsByClassName("theme");

// Apply event listener to each theme bubble
Array.from(themes).forEach((theme) => {
  theme.addEventListener("click", (e) => {
    const selectedTheme = e.target.dataset.theme;
    document.body.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
});

// On load, apply saved theme (or default to light)
function getThemeOnLoad() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  } else {
    document.body.setAttribute("data-theme", "light");
  }
}

getThemeOnLoad();
