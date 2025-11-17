document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dates");

  function createConcertElement(data) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("date-item");

    const fechaEl = document.createElement("h1");
    fechaEl.classList.add("col-fecha");
    fechaEl.textContent = data.date;

    const ciudadEl = document.createElement("h1");
    ciudadEl.classList.add("col-ciudad");
    ciudadEl.textContent = data.city;

    const venueEl = document.createElement("h1");
    venueEl.classList.add("col-venue");
    venueEl.innerHTML = data.venue.replace(/\n/g, "<br>");

    const botonWrapper = document.createElement("div");
    botonWrapper.classList.add("col-boton");

    const botonTickets = document.createElement("button");
    botonTickets.classList.add("btn");
    botonTickets.textContent = "Tickets";

    if (data.ticketsUrl) {
      botonTickets.addEventListener("click", () => {
        window.open(data.ticketsUrl, "_blank");
      });
    } else {
      botonTickets.addEventListener("click", () => {
        alert("No hay enlace de tickets disponible.");
      });
    }

    botonWrapper.appendChild(botonTickets);

    wrapper.appendChild(fechaEl);
    wrapper.appendChild(ciudadEl);
    wrapper.appendChild(venueEl);
    wrapper.appendChild(botonWrapper);

    return wrapper;
  }

  // Suscribirse en tiempo real a la colección "concerts"
  db.collection("concerts")
    .orderBy("date") // ordena por el string "date" (puedes cambiar a otro campo si quieres)
    .onSnapshot((snapshot) => {
      container.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const el = createConcertElement(data);
        container.appendChild(el);
      });
    }, (error) => {
      console.error("Error obteniendo conciertos:", error);
    });
});