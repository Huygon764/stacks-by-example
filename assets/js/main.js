(function () {
  // ========== Dark Mode Toggle ==========
  const THEME_KEY = "stacks-by-example-theme";
  const themeToggle = document.getElementById("themeToggle");

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // Initialize theme
  setTheme(getPreferredTheme());

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  // ========== Copy Button for Code Blocks ==========
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach(function (pre) {
      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create copy button
      const copyButton = document.createElement("button");
      copyButton.className = "copy-button";
      copyButton.textContent = "Copy";
      copyButton.setAttribute("aria-label", "Copy code to clipboard");
      wrapper.appendChild(copyButton);

      // Copy functionality
      copyButton.addEventListener("click", function () {
        const code = pre.querySelector("code");
        const text = code ? code.textContent : pre.textContent;

        navigator.clipboard
          .writeText(text)
          .then(function () {
            copyButton.textContent = "Copied!";
            copyButton.classList.add("copied");

            setTimeout(function () {
              copyButton.textContent = "Copy";
              copyButton.classList.remove("copied");
            }, 2000);
          })
          .catch(function () {
            copyButton.textContent = "Error";
            setTimeout(function () {
              copyButton.textContent = "Copy";
            }, 2000);
          });
      });
    });
  }

  // ========== Mobile Menu Toggle ==========
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      menuToggle.classList.toggle("open");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInsideSidebar = sidebar.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);

      if (
        !isClickInsideSidebar &&
        !isClickOnToggle &&
        sidebar.classList.contains("open")
      ) {
        sidebar.classList.remove("open");
        menuToggle.classList.remove("open");
      }
    });
  }

  // ========== Initialize ==========
  document.addEventListener("DOMContentLoaded", function () {
    addCopyButtons();
  });

  // Run immediately if DOM already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
