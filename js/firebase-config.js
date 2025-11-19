import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNjjpTf1CLS55FZaD8kt04-oPpo2ALxSg",
    authDomain: "proyecto-twentyonepilots.firebaseapp.com",
    projectId: "proyecto-twentyonepilots",
    storageBucket: "proyecto-twentyonepilots.firebasestorage.app",
    messagingSenderId: "445465308578",
    appId: "1:445465308578:web:7f6b6a169cbb0de8c3d6fb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const secondApp = initializeApp(firebaseConfig, "segundaInstancia");
const secondAuth = getAuth(secondApp);

export async function crearEmpleado(email, password, firstName, lastName){
    try{
        const credencialesUsuario = await createUserWithEmailAndPassword(secondAuth, email, password);
        const user = credencialesUsuario.user;
        await setDoc(doc(db, "users", user.uid), {
            nombre: firstName,
            apellido: lastName,
            correo: email,
            rol: "Empleado"
        });
        console.log('Usuario creado exitosamente:',credencialesUsuario.user);
        await signOut(secondAuth)
        return true;
    } catch(error) {
        console.log('Error:', error.message);
        return false;
    }
}

export async function iniciarSesion(email, password) {
  try {
    const credencialesUsuario = await signInWithEmailAndPassword(auth, email, password);
    const user = credencialesUsuario.user;

    const dataUser = await getDoc(doc(db, 'users', user.uid));

    if (dataUser.exists()) {
      console.log("Inicio de sesión exitoso:", dataUser.data().rol);
      return dataUser.data();
    } else {
      throw new Error("El usuario no existe en la base de datos.");
    }
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    return null;
  }
}

export const obtenerUsuarios = async () => {
  const resultado = await getDocs(collection(db, 'users'));
  return resultado.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const obtenerUsuario = async (id) => {
  const resultado = await getDoc(doc(db, 'users', id));
  return resultado.exists() ? { id: resultado.id, ...resultado.data() } : null;
};

export function obtenerIdUsuario() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

export async function guardarAlbum(album) {
    try {
        await addDoc(collection(db, "discografia"), album);
        return true;
    } catch (e) {
        console.error("Error guardando álbum:", e);
        return false;
    }
}

export async function editarAlbum(id, album) {
  try {
    await updateDoc(doc(db, 'discografia', id), {
      ...album
    });
    return true;
  } catch (e) {
     console.error("Error guardando album:", e);
     return false;
  }
}

export async function obtenerAlbum(id){
  try {
    const resultado = await getDoc(doc(db, 'discografia', id));
    return resultado.exists() ? {id:resultado.id, ...resultado.data()} : null;
  } catch (e) {
    console.error("Error obteniendo album:",e)
  }
}

export async function obtenerAlbums() {
    try {
        const snapshot = await getDocs(collection(db, "discografia"));

        let albums = [];

        snapshot.forEach((docu) => {
            albums.push({
                id: docu.id,
                ...docu.data()
            });
        });

        return albums;

    } catch (e) {
        console.error("Error obteniendo álbumes:", e);
        return [];
    }
}

export async function eliminarAlbum(id) {
    try {
        await deleteDoc(doc(db, "discografia", id));
        return true;
    } catch (e) {
        console.error("Error eliminando álbum:", e);
        return false;
    }
}