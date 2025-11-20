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

import { subirPortadaAlbum } from "./cloudinary-config.js";

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
    const archivoPortada = document.getElementById("portadaArchivo").files[0];
    const spotify = document.getElementById("spotify").value;
    const youtube = document.getElementById("youtube").value;

    let urlPortada = null;

    // Si hay archivo nuevo, subirlo a Cloudinary
    if (archivoPortada) {
        const indicador = document.getElementById("indicadorCarga");
        indicador.style.display = "block";

        try {
            urlPortada = await subirPortadaAlbum(archivoPortada);
            indicador.style.display = "none";
        } catch (error) {
            indicador.style.display = "none";
            alert("Error al subir la imagen: " + error.message);
            return;
        }
    }

    // Si estamos editando y NO hay archivo nuevo, mantener la portada anterior
    if (editando && !urlPortada) {
        const albumActual = await obtenerAlbum(idEditando);
        urlPortada = albumActual.portada;
    }

    // Validar que haya portada
    if (!urlPortada) {
        alert("Debes subir una portada para el álbum.");
        return;
    }

    const album = {
        titulo,
        ano,
        portada: urlPortada,
        spotify,
        youtube,
        fechaRegistro: new Date()
    };

    if (editando) {
        const ok = await editarAlbum(idEditando, album);

        if (ok) {
            alert("Álbum actualizado correctamente.");
            form.reset();
            document.getElementById("previsualizacionPortada").innerHTML = "";
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
        document.getElementById("previsualizacionPortada").innerHTML = "";
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
            <td>${a.spotify ? '<span style="color:rgb(252, 207, 2); font-size:1.5vw;">✓</span>' : '<span style="color:#666;">—</span>'}</td>
            <td>${a.youtube ? '<span style="color:rgb(252, 207, 2); font-size:1.5vw;">✓</span>' : '<span style="color:#666;">—</span>'}</td>
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
            document.getElementById("spotify").value = album.spotify || "";
            document.getElementById("youtube").value = album.youtube || "";

            // Mostrar vista previa de la portada actual
            const previsualizacion = document.getElementById("previsualizacionPortada");
            previsualizacion.innerHTML = `
                <p style="color:#00cc66; font-size:0.9vw; margin-bottom:0.5vw;">Portada actual:</p>
                <img src="${album.portada}" style="max-width:200px; border:2px solid #00cc66;">
                <p style="color:#666; font-size:0.85vw; margin-top:0.5vw;">Sube una nueva imagen solo si deseas cambiarla</p>
            `;

            
            editando = true;
            idEditando = album.id;
            document.getElementById("guardarAlbum").innerText = "Guardar cambios";
            
            // Scroll hacia el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Preview de imagen al seleccionar archivo
document.getElementById("portadaArchivo").addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    const previsualizacion = document.getElementById("previsualizacionPortada");

    if (archivo) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previsualizacion.innerHTML = `
                <p style="color:#00cc66; font-size:0.9vw; margin-bottom:0.5vw;">Vista previa:</p>
                <img src="${event.target.result}" style="max-width:200px; border:2px solid #00cc66;">
            `;
        };
        reader.readAsDataURL(archivo);
    } else {
        previsualizacion.innerHTML = "";
    }
});

window.addEventListener("load", cargarDiscografia);