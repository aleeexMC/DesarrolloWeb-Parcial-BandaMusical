import { db, auth, obtenerUsuario } from "./firebase-config.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const storage = getStorage();
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
    const btnAgregar = document.createElement("button");
    btnAgregar.id = "btnAgregarMiembro";
    btnAgregar.textContent = "+ Agregar Miembro";
    btnAgregar.style.cssText = `
        background: #00cc66;
        color: #fff;
        padding: 1vw 2vw;
        font-size: 1.5vw;
        font-weight: bold;
        border: none;
        border-radius: 0.5vw;
        cursor: pointer;
        display: block;
        margin: 2vw auto;
    `;
    btnAgregar.onclick = abrirModalNuevo;
    contenido.insertBefore(btnAgregar, contenido.firstChild.nextSibling);
    crearModal();
}

function crearModal() {
    const modalHTML = `
        <div id="modalMiembro" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center;">
            <div style="background:#1a1a1a; padding:2vw; border-radius:1vw; width:50vw; max-height:80vh; overflow-y:auto; border:0.3vw solid #520308;">
                <h2 id="tituloModal" style="color:#fff; font-size:3vw; margin-bottom:1.5vw; border-bottom:0.3vw solid #520308; padding-bottom:0.5vw;">Agregar Miembro</h2>
                <form id="formMiembro">
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Nombre *</label>
                    <input type="text" id="inputNombre" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Apellido *</label>
                    <input type="text" id="inputApellido" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Rol en la Banda *</label>
                    <input type="text" id="inputRol" placeholder="Ej: Batería, percusión, trompeta" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Instrumentos (separados por coma) *</label>
                    <input type="text" id="inputInstrumentos" placeholder="batería, percusión" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Año Desde *</label>
                    <input type="number" id="inputDesde" min="1900" max="2100" required style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Año Hasta (dejar vacío si está activo)</label>
                    <input type="number" id="inputHasta" min="1900" max="2100" style="width:100%; padding:0.8vw; margin:0.5vw 0 1vw 0; font-size:1.2vw; border:0.2vw solid #520308; background:#2a2a2a; color:#fff; border-radius:0.3vw;">
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:flex; align-items:center; margin-top:1vw;">
                        <input type="checkbox" id="inputActivo" checked style="width:1.5vw; height:1.5vw; margin-right:0.5vw;"> Miembro Activo
                    </label>
                    
                    <label style="color:#fff; font-size:1.3vw; font-weight:bold; display:block; margin-top:1vw;">Foto (opcional)</label>
                    <input type="file" id="inputFoto" accept="image/*" style="color:#fff; font-size:1.2vw; padding:0.5vw;">
                    
                    <div style="margin-top:2vw; text-align:right;">
                        <button type="button" id="btnCancelarMiembro" style="padding:0.8vw 1.5vw; margin-left:0.5vw; font-size:1.2vw; cursor:pointer; border:none; border-radius:0.5vw; font-weight:bold; background:#888; color:#fff;">Cancelar</button>
                        <button type="button" id="btnGuardarMiembro" style="padding:0.8vw 1.5vw; margin-left:0.5vw; font-size:1.2vw; cursor:pointer; border:none; border-radius:0.5vw; font-weight:bold; background:#00cc66; color:#fff;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("btnGuardarMiembro").onclick = guardarMiembro;
    document.getElementById("btnCancelarMiembro").onclick = cerrarModal;
}

function abrirModalNuevo() {
    miembroEditandoId = null;
    document.getElementById("tituloModal").textContent = "Agregar Miembro";
    document.getElementById("formMiembro").reset();
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
    document.getElementById("inputInstrumentos").value = miembro.instrumentos.join(", ");
    document.getElementById("inputDesde").value = miembro.actividadDesde;
    document.getElementById("inputHasta").value = miembro.actividadHasta || "";
    document.getElementById("inputActivo").checked = miembro.activo;
    document.getElementById("modalMiembro").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalMiembro").style.display = "none";
    document.getElementById("formMiembro").reset();
    miembroEditandoId = null;
}

async function guardarMiembro() {
    const nombre = document.getElementById("inputNombre").value.trim();
    const apellido = document.getElementById("inputApellido").value.trim();
    const rolEnBanda = document.getElementById("inputRol").value.trim();
    const instrumentosTexto = document.getElementById("inputInstrumentos").value.trim();
    const actividadDesde = document.getElementById("inputDesde").value;
    const actividadHasta = document.getElementById("inputHasta").value;
    const activo = document.getElementById("inputActivo").checked;
    const archivo = document.getElementById("inputFoto").files[0];

    if (!nombre || !apellido || !rolEnBanda || !instrumentosTexto || !actividadDesde) {
        alert("Complete todos los campos obligatorios");
        return;
    }

    const instrumentos = instrumentosTexto.split(",").map(i => i.trim()).filter(i => i);

    const datos = {
        nombre,
        apellido,
        rolEnBanda,
        instrumentos,
        actividadDesde,
        actividadHasta,
        activo
    };

    let exito;
    if (miembroEditandoId) {
        exito = await actualizarMiembro(miembroEditandoId, datos, archivo);
    } else {
        exito = await crearMiembro(datos, archivo);
    }

    if (exito) {
        cerrarModal();
        mostrarMiembros();
    }
}

export async function mostrarMiembros() {
    const contenedorActuales = document.getElementById("miembros-actuales-dinamicos");
    const contenedorAnteriores = document.getElementById("miembros-anteriores-dinamicos");
    
    if (!contenedorActuales || !contenedorAnteriores) return;

    contenedorActuales.innerHTML = "";
    contenedorAnteriores.innerHTML = "";

    const snapshot = await getDocs(collection(db, "members"));
    
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
}

function crearTarjetaMiembro(miembro, id) {
    const añoHasta = miembro.actividadHasta === null ? "Presente" : miembro.actividadHasta;
    const fotoURL = miembro.fotoURL || "https://via.placeholder.com/400x400/520308/ffffff?text=Sin+Foto";
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
        contenedorBotones.style.cssText = "text-align:center; padding:1vw; background:rgba(0,0,0,0.5);";
        
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.style.cssText = "background:#ffd700; color:#000; padding:0.8vw 1.5vw; margin:0.3vw; border:none; cursor:pointer; font-size:1.2vw; font-weight:bold; border-radius:0.5vw;";
        btnEditar.onclick = () => abrirModalEditar(id);
        
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.style.cssText = "background:#ff4444; color:#fff; padding:0.8vw 1.5vw; margin:0.3vw; border:none; cursor:pointer; font-size:1.2vw; font-weight:bold; border-radius:0.5vw;";
        btnEliminar.onclick = () => borrarMiembro(id);
        
        contenedorBotones.appendChild(btnEditar);
        contenedorBotones.appendChild(btnEliminar);
        card.appendChild(contenedorBotones);
    });
}

export async function crearMiembro(datos, archivo) {
    try {
        const docRef = await addDoc(collection(db, "members"), {
            nombre: datos.nombre,
            apellido: datos.apellido,
            rolEnBanda: datos.rolEnBanda,
            instrumentos: datos.instrumentos,
            actividadDesde: parseInt(datos.actividadDesde),
            actividadHasta: datos.actividadHasta === "" ? null : parseInt(datos.actividadHasta),
            activo: datos.activo,
            fotoURL: ""
        });

        if (archivo) {
            const fotoURL = await subirFoto(archivo, docRef.id);
            await updateDoc(doc(db, "members", docRef.id), { fotoURL });
        }

        alert("Miembro agregado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al crear miembro:", error);
        alert("Error al agregar miembro");
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
            instrumentos: datos.instrumentos,
            actividadDesde: parseInt(datos.actividadDesde),
            actividadHasta: datos.actividadHasta === "" ? null : parseInt(datos.actividadHasta),
            activo: datos.activo
        };

        if (archivo) {
            const fotoURL = await subirFoto(archivo, id);
            datosActualizar.fotoURL = fotoURL;
        }

        await updateDoc(miembroRef, datosActualizar);
        alert("Miembro actualizado exitosamente");
        return true;
    } catch (error) {
        console.error("Error al actualizar miembro:", error);
        alert("Error al actualizar miembro");
        return false;
    }
}

export async function borrarMiembro(id) {
    if (!confirm("¿Está seguro de eliminar este miembro?")) return;
    
    try {
        await deleteDoc(doc(db, "members", id));
        alert("Miembro eliminado exitosamente");
        mostrarMiembros();
    } catch (error) {
        console.error("Error al eliminar miembro:", error);
        alert("Error al eliminar miembro");
    }
}

async function subirFoto(archivo, memberId) {
    const storageRef = ref(storage, `members/${memberId}.jpg`);
    await uploadBytes(storageRef, archivo);
    return await getDownloadURL(storageRef);
}

export async function obtenerMiembro(id) {
    const docSnap = await getDoc(doc(db, "members", id));
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}