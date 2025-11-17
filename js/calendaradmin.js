import { auth, db, iniciarSesion } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const adminPanel = document.getElementById('admin-section');
const notLoggedIn = document.getElementById('login-section');
const form = document.getElementById('concert-form');
const logoutBtn = document.getElementById('btn-logout');


onAuthStateChanged(auth, (user) => {
  if (user) {
    adminPanel.classList.remove('hidden');
    notLoggedIn.classList.add('hidden')
  } else {
    adminPanel.classList.add('hidden');
    notLoggedIn.classList.remove('hidden');
  }
});

notLoggedIn.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const result = await iniciarSesion(email, password);
  if (!result) {
    alert('Credenciales inválidas o error en login');
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fecha = document.getElementById('concert-date').value;
  const ciudad = document.getElementById('concert-city').value;
  const lugar = document.getElementById('concert-venue').value;

  try {
    await addDoc(collection(db, 'concerts'), {
      fecha,
      ciudad,
      lugar,
      createdAt: serverTimestamp()
    });
    alert('Concierto agregado correctamente');
    form.reset();
  } catch (error) {
    console.error('Error al agregar concierto:', error);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

