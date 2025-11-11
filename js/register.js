import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { auth, browserLocalPersistence, browserSessionPersistence } from "./firebaseconfig.js";

const form = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const remember = document.getElementById('remember');

function setMsg(text, ok = false) {
  errorMsg.style.color = ok ? '#22c55e' : '#ff6b6b';
  errorMsg.textContent = text;
}

function mapErr(code, fallback) {
  const map = {
    "auth/email-already-in-use": "Ese correo ya está en uso.",
    "auth/invalid-email": "Correo inválido.",
    "auth/weak-password": "La contraseña es muy débil (mínimo 6).",
    "auth/network-request-failed": "Error de red; revisa tu conexión."
  };
  return map[code] || fallback || "Ocurrió un error.";
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMsg('', false);

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;

  if (!email || !password) return setMsg("Completa correo y contraseña");
  if (password !== password2) return setMsg("Las contraseñas no coinciden");

  try {
    // Persistencia según “Recuérdame”
    await setPersistence(auth, remember?.checked ? browserLocalPersistence : browserSessionPersistence);

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Nombre visible (opcional)
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    // Pasa a tu home (o a login si prefieres exigir verificación primero)
    setTimeout(() => location.replace('/login.html'), 800);

  } catch (err) {
    setMsg(mapErr(err.code, err.message));
  }
});