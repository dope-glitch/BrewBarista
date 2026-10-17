document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default submission

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!username) {
      alert("Please enter your username.");
      return;
    }
    if (!password) {
      alert("Please enter your password.");
      return;
    }

    // Placeholder login check (replace with real authentication later)
    alert(`Welcome back, ${username}! Login successful.`);
    form.reset();
  });
});
