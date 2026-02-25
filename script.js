/**
 * ============================================
 * EJERCICIO DE MANIPULACIÓN DEL DOM
 * ============================================
 * 
 * Objetivo: Aplicar conceptos del DOM para seleccionar elementos,
 * responder a eventos y crear nuevos elementos dinámicamente.
 * 
 * Autor: [Tu nombre aquí]
 * Fecha: [Fecha actual]
 * ============================================
 */

// ============================================
// CONFIGURACIÓN DE API LOCAL
// ============================================
const API_BASE_URL = 'http://localhost:3000';

// ============================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ============================================

// Formulario
const messageFormEl = document.getElementById('messageForm');

// Campos de entrada
const userIDInput    = document.getElementById('userID');
const userNameInput  = document.getElementById('userName');
const taskNameInput  = document.getElementById('taskName');
const userTareaInput = document.getElementById('userTarea');
const taskStatusInput = document.getElementById('taskStatus');

// Botón de envío
const submitBtnEl = document.getElementById('submitBtn');

// Elementos para mostrar errores
const userIDError    = document.getElementById('userIDError');
const userNameError  = document.getElementById('userNameError');
const taskNameError  = document.getElementById('taskNameError');
const taskStatusError = document.getElementById('taskStatusError');
const userTareaError = document.getElementById('userTareaError');

// Contenedor donde se mostrarán los mensajes
const messagesContainerEl = document.getElementById('messagesContainer');

// Datalist para sugerencias de usuarios
const usersList = document.getElementById('usersList');

// Estado vacío (mensaje que se muestra cuando no hay mensajes)
const emptyStateEl = document.getElementById('emptyState');

// Contador de mensajes
const messageCountEl = document.getElementById('messageCount');

// Variable para almacenar el usuario actual
let currentUser = null;

// Caché local de usuarios cargados desde la API (para el datalist)
let cachedUsers = [];

// Variable para llevar el conteo de mensajes
let totalMessagesCount = 0;


// ============================================
// 2. FUNCIONES AUXILIARES
// ============================================

function isValidInput(value) {
    return String(value).trim().length > 0;
}

function showError(errorElement, message) {
    if (!errorElement) return;
    errorElement.textContent = message;
}

function clearError(errorElement) {
    if (!errorElement) return;
    errorElement.textContent = '';
}

function getCurrentTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
}

function getInitials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function updateMessageCount() {
    if (!messageCountEl) return;
    messageCountEl.textContent = `${totalMessagesCount} Tarea${totalMessagesCount !== 1 ? 's' : ''}`;
}

function hideEmptyState() {
    if (!emptyStateEl) return;
    emptyStateEl.classList.add('hidden');
}

function showEmptyState() {
    if (!emptyStateEl) return;
    emptyStateEl.classList.remove('hidden');
}

/**
 * Rellena el datalist con sugerencias de nombre basadas en el documento ingresado.
 * Usa el caché local para no repetir llamadas a la API.
 */
function populateUserSuggestions(documentNumber) {
    if (!usersList) return;
    usersList.innerHTML = '';
    if (!documentNumber) return;

    const matches = cachedUsers.filter(u => String(u.documento).startsWith(documentNumber));
    matches.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.nombre_completo;
        usersList.appendChild(opt);
    });
}


// ============================================
// 3. FUNCIONES DE API - BASE DE DATOS LOCAL
// ============================================

/**
 * Busca un usuario por número de documento en la API local.
 * También actualiza el caché para las sugerencias del datalist.
 */
async function buscarUsuarioPorDocumento(documento) {
    try {
        console.log('Buscando usuario con documento:', documento);
        const response = await fetch(`${API_BASE_URL}/usuarios`);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const usuarios = await response.json();
        cachedUsers = usuarios; // actualizar caché para el datalist

        const usuario = usuarios.find(u => String(u.documento) === String(documento));
        console.log(usuario ? 'Usuario encontrado:' : 'Usuario no encontrado', usuario ?? '');
        return usuario ?? null;

    } catch (error) {
        console.error('Error al buscar usuario:', error);
        throw error;
    }
}

/**
 * Registra una nueva tarea en la base de datos local.
 */
async function asignar_tarea(tarea) {
    try {
        console.log('Enviando tarea a la API:', tarea);

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarea)
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const tareaRegistrada = await response.json();
        console.log('Tarea registrada en la API:', tareaRegistrada);
        return tareaRegistrada;

    } catch (error) {
        console.error('Error al registrar tarea:', error);
        throw error;
    }
}


// ============================================
// 4. GESTIÓN DE USUARIOS
// ============================================

/**
 * Muestra los datos del usuario encontrado en la interfaz
 * y habilita el formulario de tareas.
 */
function mostrarDatosUsuario(usuario) {
    if (userNameInput) {
        userNameInput.value = usuario.nombre_completo;
        userNameInput.disabled = true;
    }
    currentUser = usuario;
    habilitarFormularioTareas();
    console.log('Datos del usuario mostrados:', usuario.nombre_completo);
}

/**
 * Limpia los datos del usuario y deshabilita el formulario de tareas.
 */
function limpiarDatosUsuario() {
    if (userNameInput) {
        userNameInput.value = '';
        userNameInput.disabled = false;
    }
    currentUser = null;
    deshabilitarFormularioTareas();
}

/**
 * Habilita los campos de tarea solo cuando el usuario existe.
 */
function habilitarFormularioTareas() {
    if (taskNameInput)  taskNameInput.disabled  = false;
    if (taskStatusInput) taskStatusInput.disabled = false;
    if (userTareaInput) userTareaInput.disabled  = false;
    console.log('Formulario de tareas habilitado');
}

/**
 * Deshabilita y limpia el formulario de tareas.
 */
function deshabilitarFormularioTareas() {
    if (taskNameInput)  { taskNameInput.disabled = true;  taskNameInput.value  = ''; }
    if (taskStatusInput){ taskStatusInput.disabled = true; taskStatusInput.value = 'activa'; }
    if (userTareaInput) { userTareaInput.disabled = true;  userTareaInput.value  = ''; }
}

/**
 * Consulta la API y muestra/oculta datos del usuario según el resultado.
 */
async function buscar_mostrar_usuario(documento) {
    try {
        clearError(userIDError);
        clearError(userNameError);

        const usuario = await buscarUsuarioPorDocumento(documento);

        if (usuario) {
            mostrarDatosUsuario(usuario);
            return true;
        } else {
            limpiarDatosUsuario();
            showError(userIDError, 'Usuario no encontrado en el sistema');
            userIDInput.classList.add('error');
            return false;
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showError(userIDError, 'Error al conectar con el servidor. Verifica que json-server esté corriendo.');
        return false;
    }
}


// ============================================
// 5. VALIDACIÓN DEL FORMULARIO
// ============================================

function validateForm() {
    let isValid = true;

    const idVal       = userIDInput    ? userIDInput.value.trim()    : '';
    const nameVal     = userNameInput  ? userNameInput.value.trim()  : '';
    const taskTitleVal = taskNameInput ? taskNameInput.value.trim()  : '';
    const taskStatusVal = taskStatusInput ? taskStatusInput.value    : '';
    const taskDescVal = userTareaInput ? userTareaInput.value.trim() : '';

    // Limpiar errores previos
    clearError(userIDError); clearError(userNameError);
    clearError(taskNameError); clearError(taskStatusError); clearError(userTareaError);

    userIDInput    && userIDInput.classList.remove('error');
    userNameInput  && userNameInput.classList.remove('error');
    taskNameInput  && taskNameInput.classList.remove('error');
    taskStatusInput && taskStatusInput.classList.remove('error');
    userTareaInput && userTareaInput.classList.remove('error');

    // Validar documento
    if (!isValidInput(idVal)) {
        showError(userIDError, 'Número de documento requerido');
        userIDInput.classList.add('error');
        isValid = false;
    } else if (!/^\d+$/.test(idVal)) {
        showError(userIDError, 'El documento debe contener solo números');
        userIDInput.classList.add('error');
        isValid = false;
    }

    // Validar que existe usuario consultado
    if (!currentUser) {
        showError(userIDError, 'Debe buscar un usuario válido primero');
        userIDInput.classList.add('error');
        isValid = false;
    }

    // Validar nombre
    if (!isValidInput(nameVal)) {
        showError(userNameError, 'Nombre de usuario requerido');
        userNameInput.classList.add('error');
        isValid = false;
    }

    // Validar título de tarea
    if (!isValidInput(taskTitleVal)) {
        showError(taskNameError, 'Nombre de la tarea requerido');
        taskNameInput.classList.add('error');
        isValid = false;
    }

    // Validar estado
    if (!['activa', 'inactiva'].includes(taskStatusVal)) {
        showError(taskStatusError, 'Estado inválido');
        taskStatusInput.classList.add('error');
        isValid = false;
    }

    // Validar descripción
    if (!isValidInput(taskDescVal)) {
        showError(userTareaError, 'Descripción de la tarea requerida');
        userTareaInput.classList.add('error');
        isValid = false;
    }

    return isValid;
}


// ============================================
// 6. CREACIÓN DE ELEMENTOS
// ============================================

function createMessageElement(userID, userName, taskTitle, taskDesc, status, storedFecha) {
    const card = document.createElement('div'); card.className = 'message-card';
    const header = document.createElement('div'); header.className = 'message-card__header';
    const userWrap = document.createElement('div'); userWrap.className = 'message-card__user';

    const avatar = document.createElement('div');
    avatar.className = 'message-card__avatar';
    avatar.textContent = getInitials(userName);

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'message-card__username';
    usernameSpan.textContent = userName;

    userWrap.appendChild(avatar);
    userWrap.appendChild(usernameSpan);

    const timestamp = document.createElement('span');
    timestamp.className = 'message-card__timestamp';
    // Mostrar la fecha almacenada si existe; en caso contrario usar la fecha actual
    timestamp.textContent = storedFecha ? storedFecha : getCurrentTimestamp();

    header.appendChild(userWrap);
    header.appendChild(timestamp);

    const titleEl = document.createElement('div');
    titleEl.className = 'message-card__title';
    titleEl.textContent = taskTitle;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-card__content';
    contentEl.textContent = taskDesc;

    const statusEl = document.createElement('div');
    statusEl.className = 'message-card__status ' + (status === 'activa' ? 'activa' : 'inactiva');
    statusEl.textContent = status === 'activa' ? 'Activa' : 'Inactiva';

    
    const botones = document.createElement('div'); 
    botones.className = 'message-card__botones'

    const eliminar = document.createElement('button');
    eliminar.classList.add('message-card__eliminar');
    eliminar.textContent = 'Eliminar';

    const editar = document.createElement('button');
    editar.classList.add('message-card__editar');
    editar.textContent = 'Editar';

    card.appendChild(header);
    card.appendChild(titleEl);
    card.appendChild(contentEl);
    card.appendChild(statusEl);
    botones.appendChild(eliminar);
    botones.appendChild(editar);
    card.appendChild(botones);

    return card;
}


// ============================================
// 7. MANEJO DE EVENTOS
// ============================================

function handleInputChange(e) {
    const target = e.target;
    if (!target) return;

    if (target === userIDInput) {
        const cleaned = target.value.replace(/\D+/g, '');
        if (target.value !== cleaned) target.value = cleaned;
        clearError(userIDError);
        target.classList.remove('error');
        populateUserSuggestions(cleaned);
        if (!cleaned && usersList) usersList.innerHTML = '';

        // Si el usuario ya estaba cargado y cambian el documento, limpiar
        if (currentUser) limpiarDatosUsuario();
    }

    if (target === userNameInput)  { clearError(userNameError);   target.classList.remove('error'); }
    if (target === taskNameInput)  { clearError(taskNameError);   target.classList.remove('error'); }
    if (target === taskStatusInput){ clearError(taskStatusError); target.classList.remove('error'); }
    if (target === userTareaInput) { clearError(userTareaError);  target.classList.remove('error'); }
}

/**
 * Maneja el envío del formulario en dos pasos:
 *  1. Si no hay usuario cargado: busca en la API y muestra los datos.
 *  2. Si ya hay usuario: valida y registra la tarea.
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Formulario enviado');

    const userID = userIDInput.value.trim();

    // Paso 1 – Buscar usuario si aún no está cargado
    if (!currentUser) {
        if (!userID) {
            showError(userIDError, 'Ingrese un número de documento');
            return;
        }
        console.log('Buscando usuario...');
        const encontrado = await buscar_mostrar_usuario(userID);
        if (!encontrado) return;

        console.log('Usuario encontrado. Complete los campos de tarea y envíe de nuevo.');
        return;
    }

    // Verificar que el documento coincide con el usuario cargado
    if (String(currentUser.documento) !== String(userID)) {
        showError(userIDError, 'El documento no coincide con el usuario cargado');
        limpiarDatosUsuario();
        return;
    }

    // Paso 2 – Validar y registrar la tarea
    if (!validateForm()) {
        console.log('Validación fallida');
        return;
    }

    const taskTitle  = taskNameInput.value.trim();
    const taskDesc   = userTareaInput.value.trim();
    const taskStatus = taskStatusInput.value;

    const nuevaTarea = {
        userId: currentUser.id,
        documento: currentUser.documento,
        nombre_completo: currentUser.nombre_completo,
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        fecha: getCurrentTimestamp()
    };

    try {
        const tareaRegistrada = await asignar_tarea(nuevaTarea);
        console.log('Tarea asignada exitosamente:', tareaRegistrada);

        const card = createMessageElement(
            currentUser.id,
            currentUser.nombre_completo,
            taskTitle,
            taskDesc,
            taskStatus,
            nuevaTarea.fecha
        );

        messagesContainerEl.insertBefore(card, messagesContainerEl.firstChild);
        totalMessagesCount++;
        updateMessageCount();
        hideEmptyState();

        // Limpiar solo los campos de tarea; mantener usuario activo
        taskNameInput.value   = '';
        userTareaInput.value  = '';
        taskStatusInput.value = 'activa';

        console.log('Tarea registrada. Total:', totalMessagesCount);

    } catch (error) {
        console.error('Error al asignar tarea:', error);
        alert('Error al asignar la tarea. Verifica que json-server esté corriendo.');
    }
}


// ============================================
// 8. REGISTRO DE EVENTOS
// ============================================

if (messageFormEl)  messageFormEl.addEventListener('submit', handleFormSubmit);
if (userIDInput)    userIDInput.addEventListener('input', handleInputChange);
if (userNameInput)  userNameInput.addEventListener('input', handleInputChange);
if (taskNameInput)  taskNameInput.addEventListener('input', handleInputChange);
if (userTareaInput) userTareaInput.addEventListener('input', handleInputChange);
if (taskStatusInput) taskStatusInput.addEventListener('change', handleInputChange);

// Rellenar datalist al hacer foco en el campo de nombre
if (userNameInput) {
    userNameInput.addEventListener('focus', function () {
        const idVal = userIDInput ? userIDInput.value.replace(/\D+/g, '') : '';
        populateUserSuggestions(idVal);
    });
}


// ============================================
// 9. INICIALIZACIÓN
// ============================================

/**
 * Carga las tareas ya almacenadas en la API y las renderiza al iniciar la página.
 */
async function cargarTareasExistentes() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const tareas = await response.json();
        console.log('Tareas cargadas desde la API:', tareas);

        if (tareas.length === 0) {
            showEmptyState();
            return;
        }

        // Renderizar en orden cronológico (más reciente primero)
        const tareasOrdenadas = [...tareas].reverse();

        tareasOrdenadas.forEach(tarea => {
                const card = createMessageElement(
                    tarea.userId,
                    tarea.nombre_completo,
                    tarea.title,
                    tarea.description,
                    tarea.status,
                    tarea.fecha
                );
            messagesContainerEl.appendChild(card);
        });

        totalMessagesCount = tareas.length;
        updateMessageCount();
        hideEmptyState();

    } catch (error) {
        console.error('Error al cargar tareas existentes:', error);
        showEmptyState();
    }
}

// Formulario de tareas deshabilitado al inicio (CRITERIO 11)
deshabilitarFormularioTareas();
updateMessageCount();

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM completamente cargado');
    console.log('Sistema de Gestión de Tareas iniciado');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Asegúrate de que json-server esté corriendo en el puerto 3000');

    deshabilitarFormularioTareas();
    cargarTareasExistentes(); // 👈 Cargar tareas almacenadas al iniciar
});


// ============================================
// 10. REFLEXIÓN Y DOCUMENTACIÓN
// ============================================

/**
 * PREGUNTAS DE REFLEXIÓN:
 *
 * 1. ¿Qué elemento del DOM estás seleccionando?
 *    R: El formulario, los campos de entrada (documento, nombre, título,
 *       descripción, estado), los elementos de error y el contenedor de mensajes.
 *
 * 2. ¿Qué evento provoca el cambio en la página?
 *    R: El evento 'submit' del formulario, capturado con preventDefault()
 *       para evitar la recarga de la página.
 *
 * 3. ¿Qué nuevo elemento se crea?
 *    R: Un <div class="message-card"> con el avatar, nombre, timestamp,
 *       título, descripción y estado de la tarea.
 *
 * 4. ¿Dónde se inserta ese elemento dentro del DOM?
 *    R: Al inicio del contenedor 'messagesContainer' con insertBefore,
 *       mostrando las tareas más recientes primero.
 *
 * 5. ¿Qué ocurre en la página cada vez que repites la acción?
 *    R: Se agrega una nueva tarjeta al inicio de la lista, se actualiza
 *       el contador, se oculta el mensaje vacío y se limpian solo los
 *       campos de tarea (manteniendo el usuario activo para registrar más tareas).
 */


// ============================================
// 11. FUNCIONALIDADES ADICIONALES (BONUS)
// ============================================

/**
 * RETOS ADICIONALES OPCIONALES:
 *
 * 1. Agregar un botón para eliminar mensajes individuales
 * 2. Implementar localStorage para persistir los mensajes
 * 3. Agregar un contador de caracteres en el textarea
 * 4. Implementar un botón para limpiar todos los mensajes
 * 5. Agregar diferentes colores de avatar según el nombre del usuario
 * 6. Permitir editar mensajes existentes
 * 7. Agregar emojis o reacciones a los mensajes
 * 8. Implementar búsqueda/filtrado de mensajes
 */