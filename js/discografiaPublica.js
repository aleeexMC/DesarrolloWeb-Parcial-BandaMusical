import { obtenerAlbums,auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.querySelector("#btnGestionarDiscos").innerHTML += `
            <a id="gestionarDiscos" href="./discografiaadmin.html">Administrar álbumes</a>
        `;
    } else {

    }
});

async function cargarDiscografia() {

    const contenedor = document.querySelector(".grid-discos");
    contenedor.innerHTML = ""; 

    const albums = await obtenerAlbums();

    albums.forEach(album => {

        const div = document.createElement("div");
        div.classList.add("disco");

        div.innerHTML = `
            <img src="${album.portada}" alt="${album.titulo}" class="portada">

            <h2>${album.titulo}</h2>
            <p>${album.ano}</p>

            ${
                album.spotify 
                ? `<iframe style="border-radius:12px" src="${album.spotify}"
                     width="100%" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
                   </iframe>`
                : `<p style="color:#f2f2f2; font-size:1vw; opacity:0.6">Sin Spotify</p>`
            }

            ${
                album.youtube 
                ? `<p><a href="${album.youtube}" target="_blank" class="youtube-link">Ver en Youtube</a></p>`
                : `<p style="color:#f2f2f2; font-size:1vw; opacity:0.6">Sin Youtube</p>`
            }
        `;

        contenedor.appendChild(div);
    });

}

window.addEventListener("DOMContentLoaded", cargarDiscografia);
