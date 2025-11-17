document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const adminSection = document.getElementById("admin-section");
  const dateInput = document.getElementById("concert-date");
  const cityInput = document.getElementById("concert-city");
  const venueInput = document.getElementById("concert-venue");
  const urlInput = document.getElementById("concert-tickets");
  const addButton = document.getElementById("btn-save")

  // Si quieres controlar qué correos son admin:
  const ADMIN_EMAILS = ["victorlopez@email.com"]; // cambia por los tuyos

  function esAdmin(user) {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  }

  auth.onAuthStateChanged((user) => {
    console.log("onAuthStateChanged =>", user ? user.email : "no logeado");

    // Si NO hay usuario logeado
    if (!user) {
      // mostrar login, ocultar panel admin
      loginSection.classList.remove("hidden");
      adminSection.classList.add("hidden");
      return;
    }

    // Si quieres filtrar por admin:
    if (!esAdmin(user)) {
      alert("No tienes permisos de administrador");
      auth.signOut();
      return;
    }

    // Usuario logeado y con permisos:
    loginSection.classList.add("hidden");
    adminSection.classList.remove("hidden");

    // Aquí puedes llamar a una función que cargue los conciertos desde Firestore
    // loadConcerts();
  });

  addButton.addEventListener("click", () => {
    const date = dateInput.value.trim();
    const city = cityInput.value.trim();
    const venue = venueInput.value.trim();
    const ticketsUrl = urlInput.value.trim();

    if (!date || !city || !venue) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    const concertData = {
      date,
      city,
      venue,
      ticketsUrl: ticketsUrl || null
    };

    db.collection("concerts")
      .add(concertData)
      .then(() => {
        alert("🎉 Concierto agregado con éxito");
        dateInput.value = "";
        cityInput.value = "";
        venueInput.value = "";
        urlInput.value = "";
      })
      .catch((error) => {
        console.error("Error al agregar concierto:", error);
        alert("Ocurrió un error al guardar el concierto.");
      });
  });
});