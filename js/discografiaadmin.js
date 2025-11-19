import { 
    auth, 
    obtenerUsuario, 
    guardarAlbum, 
    obtenerAlbums, 
    eliminarAlbum 
} from "./firebase-config.js";

import { 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

let canciones = [];

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


document.getElementById("agregarCancion").addEventListener("click", () => {

    const nombre = document.getElementById("nombreCancion").value;
    const duracion = document.getElementById("duracionCancion").value;

    if (!nombre || !duracion) {
        alert("Completa nombre y duración");
        return;
    }

    canciones.push({ nombre, duracion });

    const li = document.createElement("li");
    li.textContent = `${nombre} - ${duracion}`;
    document.getElementById("listaCanciones").appendChild(li);

    document.getElementById("nombreCancion").value = "";
    document.getElementById("duracionCancion").value = "";
});


document.getElementById("formAlbum").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const ano = document.getElementById("ano").value;
    const portada = document.getElementById("portada").value;
    const descripcion = document.getElementById("descripcion").value;
    const spotify = document.getElementById("spotify").value;
    const youtube = document.getElementById("youtube").value;

    if (canciones.length === 0) {
        alert("Agrega al menos una canción");
        return;
    }

    const album = {
        titulo, 
        ano, 
        portada, 
        descripcion, 
        spotify, 
        youtube,
        canciones,
        fechaRegistro: new Date()
    };

    const ok = await guardarAlbum(album);

    if (ok) {
        alert("Álbum creado");

        canciones = [];
        document.getElementById("listaCanciones").innerHTML = "";
        e.target.reset();

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
            <td>${a.canciones.length}</td>
            <td>${a.spotify ? "✔️" : "—"}</td>
            <td>${a.youtube ? "✔️" : "—"}</td>
            <td>
                <button class="btn-eliminar" data-id="${a.id}">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });

    document.querySelectorAll(".btn-eliminar").forEach(boton => {
        boton.addEventListener("click", async () => {
            if (confirm("¿Eliminar álbum?")) {
                await eliminarAlbum(boton.dataset.id);
                cargarDiscografia();
            }
        })
    });
}

window.addEventListener("load", cargarDiscografia);
