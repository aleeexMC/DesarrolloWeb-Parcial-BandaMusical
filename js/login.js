import { iniciarSesion } from "./firebase-config.js";

document.getElementById('login').addEventListener('click', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try{
    const userData = iniciarSesion(email, password);

    if (userData) {
      window.location.href = './index.html';
    } else {
      alert("Usuario y/o contraseña incorrectos");
    }
  } catch(error) {
    alert("Hubo un problema al iniciar sesión");
    console.error("Error al iniciar sesión:", error.message);
  }
});

