import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async(user) => {
    if (user) {
        document.getElementById('loginIniciarSesion').setAttribute('id', 'loginCerrarSesion');
        document.getElementById('loginCerrarSesion').innerText = "Cerrar sesión";
        document.getElementById('loginCerrarSesion').setAttribute('href', 'index.html');
    } else {
        document.getElementById('loginCerrarSesion').setAttribute('id', 'loginIniciarSesion');
        document.getElementById('loginIniciarSesion').innerText = "Iniciar sesión";
        document.getElementById('loginIniciarSesion').setAttribute('href', 'login.html');
    }
});

document.getElementById("loginCerrarSesion").addEventListener("click", async() => {
    try{
        await signOut(auth);
        alert("Se ha cerrado la sesión");
        window.location.href = "index.html";
    } catch(error) {
        console.error("Error al cerrar sesion:", error);
    }
});