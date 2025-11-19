import {
    auth,
    obtenerUsuario,
    guardarAlbum,
    obtenerAlbums,
    eliminarAlbum,
    obtenerAlbum,
    editarAlbum
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Debes iniciar sesión.");
        window.location.href = "login.html";
        return;
    }

    const usuario = await obtenerUsuario(user.uid);

    if (usuario.rol !== "Administrador" && usuario.rol !== "Empleado") {
        alert("No tienes permisos.");
        window.location.href = "index.html";
    }
});


let editando = false;
let idEditando = null;


const form = document.getElementById("formAlbum");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const ano = document.getElementById("ano").value;
    const portada = document.getElementById("portada").value;
    const spotify = document.getElementById("spotify").value;
    const youtube = document.getElementById("youtube").value;

    const album = {
        titulo,
        ano,
        portada,
        spotify,
        youtube,
        fechaRegistro: new Date()
    };

    if (editando) {
        const ok = await editarAlbum(idEditando, album);

        if (ok) {
            alert("Álbum actualizado correctamente.");
            form.reset();
            editando = false;
            idEditando = null;
            document.getElementById("guardarAlbum").innerText = "Guardar Álbum";
            cargarDiscografia();
        }
        return;
    }

    const ok = await guardarAlbum(album);

    if (ok) {
        alert("Álbum creado.");
        form.reset();
        cargarDiscografia();
    }
});


async function cargarDiscografia() {
    const datos = await obtenerAlbums();
    const tabla = document.getElementById("tablaDiscografia");
    tabla.innerHTML = "";

    datos.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><img src="${a.portada}" width="80"></td>
            <td>${a.titulo}</td>
            <td>${a.ano}</td>
            <td>${a.spotify ? "✔️" : "—"}</td>
            <td>${a.youtube ? "✔️" : "—"}</td>
            <td>
                <button class="btnEliminar" data-id="${a.id}">Eliminar</button>
                <button class="btnEditar" data-id="${a.id}">Editar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });

    
    document.querySelectorAll(".btnEliminar").forEach(boton => {
        boton.addEventListener("click", async () => {
            if (confirm("¿Eliminar álbum?")) {
                await eliminarAlbum(boton.dataset.id);
                cargarDiscografia();
            }
        });
    });

    
    document.querySelectorAll(".btnEditar").forEach(boton => {
        boton.addEventListener("click", async () => {
            const album = await obtenerAlbum(boton.dataset.id);

            
            document.getElementById("titulo").value = album.titulo;
            document.getElementById("ano").value = album.ano;
            document.getElementById("portada").value = album.portada;
            document.getElementById("spotify").value = album.spotify;
            document.getElementById("youtube").value = album.youtube;

            
            editando = true;
            idEditando = album.id;
            document.getElementById("guardarAlbum").innerText = "Guardar cambios";
        });
    });
}

window.addEventListener("load", cargarDiscografia);