import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.querySelector("#barraNavegacionPrincipal>ul").innerHTML += `
            <li id="navEmpleados"><a href="empleados.html">EMPLEADOS</a></li>
        `
    } else {
        console.error("No se autentico el usuario");
    }
});