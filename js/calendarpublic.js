import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("dates");

function createConcertElement(data) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("date-item");

  const fechaEl = document.createElement("h1");
  fechaEl.classList.add("col-fecha");
  fechaEl.textContent = data.fecha;

  const ciudadEl = document.createElement("h1");
  ciudadEl.classList.add("col-ciudad");
  ciudadEl.textContent = data.ciudad;

  const venueEl = document.createElement("h1");
  venueEl.classList.add("col-venue");
  venueEl.innerHTML = data.lugar.replace(/\n/g, "<br>");

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

  try {
    const concertsRef = collection(db, "concerts");
    const concertsQuery = query(concertsRef, orderBy("fecha"));
    const snapshot = await getDocs(concertsQuery);

    if (snapshot.empty) {
      console.log("No se encontraron conciertos.");
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Concierto:", data); // Para debug
      const el = createConcertElement(data);
      container.appendChild(el);
    });
  } catch (error) {
    console.error("Error al cargar conciertos:", error);
  }
});