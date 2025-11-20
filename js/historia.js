import { db, auth, obtenerUsuario } from "./firebase-config.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { subirImagenCloudinary } from "./cloudinary-config.js";

let esEmpleadoOAdmin = false;
let eventoEditandoId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await obtenerUsuario(user.uid);
        if (userData && (userData.rol === "Empleado" || userData.rol === "Administrador")) {
            esEmpleadoOAdmin = true;
            mostrarControlesAdmin();
        }
    }
    await mostrarEventos(); 
});

function mostrarControlesAdmin() {
    const contenido = document.querySelector(".timeline-contenedor");
    
    if (document.getElementById("btnAgregarEvento")) return;
    
    const btnAgregar = document.createElement("button");
    btnAgregar.id = "btnAgregarEvento";
    btnAgregar.textContent = "+ Agregar Evento";
    btnAgregar.style.cssText = `
        background: #00cc66;
        color: #000;
        padding: 1.5vw 3vw;
        font-size: 2vw;
        font-family: 'Bebas Neue', serif;
        text-transform: uppercase;
        font-weight: bold;
        border: none;
        cursor: pointer;
        display: block;
        margin: 2vw auto;
        transition: transform 0.2s;
    `;
    btnAgregar.onmouseover = () => btnAgregar.style.transform = 'scale(1.05)';
    btnAgregar.onmouseout = () => btnAgregar.style.transform = 'scale(1)';
    btnAgregar.onclick = abrirModalNuevo;
    
    contenido.parentElement.insertBefore(btnAgregar, contenido);
    crearModal();
}

function crearModal() {
    if (document.getElementById("modalEvento")) return;
    
    const modalHTML = `
        <div id="modalEvento" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.95); justify-content:center; align-items:center; overflow-y: auto;">
            <div style="background:#1a1a1a; padding:2vw; border-radius:1vw; width:90%; max-width:700px; max-height:90vh; overflow-y:auto; border:0.3vw solid #69050b; margin: 2vh auto;">
                <h2 id="tituloModal" style="color:#fff; font-size:2.5vw; margin-bottom:1.5vw; border-bottom:0.3vw solid #69050b; padding-bottom:0.5vw;">Agregar Evento Histórico</h2>
                <form id="formEvento">
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Título del Evento *</label>
                    <input type="text" id="inputTitulo" placeholder="Ej: Los Inicios (2009)" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #69050b; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Orden en el Timeline *</label>
                    <input type="number" id="inputOrden" min="1" max="100" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #69050b; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    <small style="color:#aaa; font-size:0.9vw; display:block; margin-top:-0.5vw; margin-bottom:1vw;">Define la posición de este evento (1 = primero)</small>
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Descripción *</label>
                    <textarea id="inputDescripcion" rows="5" required placeholder="Escribe la descripción del evento histórico..." style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #69050b; background:#2a2a2a; color:#fff; border-radius:0.3vw; resize:vertical;"></textarea>
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Imagen *</label>
                    <input type="file" id="inputImagen" accept="image/*" style="color:#fff; font-size:1.1vw; padding:0.5vw; background:#2a2a2a; border:0.2vw solid #69050b; border-radius:0.3vw; width:100%;">
                    <small style="color:#aaa; font-size:0.9vw; display:block; margin-top:0.3vw;">Sube una imagen nueva o déjalo vacío para mantener la actual</small>
                    
                    <div id="vistaPrevia" style="margin-top:1vw; text-align:center;"></div>
                    <div id="loadingIndicator" style="display:none; color:#00cc66; text-align:center; margin-top:1vw; font-size:1.2vw;">⏳ Subiendo imagen...</div>
                    
                    <div style="margin-top:2vw; text-align:right; display:flex; gap:0.5vw; justify-content:flex-end;">
                        <button type="button" id="btnCancelarEvento" style="padding:1vw 2vw; font-size:1.3vw; cursor:pointer; border:none; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; background:#888; color:#000; transition: background 0.3s;">Cancelar</button>
                        <button type="button" id="btnGuardarEvento" style="padding:1vw 2vw; font-size:1.3vw; cursor:pointer; border:none; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; background:#00cc66; color:#000; transition: background 0.3s;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("btnGuardarEvento").onclick = guardarEvento;
    document.getElementById("btnCancelarEvento").onclick = cerrarModal;
    
    document.getElementById("inputImagen").onchange = function(e) {
        const archivo = e.target.files[0];
        const preview = document.getElementById("vistaPrevia");
        
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.innerHTML = `<img src="${event.target.result}" style="max-width:300px; border:0.2vw solid #69050b; border-radius:0.5vw; margin-top:0.5vw;">`;
            };
            reader.readAsDataURL(archivo);
        } else {
            preview.innerHTML = '';
        }
    };
}

function abrirModalNuevo() {
    eventoEditandoId = null;
    document.getElementById("tituloModal").textContent = "Agregar Evento Histórico";
    document.getElementById("formEvento").reset();
    document.getElementById("vistaPrevia").innerHTML = '';
    document.getElementById("modalEvento").style.display = "flex";
}

async function abrirModalEditar(id) {
    eventoEditandoId = id;
    const evento = await obtenerEvento(id);
    
    if (!evento) {
        alert("No se pudo cargar el evento");
        return;
    }

    document.getElementById("tituloModal").textContent = "Editar Evento Histórico";
    document.getElementById("inputTitulo").value = evento.titulo;
    document.getElementById("inputOrden").value = evento.orden;
    document.getElementById("inputDescripcion").value = evento.descripcion;
    
    if (evento.imagen) {
        document.getElementById("vistaPrevia").innerHTML = `
            <p style="color:#fff; font-size:1vw; margin-bottom:0.5vw;">Imagen actual:</p>
            <img src="${evento.imagen}" style="max-width:300px; border:0.2vw solid #69050b; border-radius:0.5vw;">
        `;
    }
    
    document.getElementById("modalEvento").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalEvento").style.display = "none";
    document.getElementById("formEvento").reset();
    document.getElementById("vistaPrevia").innerHTML = '';
    document.getElementById("loadingIndicator").style.display = 'none';
    eventoEditandoId = null;
}

async function guardarEvento() {
    const titulo = document.getElementById("inputTitulo").value.trim();
    const orden = document.getElementById("inputOrden").value;
    const descripcion = document.getElementById("inputDescripcion").value.trim();
    const archivo = document.getElementById("inputImagen").files[0];

    if (!titulo || !orden || !descripcion) {
        alert("Complete todos los campos obligatorios (*)");
        return;
    }

    const datos = {
        titulo,
        orden: parseInt(orden),
        descripcion
    };

    const btnGuardar = document.getElementById("btnGuardarEvento");
    const textoOriginal = btnGuardar.textContent;
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";
    btnGuardar.style.background = "#666";

    let exito;
    if (eventoEditandoId) {
        exito = await actualizarEvento(eventoEditandoId, datos, archivo);
    } else {
        exito = await crearEvento(datos, archivo);
    }

    btnGuardar.disabled = false;
    btnGuardar.textContent = textoOriginal;
    btnGuardar.style.background = "#00cc66";

    if (exito) {
        cerrarModal();
        await mostrarEventos();
    }
}

export async function mostrarEventos() {
    const contenedor = document.querySelector(".timeline-contenedor");
    
    if (!contenedor) return;

    // Guardar el botón de agregar si existe
    const btnAgregar = document.getElementById("btnAgregarEvento");
    
    contenedor.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw; padding:2vw;'>Cargando eventos...</p>";

    try {
        const q = query(collection(db, "historia"), orderBy("orden", "asc"));
        const snapshot = await getDocs(q);
        
        contenedor.innerHTML = "";
        
        if (snapshot.empty) {
            contenedor.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw; padding:2vw;'>No hay eventos históricos</p>";
            return;
        }
        
        snapshot.forEach((docSnap) => {
            const evento = docSnap.data();
            const tarjeta = crearTarjetaEvento(evento, docSnap.id);
            contenedor.innerHTML += tarjeta;
        });
        
        setTimeout(() => {
            if (esEmpleadoOAdmin) {
                agregarBotonesAdmin();
            }
        }, 100);
    } catch (error) {
        console.error("Error al cargar eventos:", error);
        contenedor.innerHTML = "<p style='text-align:center; color:#ff4444; font-size:1.5vw; padding:2vw;'>Error al cargar eventos históricos</p>";
    }
}

function crearTarjetaEvento(evento, id) {
    return `
        <div class="timeline-card" data-id="${id}">
            <div>${evento.titulo}</div>
            <div class="timeline-contenido">
                <img src="${evento.imagen}" alt="${evento.titulo}" class="timeline-img" onerror="this.src='img/Logo.png'">
                <p>${evento.descripcion}</p>
            </div>
        </div>
    `;
}

function agregarBotonesAdmin() {
    document.querySelectorAll(".timeline-card").forEach(card => {
        const id = card.dataset.id;
        
        if (card.querySelector(".botones-admin")) return;
        
        const contenedorBotones = document.createElement("div");
        contenedorBotones.className = "botones-admin";
        
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-editar";
        btnEditar.onmouseover = () => btnEditar.style.transform = 'scale(1.05)';
        btnEditar.onmouseout = () => btnEditar.style.transform = 'scale(1)';
        btnEditar.onclick = () => abrirModalEditar(id);
        
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn-eliminar";
        btnEliminar.onmouseover = () => btnEliminar.style.transform = 'scale(1.05)';
        btnEliminar.onmouseout = () => btnEliminar.style.transform = 'scale(1)';
        btnEliminar.onclick = () => borrarEvento(id);
        
        contenedorBotones.appendChild(btnEditar);
        contenedorBotones.appendChild(btnEliminar);
        card.appendChild(contenedorBotones);
    });
}

export async function crearEvento(datos, archivo) {
    let imagenURL = "";
    
    try {
        if (archivo) {
            document.getElementById("loadingIndicator").style.display = 'block';
            imagenURL = await subirImagenCloudinary(archivo, 'historia');
            document.getElementById("loadingIndicator").style.display = 'none';
        } else {
            alert("Debes subir una imagen para el evento");
            return false;
        }

        await addDoc(collection(db, "historia"), {
            titulo: datos.titulo,
            orden: datos.orden,
            descripcion: datos.descripcion,
            imagen: imagenURL
        });

        alert("Evento agregado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al crear evento:", error);
        alert("Error al agregar evento: " + error.message);
        document.getElementById("loadingIndicator").style.display = 'none';
        return false;
    }
}

export async function actualizarEvento(id, datos, archivo) {
    try {
        const eventoRef = doc(db, "historia", id);
        const datosActualizar = {
            titulo: datos.titulo,
            orden: datos.orden,
            descripcion: datos.descripcion
        };

        if (archivo) {
            document.getElementById("loadingIndicator").style.display = 'block';
            const imagenURL = await subirImagenCloudinary(archivo, 'historia');
            datosActualizar.imagen = imagenURL;
            document.getElementById("loadingIndicator").style.display = 'none';
        }

        await updateDoc(eventoRef, datosActualizar);
        alert("Evento actualizado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al actualizar evento:", error);
        alert("Error al actualizar evento: " + error.message);
        document.getElementById("loadingIndicator").style.display = 'none';
        return false;
    }
}

export async function borrarEvento(id) {
    if (!confirm("¿Está seguro de eliminar este evento histórico?\n\nEsta acción no se puede deshacer.")) return;
    
    try {
        await deleteDoc(doc(db, "historia", id));
        alert("Evento eliminado exitosamente");
        await mostrarEventos();
    } catch (error) {
        console.error("Error al eliminar evento:", error);
        alert("Error al eliminar evento: " + error.message);
    }
}

export async function obtenerEvento(id) {
    try {
        const docSnap = await getDoc(doc(db, "historia", id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener evento:", error);
        return null;
    }
}

window.abrirModalEditar = abrirModalEditar;
window.borrarEvento = borrarEvento;
