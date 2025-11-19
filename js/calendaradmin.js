import { auth, db, iniciarSesion } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const adminPanel = document.getElementById('admin-section');
const notLoggedIn = document.getElementById('login-section');
const form = document.getElementById('concert-form');
const logoutBtn = document.getElementById('btn-logout');
const dltbtn=document.getElementById('delete-btn');
const editForm = document.getElementById('edit-concert-form');
let conciertoEditandoId = null;


onAuthStateChanged(auth, (user) => {
  if (user) {
    adminPanel.classList.remove('hidden');
    notLoggedIn.classList.add('hidden')
    verConciertos();
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

async function verConciertos() {
  const concertList = document.getElementById('concert-list');
  concertList.innerHTML = ''; // Limpiar contenido anterior

  try {
    const querySnapshot = await getDocs(collection(db, 'concerts'));

    if (querySnapshot.empty) {
      concertList.innerHTML = '<p>No hay conciertos disponibles.</p>';
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;

      const concertItem = document.createElement('div');
      concertItem.classList.add('concert-item');

      concertItem.innerHTML = `
        <p><strong>Fecha:</strong> ${data.fecha || 'No especificada'}</p>
        <p><strong>Ciudad:</strong> ${data.ciudad || 'No especificada'}</p>
        <p><strong>Lugar:</strong> ${data.lugar || 'No especificado'}</p>
        <button class="edit-btn" data-id="${id}">Editar</button>
        <button class="delete-btn" data-id="${id}">Eliminar</button>
      `;

      concertList.appendChild(concertItem);
      
    });
    agregarEventosEliminar();
    agregarEventosEditar();

  } catch (error) {
    console.error('Error al obtener conciertos:', error);
    concertList.innerHTML = '<p>Error al cargar los conciertos.</p>';
  }
}
async function eliminarConcierto(id) {
  try {
    const concertRef = doc(db, 'concerts', id);
    await deleteDoc(concertRef);
    console.log('Concierto eliminado con éxito');
    verConciertos(); // vuelve a cargar la lista
  } catch (error) {
    console.error('Error al eliminar concierto:', error);
  }
}

// Escucha los botones (llama a esta después de renderizar los conciertos)
function agregarEventosEliminar() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await eliminarConcierto(id);
    });
  });
}
function agregarEventosEditar() {
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const querySnapshot = await getDocs(collection(db, 'concerts'));
      querySnapshot.forEach(docSnap => {
        if (docSnap.id === id) {
          const data = docSnap.data();

          // Rellenar campos
          document.getElementById('edit-concert-date').value = data.fecha;
          document.getElementById('edit-concert-city').value = data.ciudad;
          document.getElementById('edit-concert-venue').value = data.lugar;

          // Mostrar el formulario
          editForm.classList.remove('hidden');
          conciertoEditandoId = id;
        }
      });
    });
  });
}

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fecha = document.getElementById('edit-concert-date').value;
  const ciudad = document.getElementById('edit-concert-city').value;
  const lugar = document.getElementById('edit-concert-venue').value;

  try {
    const concertRef = doc(db, 'concerts', conciertoEditandoId);
    await updateDoc(concertRef, {
      fecha,
      ciudad,
      lugar
    });

    alert('Concierto actualizado correctamente');
    editForm.classList.add('hidden');
    conciertoEditandoId = null;
    verConciertos();
  } catch (error) {
    console.error('Error al editar concierto:', error);
  }
});



