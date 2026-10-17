document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default submission

    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const guests = document.getElementById("guests").value.trim();

    // Basic validation
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    if (!age || age <= 0) {
      alert("Please enter a valid age.");
      return;
    }
    if (!phone || phone.length < 10) {
      alert("Please enter a valid phone number (at least 10 digits).");
      return;
    }
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!guests || guests <= 0) {
      alert("Please enter number of guests.");
      return;
    }

    // If all validations pass
    alert(`Thank you, ${name}! Your booking for ${guests} guests has been submitted.`);
    form.reset();
  });
});
