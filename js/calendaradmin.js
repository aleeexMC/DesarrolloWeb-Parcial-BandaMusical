import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const adminPanel = document.getElementById("admin-section");
  const dateInput = document.getElementById("concert-date");
  const cityInput = document.getElementById("concert-city");
  const venueInput = document.getElementById("concert-venue");
  const urlInput = document.getElementById("concert-tickets");
  const addButton = document.getElementById("btn-save")

const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    // mostrar admin
    document.getElementById("admin-section").classList.remove("hidden");
    loginSection.classList.add("hidden");
  } else {
    // redirigir o mostrar login
    window.location.href = "login.html";
  }
});


  // Lógica para agregar conciertos
  addButton.addEventListener("click", () => {
    const date = document.getElementById("concert-date").value.trim();
    const city = document.getElementById("concert-city").value.trim();
    const venue = document.getElementById("concert-venue").value.trim();
    const ticketsUrl = document.getElementById("concert-url").value.trim();

    if (!date || !city || !venue) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    db.collection("concerts").add({
      date,
      city,
      venue,
      ticketsUrl: ticketsUrl || null
    }).then(() => {
      alert("Concierto agregado con éxito");
      document.getElementById("concert-date").value = "";
      document.getElementById("concert-city").value = "";
      document.getElementById("concert-venue").value = "";
      document.getElementById("concert-url").value = "";
    }).catch(error => {
      console.error("Error al guardar concierto:", error);
      alert("Ocurrió un error.");
    });
  });
});

