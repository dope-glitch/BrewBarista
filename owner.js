document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ownerForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default submission

    const cafeName = document.getElementById("cafeName").value.trim();
    const ownerName = document.getElementById("ownerName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const location = document.getElementById("location").value.trim();
    const pin = document.getElementById("pin").value.trim();

    // Basic validation
    if (!cafeName) {
      alert("Please enter your café name.");
      return;
    }
    if (!ownerName) {
      alert("Please enter owner name.");
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
    if (!location) {
      alert("Please enter café location.");
      return;
    }
    if (!pin || pin.length !== 6) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    // If all validations pass
    alert(`Thank you, ${ownerName}! Your café "${cafeName}" has been registered.`);
    form.reset();
  });
});
