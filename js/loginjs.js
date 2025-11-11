import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import { auth, browserLocalPersistence, browserSessionPersistence } from "./firebaseconfig.js";

const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const resetLink = document.getElementById('resetLink');
const remember = document.getElementById('remember');

function msgError(code, fallback) {
  const map = {
    "auth/invalid-email": "Correo inválido",
    "auth/user-disabled": "Usuario deshabilitado",
    "auth/too-many-requests": "Demasiados intentos; intenta más tarde",
    "auth/network-request-failed": "Error de red; revisa tu conexión"
  };
  return map[code] || fallback || "Ocurrió un error";
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // Cambia persistencia según "Recuérdame"
    await setPersistence(auth, remember.checked ? browserLocalPersistence : browserSessionPersistence);

    // Autentica
    await signInWithEmailAndPassword(auth, email, password);

    // Redirige sin dejar POST en historial
    location.replace('/index.html');
    if (history.replaceState) history.replaceState(null, '', location.pathname);

  } catch (err) {
    if (err.code === 'auth/invalid-credential') {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (!methods || methods.length === 0) {
          errorMsg.textContent = "No hay ninguna cuenta con ese correo.";
        } else if (!methods.includes('password')) {
          errorMsg.textContent = "Este correo usa otro método de acceso (no contraseña).";
        } else {
          errorMsg.textContent = "Contraseña incorrecta.";
        }
      } catch {
        errorMsg.textContent = "Credenciales inválidas.";
      }
      return;
    }

    // Otros errores conocidos
    errorMsg.textContent = msg(err.code, err.message);
  }
});