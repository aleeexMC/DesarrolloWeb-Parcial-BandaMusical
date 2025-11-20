import { crearEmpleado, obtenerUsuario, obtenerUsuarios, auth } from "./firebase-config.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        let usuario = await obtenerUsuario(user.uid);
        console.log(usuario.rol);
        const btn = document.getElementById('agregarEmpleadoModal');
        if (usuario.rol == "Administrador") {
            btn.disabled = false;
        } else {
            btn.disabled = true;
            btn.style.background = 'rgb(125, 19, 17)';
        }
    }
});

async function cargarUsuarios() {
    const listaUsuarios = document.getElementById("userList");
    listaUsuarios.innerHTML = "";

    const snapshot = await obtenerUsuarios();
    snapshot.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.correo}</td>
            <td>${user.nombre}</td>
            <td>${user.apellido}</td>
            <td>${user.rol}</td>
        `;
        listaUsuarios.appendChild(row);
    });
}

document.getElementById('registrarUsuario').addEventListener("click", async (e) => {

    let firstName = document.getElementById('firstName').value;
    let lastName = document.getElementById('lastName').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    const status = await crearEmpleado(email, password, firstName, lastName);

    if (status) {
        alert("Empleado agregado exitosamente");

        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    } else {
        alert("Ya existe un empleado asociado a este correo")
    }
});

window.addEventListener("load", cargarUsuarios);