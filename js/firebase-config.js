import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, addDoc, setDoc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
const db = getFirestore(app);

export async function crearEmpleado(email, password, firstName, lastName){
    try{
        const credencialesUsuario = await createUserWithEmailAndPassword(auth, email, password);
        const user = credencialesUsuario.user;
        await setDoc(doc(db, "users", user.uid), {
            nombre: firstName,
            apellido: lastName,
            correo: email,
            rol: "Empleado"
        });
        console.log('Usuario creado exitosamente:',credencialesUsuario.user);
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
      console.log("Inicio de sesión exitoso:", dataUser.data().role);
      return dataUser.data();
    } else {
      throw new Error("El usuario no existe en la base de datos.");
    }
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    return null;
  }
}

export const obtenerUsuario = async () => {
  const resultado = await getDocs(collection(db, 'users'));
  return resultado.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const obtenerUsuarios = async (id) => {
  const resultado = await getDoc(doc(db, 'users', id));
  return resultado.exists() ? { id: resultado.id, ...resultado.data() } : null;
};

export function obtenerIdUsuario() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}