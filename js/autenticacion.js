import { auth, obtenerUsuario } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await obtenerUsuario(user.uid);
        
        if (userData && userData.rol === "Administrador") {
            document.querySelector("#barraNavegacionPrincipal>ul").innerHTML += `
                <li id="navEmpleados"><a href="empleados.html">EMPLEADOS</a></li>
            `;
        }
    } else {
        console.log("No se autentico el usuario");
    }
});