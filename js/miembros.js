import { db, auth, obtenerUsuario } from "./firebase-config.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { subirImagenCloudinary } from "./cloudinary-config.js";

let esEmpleadoOAdmin = false;
let miembroEditandoId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await obtenerUsuario(user.uid);
        if (userData && (userData.rol === "Empleado" || userData.rol === "Administrador")) {
            esEmpleadoOAdmin = true;
            mostrarControlesAdmin();
        }
    }
    await mostrarMiembros(); 
});

function mostrarControlesAdmin() {
    const contenido = document.getElementById("contenido");
    
    if (document.getElementById("btnAgregarMiembro")) return;
    
    const btnAgregar = document.createElement("button");
    btnAgregar.id = "btnAgregarMiembro";
    btnAgregar.textContent = "+ Agregar Miembro";
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
    
    const primeraSeccion = contenido.querySelector('section');
    contenido.insertBefore(btnAgregar, primeraSeccion);
    crearModal();
}

function crearModal() {
    if (document.getElementById("modalMiembro")) return;
    
    const modalHTML = `
        <div id="modalMiembro" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.95); justify-content:center; align-items:center; overflow-y: auto;">
            <div style="background:#1a1a1a; padding:2vw; border-radius:1vw; width:90%; max-width:600px; max-height:90vh; overflow-y:auto; border:0.3vw solid #520308; margin: 2vh auto;">
                <h2 id="tituloModal" style="color:#fff; font-size:2.5vw; margin-bottom:1.5vw; border-bottom:0.3vw solid #520308; padding-bottom:0.5vw;">Agregar Miembro</h2>
                <form id="formMiembro">
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Nombre *</label>
                    <input type="text" id="inputNombre" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Apellido *</label>
                    <input type="text" id="inputApellido" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Rol e Instrumentos *</label>
                    <input type="text" id="inputRol" placeholder="Ej: Batería, percusión, trompeta" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Año Desde *</label>
                    <input type="number" id="inputDesde" min="1900" max="2100" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Año Hasta (dejar vacío si está activo)</label>
                    <input type="number" id="inputHasta" min="1900" max="2100" style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.1vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:flex; align-items:center; margin-top:1vw;">
                        <input type="checkbox" id="inputActivo" checked style="width:1.5vw; height:1.5vw; margin-right:0.5vw;"> Miembro Activo
                    </label>
                    
                    <label style="color:#fff; font-size:1.2vw; font-weight:bold; display:block; margin-top:1vw;">Foto</label>
                    <input type="file" id="inputFoto" accept="image/*" style="color:#fff; font-size:1.1vw; padding:0.5vw; background:#2a2a2a; border:0.2vw solid #520308; border-radius:0.3vw; width:100%;">
                    <small style="color:#aaa; font-size:0.9vw; display:block; margin-top:0.3vw;">Sube una imagen nueva o déjalo vacío para mantener la actual</small>
                    
                    <div id="vistaPrevia" style="margin-top:1vw; text-align:center;"></div>
                    <div id="loadingIndicator" style="display:none; color:#00cc66; text-align:center; margin-top:1vw; font-size:1.2vw;">⏳ Subiendo imagen...</div>
                    
                    <div style="margin-top:2vw; text-align:right; display:flex; gap:0.5vw; justify-content:flex-end;">
                        <button type="button" id="btnCancelarMiembro" style="padding:1vw 2vw; font-size:1.3vw; cursor:pointer; border:none; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; background:#888; color:#000; transition: background 0.3s;">Cancelar</button>
                        <button type="button" id="btnGuardarMiembro" style="padding:1vw 2vw; font-size:1.3vw; cursor:pointer; border:none; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; background:#00cc66; color:#000; transition: background 0.3s;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("btnGuardarMiembro").onclick = guardarMiembro;
    document.getElementById("btnCancelarMiembro").onclick = cerrarModal;
    
    document.getElementById("inputFoto").onchange = function(e) {
        const archivo = e.target.files[0];
        const preview = document.getElementById("vistaPrevia");
        
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.innerHTML = `<img src="${event.target.result}" style="max-width:200px; border:0.2vw solid #520308; border-radius:0.5vw; margin-top:0.5vw;">`;
            };
            reader.readAsDataURL(archivo);
        } else {
            preview.innerHTML = '';
        }
    };
}

function abrirModalNuevo() {
    miembroEditandoId = null;
    document.getElementById("tituloModal").textContent = "Agregar Miembro";
    document.getElementById("formMiembro").reset();
    document.getElementById("vistaPrevia").innerHTML = '';
    document.getElementById("modalMiembro").style.display = "flex";
}

async function abrirModalEditar(id) {
    miembroEditandoId = id;
    const miembro = await obtenerMiembro(id);
    
    if (!miembro) {
        alert("No se pudo cargar el miembro");
        return;
    }

    document.getElementById("tituloModal").textContent = "Editar Miembro";
    document.getElementById("inputNombre").value = miembro.nombre;
    document.getElementById("inputApellido").value = miembro.apellido;
    document.getElementById("inputRol").value = miembro.rolEnBanda;
    document.getElementById("inputDesde").value = miembro.actividadDesde;
    document.getElementById("inputHasta").value = miembro.actividadHasta || "";
    document.getElementById("inputActivo").checked = miembro.activo;
    
    if (miembro.fotoURL) {
        document.getElementById("vistaPrevia").innerHTML = `
            <p style="color:#fff; font-size:1vw; margin-bottom:0.5vw;">Foto actual:</p>
            <img src="${miembro.fotoURL}" style="max-width:200px; border:0.2vw solid #520308; border-radius:0.5vw;">
        `;
    }
    
    document.getElementById("modalMiembro").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalMiembro").style.display = "none";
    document.getElementById("formMiembro").reset();
    document.getElementById("vistaPrevia").innerHTML = '';
    document.getElementById("loadingIndicator").style.display = 'none';
    miembroEditandoId = null;
}

async function guardarMiembro() {
    const nombre = document.getElementById("inputNombre").value.trim();
    const apellido = document.getElementById("inputApellido").value.trim();
    const rolEnBanda = document.getElementById("inputRol").value.trim();
    const actividadDesde = document.getElementById("inputDesde").value;
    const actividadHasta = document.getElementById("inputHasta").value;
    const activo = document.getElementById("inputActivo").checked;
    const archivo = document.getElementById("inputFoto").files[0];

    if (!nombre || !apellido || !rolEnBanda || !actividadDesde) {
        alert("Complete todos los campos obligatorios (*)");
        return;
    }

    const datos = {
        nombre,
        apellido,
        rolEnBanda,
        actividadDesde,
        actividadHasta,
        activo
    };

    const btnGuardar = document.getElementById("btnGuardarMiembro");
    const textoOriginal = btnGuardar.textContent;
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";
    btnGuardar.style.background = "#666";

    let exito;
    if (miembroEditandoId) {
        exito = await actualizarMiembro(miembroEditandoId, datos, archivo);
    } else {
        exito = await crearMiembro(datos, archivo);
    }

    btnGuardar.disabled = false;
    btnGuardar.textContent = textoOriginal;
    btnGuardar.style.background = "#00cc66";

    if (exito) {
        cerrarModal();
        await mostrarMiembros();
    }
}

export async function mostrarMiembros() {
    const contenedorActuales = document.getElementById("miembros-actuales-dinamicos");
    const contenedorAnteriores = document.getElementById("miembros-anteriores-dinamicos");
    
    if (!contenedorActuales || !contenedorAnteriores) return;

    contenedorActuales.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw;'>Cargando...</p>";
    contenedorAnteriores.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw;'>Cargando...</p>";

    try {
        const snapshot = await getDocs(collection(db, "members"));
        
        contenedorActuales.innerHTML = "";
        contenedorAnteriores.innerHTML = "";
        
        if (snapshot.empty) {
            contenedorActuales.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw;'>No hay miembros actuales</p>";
            contenedorAnteriores.innerHTML = "<p style='text-align:center; color:#fff; font-size:1.5vw;'>No hay miembros anteriores</p>";
            return;
        }
        
        snapshot.forEach((docSnap) => {
            const miembro = docSnap.data();
            const tarjeta = crearTarjetaMiembro(miembro, docSnap.id);
            
            if (miembro.activo) {
                contenedorActuales.innerHTML += tarjeta;
            } else {
                contenedorAnteriores.innerHTML += tarjeta;
            }
        });
        
        setTimeout(() => {
            if (esEmpleadoOAdmin) {
                agregarBotonesAdmin();
            }
        }, 100);
    } catch (error) {
        console.error("Error al cargar miembros:", error);
        contenedorActuales.innerHTML = "<p style='text-align:center; color:#ff4444; font-size:1.5vw;'>Error al cargar miembros</p>";
        contenedorAnteriores.innerHTML = "";
    }
}

function crearTarjetaMiembro(miembro, id) {
    const añoHasta = miembro.actividadHasta === null ? "Presente" : miembro.actividadHasta;
    const fotoURL = miembro.fotoURL || "img/Logo.png";
    const clase = miembro.activo ? "card-miembro-actual" : "card-miembro-anterior";
    
    return `
        <div class="${clase}" data-id="${id}">
            <img src="${fotoURL}" alt="${miembro.nombre} ${miembro.apellido}" class="foto-miembro" onerror="this.src='img/Logo.png'">
            <h3>${miembro.nombre} ${miembro.apellido}</h3>
            <p class="rol-miembro">${miembro.rolEnBanda}</p>
            <p class="años-actividad">${miembro.actividadDesde} - ${añoHasta}</p>
        </div>
    `;
}

function agregarBotonesAdmin() {
    document.querySelectorAll(".card-miembro-actual, .card-miembro-anterior").forEach(card => {
        const id = card.dataset.id;
        
        if (card.querySelector(".botones-admin")) return;
        
        const contenedorBotones = document.createElement("div");
        contenedorBotones.className = "botones-admin";
        contenedorBotones.style.cssText = "text-align:center; padding:1vw; background:rgba(0,0,0,0.7);";
        
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.style.cssText = "background:rgb(252, 207, 2); color:#000; padding:1vw 2vw; margin:0.3vw; border:none; cursor:pointer; font-size:1.3vw; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; transition: transform 0.2s;";
        btnEditar.onmouseover = () => btnEditar.style.transform = 'scale(1.05)';
        btnEditar.onmouseout = () => btnEditar.style.transform = 'scale(1)';
        btnEditar.onclick = () => abrirModalEditar(id);
        
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.style.cssText = "background:rgb(131, 19, 17); color:#000; padding:1vw 2vw; margin:0.3vw; border:none; cursor:pointer; font-size:1.3vw; font-family:'Bebas Neue', serif; text-transform:uppercase; font-weight:bold; transition: transform 0.2s;";
        btnEliminar.onmouseover = () => btnEliminar.style.transform = 'scale(1.05)';
        btnEliminar.onmouseout = () => btnEliminar.style.transform = 'scale(1)';
        btnEliminar.onclick = () => borrarMiembro(id);
        
        contenedorBotones.appendChild(btnEditar);
        contenedorBotones.appendChild(btnEliminar);
        card.appendChild(contenedorBotones);
    });
}

export async function crearMiembro(datos, archivo) {
    let fotoURL = "";
    
    try {
        if (archivo) {
            document.getElementById("loadingIndicator").style.display = 'block';
            fotoURL = await subirImagenCloudinary(archivo);
            document.getElementById("loadingIndicator").style.display = 'none';
        }

        await addDoc(collection(db, "members"), {
            nombre: datos.nombre,
            apellido: datos.apellido,
            rolEnBanda: datos.rolEnBanda,
            actividadDesde: parseInt(datos.actividadDesde),
            actividadHasta: datos.actividadHasta === "" ? null : parseInt(datos.actividadHasta),
            activo: datos.activo,
            fotoURL: fotoURL
        });

        alert("Miembro agregado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al crear miembro:", error);
        alert("Error al agregar miembro: " + error.message);
        document.getElementById("loadingIndicator").style.display = 'none';
        return false;
    }
}

export async function actualizarMiembro(id, datos, archivo) {
    try {
        const miembroRef = doc(db, "members", id);
        const datosActualizar = {
            nombre: datos.nombre,
            apellido: datos.apellido,
            rolEnBanda: datos.rolEnBanda,
            actividadDesde: parseInt(datos.actividadDesde),
            actividadHasta: datos.actividadHasta === "" ? null : parseInt(datos.actividadHasta),
            activo: datos.activo
        };

        if (archivo) {
            document.getElementById("loadingIndicator").style.display = 'block';
            const fotoURL = await subirImagenCloudinary(archivo);
            datosActualizar.fotoURL = fotoURL;
            document.getElementById("loadingIndicator").style.display = 'none';
        }

        await updateDoc(miembroRef, datosActualizar);
        alert("Miembro actualizado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al actualizar miembro:", error);
        alert("Error al actualizar miembro: " + error.message);
        document.getElementById("loadingIndicator").style.display = 'none';
        return false;
    }
}

export async function borrarMiembro(id) {
    if (!confirm("¿Está seguro de eliminar este miembro?\n\nEsta acción no se puede deshacer.")) return;
    
    try {
        await deleteDoc(doc(db, "members", id));
        alert("Miembro eliminado exitosamente");
        await mostrarMiembros();
    } catch (error) {
        console.error("Error al eliminar miembro:", error);
        alert("Error al eliminar miembro: " + error.message);
    }
}

export async function obtenerMiembro(id) {
    try {
        const docSnap = await getDoc(doc(db, "members", id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener miembro:", error);
        return null;
    }
}

window.abrirModalEditar = abrirModalEditar;
window.borrarMiembro = borrarMiembro;