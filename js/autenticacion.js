import { auth, obtenerUsuario } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {

        const dataUser = await obtenerUsuario(user.uid);

        document.querySelector("#barraNavegacionPrincipal>ul").innerHTML += `
            <li id="navEmpleados"><a href="empleados.html">EMPLEADOS</a></li>
        `;
        
        if (dataUser && (dataUser.rol === "Empleado" || dataUser.rol === "Administrador")) {
            document.querySelector("#barraNavegacionPrincipal>ul").innerHTML += `
                <li id="navAdminAlbums"><a href="discografiaadmin.html">ADMINISTRAR ÁLBUMES</a></li>
            `;
        }

    } else {
        console.error("No se autentico el usuario");
    }
});
