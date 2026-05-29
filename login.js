document.addEventListener("DOMContentLoaded", function () {

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const password = document.getElementById("password").value;

  if (password === "12345") {
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admin.html";
  } else {
    msg.textContent = "Wrong password";
  }
});

});