import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('loginIniciarSesion').innerText = "Cerrar sesión";
        document.getElementById('loginIniciarSesion').setAttribute('href', 'index.html');
        document.getElementById("loginIniciarSesion").addEventListener("click", async (e) => {
            e.preventDefault()
            try {
                await signOut(auth);
                alert("Se ha cerrado la sesión");
                window.location.href = "./index.html";
            } catch (error) {
                console.error("Error al cerrar sesion:", error);
            }
        });
    } else {
        document.getElementById('loginIniciarSesion').innerText = "Iniciar sesión";
        document.getElementById('loginIniciarSesion').setAttribute('href', 'login.html');
    }
});

