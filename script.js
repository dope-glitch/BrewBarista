// Welcome message in the browser console
window.addEventListener('load', () => {
  console.log("Welcome to BrewBarista!");
});

// Smooth scrolling for links that point to sections on the same page.
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
