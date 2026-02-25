/**
 * ==========================================================
 * SISTEMA DE GESTIÓN DE TAREAS – MANIPULACIÓN DEL DOM
 * ==========================================================
 *
 * Descripción General:
 * Este módulo corresponde a la capa Frontend encargada de:
 * - Interactuar con el DOM.
 * - Capturar datos del usuario.
 * - Preparar la comunicación con la API (Backend).
 * - Gestionar el estado visual de la aplicación.
 *
 * Arquitectura:
 * - Separación por casos de uso (use-case).
 * - Comunicación con API REST mediante métodos HTTP.
 * - Manipulación dinámica del DOM.
 *
 * Rol dentro del equipo:
 * Este archivo representa la lógica principal del cliente
 * (Frontend), conectando interfaz y backend.
 * ==========================================================
 */


// ==========================================================
// IMPORTACIÓN DE CASOS DE USO (ARQUITECTURA MODULAR)
// ==========================================================

/**
 * Se importa el caso de uso responsable de actualizar una tarea.
 * 
 * Este módulo ejecuta una petición HTTP tipo PUT hacia el backend,
 * siguiendo principios de separación de responsabilidades:
 * 
 * - Este archivo controla la UI.
 * - updateTarea.js controla la lógica de comunicación HTTP.
 */
import { actualizarTarea } from './use-case/updateTarea.js';
import { eliminarTarea } from './use-case/deleteTarea.js';


// ==========================================================
// CONFIGURACIÓN GLOBAL Y VARIABLES DE ESTADO
// ==========================================================

/**
 * URL base de la API REST.
 * 
 * Todas las peticiones HTTP (GET, POST, PUT, DELETE)
 * utilizarán esta base para construir los endpoints.
 */
const API_BASE_URL = 'http://localhost:3000';

/**
 * Variable de control para edición.
 * 
 * Cuando contiene un ID:
 * - Significa que se está editando una tarea existente.
 * - Se utilizará el método HTTP PUT.
 * 
 * Cuando es null:
 * - Se está creando una nueva tarea.
 * - Se utilizará el método HTTP POST.
 */
let editingTaskId = null;


// ==========================================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ==========================================================

/**
 * En esta sección se capturan referencias del DOM.
 * 
 * Objetivo:
 * - Evitar búsquedas repetidas en el documento.
 * - Centralizar los elementos interactivos.
 * - Mantener claridad estructural.
 */


// -----------------------------
// Formulario principal
// -----------------------------

/**
 * Formulario que dispara el evento submit.
 * 
 * Desde aquí se controlan:
 * - Validaciones.
 * - Envío de datos.
 * - Diferenciación entre POST y PUT.
 */
const messageFormEl = document.getElementById('messageForm');


// -----------------------------
// Campos de entrada (Inputs)
// -----------------------------

/**
 * Inputs que capturan los datos que serán enviados al backend.
 * 
 * Estos valores formarán el cuerpo (body) de las peticiones HTTP.
 */
const userIDInput     = document.getElementById('userID');
const userNameInput   = document.getElementById('userName');
const taskNameInput   = document.getElementById('taskName');
const userTareaInput  = document.getElementById('userTarea');
const taskStatusInput = document.getElementById('taskStatus');


// -----------------------------
// Botón de envío
// -----------------------------

/**
 * Botón que ejecuta el envío del formulario.
 * 
 * Su comportamiento cambia dependiendo del estado:
 * - Crear tarea → HTTP POST
 * - Editar tarea → HTTP PUT
 */
const submitBtnEl = document.getElementById('submitBtn');


// -----------------------------
// Elementos para manejo de errores
// -----------------------------

/**
 * Contenedores destinados a mostrar mensajes de validación.
 * 
 * Son parte de la capa de UX (Experiencia de Usuario).
 * Permiten:
 * - Validaciones previas al envío.
 * - Evitar solicitudes HTTP innecesarias.
 */
const userIDError     = document.getElementById('userIDError');
const userNameError   = document.getElementById('userNameError');
const taskNameError   = document.getElementById('taskNameError');
const taskStatusError = document.getElementById('taskStatusError');
const userTareaError  = document.getElementById('userTareaError');


// -----------------------------
// Contenedor dinámico de tareas
// -----------------------------

/**
 * Contenedor donde se renderizan dinámicamente
 * las tareas obtenidas del backend.
 * 
 * Aquí se insertan elementos creados mediante:
 * - document.createElement()
 * - Manipulación directa del DOM
 * 
 * La información proviene generalmente de una
 * petición HTTP GET.
 */
const messagesContainerEl = document.getElementById('messagesContainer');


// -----------------------------
// Datalist para autocompletado
// -----------------------------

/**
 * Datalist que muestra sugerencias de usuarios.
 * 
 * Los datos se cargan mediante una petición HTTP GET
 * hacia el endpoint de usuarios.
 */
const usersList = document.getElementById('usersList');


// -----------------------------
// Estado vacío
// -----------------------------

/**
 * Elemento visual que se muestra cuando:
 * - No existen tareas registradas.
 * 
 * Se controla dinámicamente según el conteo
 * obtenido desde la API.
 */
const emptyStateEl = document.getElementById('emptyState');


// -----------------------------
// Contador de tareas
// -----------------------------

/**
 * Elemento que muestra el número total de tareas.
 * 
 * Se actualiza cada vez que:
 * - Se realiza un GET
 * - Se crea una tarea (POST)
 * - Se elimina una tarea (DELETE)
 */
const messageCountEl = document.getElementById('messageCount');


// ==========================================================
// VARIABLES DE ESTADO DE LA APLICACIÓN
// ==========================================================

/** Usuario actualmente seleccionado; Permite mantener consistencia entre:
 * - Lo que se muestra en el input.
 * - Lo que se enviará al backend.
 */
let currentUser = null;

/**
 * Caché local de usuarios; Mejora rendimiento:
 * - Evita múltiples peticiones GET repetidas.
 * - Permite búsquedas rápidas en memoria.
 */
let cachedUsers = [];

/**
 * Contador total de tareas en memoria; Se sincroniza con:
 * - Respuesta del backend (GET).
 * - Operaciones CRUD realizadas.
 */
let totalMessagesCount = 0;
// ==========================================================
// 2. FUNCIONES AUXILIARES (UTILIDADES DEL FRONTEND)
// ==========================================================

/**
 * Esta sección contiene funciones reutilizables que:
 * - No realizan peticiones HTTP directamente.
 * - No modifican la lógica principal del sistema.
 * - Apoyan validaciones, formato de datos y experiencia de usuario.
 * 
 * Son funciones de apoyo que mantienen el código limpio,
 * legible y desacoplado.
 */

/**
 * Valida que un input no esté vacío, Se utiliza antes de ejecutar solicitudes HTTP (POST o PATCH), evitando enviar datos inválidos al backend.
 * Retorna:
  - true  → si el valor contiene texto válido
  - false → si está vacío o contiene solo espacios
 */
function isValidInput(value) {
    return String(value).trim().length > 0;
}

// Muestra un mensaje de error en un elemento del DOM.

function showError(errorElement, message) {
    if (!errorElement) return;
    errorElement.textContent = message;
}

//Limpia el mensaje de error visual.

function clearError(errorElement) {
    if (!errorElement) return;
    errorElement.textContent = '';
}


/** Genera una marca de tiempo formateada.
  Se utiliza para:
  - Mostrar fecha de creación o actualización.
  - Dar trazabilidad visual a cada tarea.
  -No depende del backend.
  - Es únicamente presentación en el cliente.
 */
function getCurrentTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
}

// Genera iniciales a partir del nombre completo.Permite crear avatares dinámicos.
 
function getInitials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * Actualiza el contador de tareas.
 Se ejecuta después de:
 - HTTP GET  (cuando se cargan tareas)
 - HTTP POST (cuando se crea una nueva)
 - HTTP DELETE (cuando se elimina)
 * Mantiene sincronizada la interfaz con el estado real.
 */
function updateMessageCount() {
    if (!messageCountEl) return;

    messageCountEl.textContent =
        `${totalMessagesCount} Tarea${totalMessagesCount !== 1 ? 's' : ''}`;
}

// Oculta el estado vacío cuando existen tareas.

function hideEmptyState() {
    if (!emptyStateEl) return;
    emptyStateEl.classList.add('hidden');
}

// Muestra el estado vacío cuando no existen tareas.
 
function showEmptyState() {
    if (!emptyStateEl) return;
    emptyStateEl.classList.remove('hidden');
}

function populateUserSuggestions(documentNumber) {
    if (!usersList) return;

    usersList.innerHTML = '';

    if (!documentNumber) return;

    const matches = cachedUsers.filter(u =>
        String(u.documento).startsWith(documentNumber)
    );

    matches.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.nombre_completo;
        usersList.appendChild(opt);
    });
}


//Muestra una notificación temporal en pantalla.

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = mensaje;

    document.body.appendChild(notif);

    // Animación de salida automática
    setTimeout(() => {
        notif.classList.add('notification--hide');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

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

// Registra una nueva tarea en la base de datos local.

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

// Muestra en la interfaz los datos del usuario encontrado (respuesta HTTP GET)
// y habilita el formulario de creación de tareas.
function mostrarDatosUsuario(usuario) {
    if (userNameInput) {
        userNameInput.value = usuario.nombre_completo;
        userNameInput.disabled = true; // Se bloquea para evitar inconsistencias
    }

    currentUser = usuario; // Se guarda el usuario activo en memoria
    habilitarFormularioTareas(); // Se permite crear tareas solo si el usuario existe

    console.log('Datos del usuario mostrados:', usuario.nombre_completo);
}

// Limpia el usuario actual y bloquea el formulario de tareas
// Se ejecuta cuando el usuario no existe o se cambia el documento.
function limpiarDatosUsuario() {
    if (userNameInput) {
        userNameInput.value = '';
        userNameInput.disabled = false;
    }

    currentUser = null; // Se elimina el estado del usuario actual
    deshabilitarFormularioTareas(); // Se evita crear tareas sin usuario válido
}

// Habilita inputs de tarea cuando existe un usuario válido
function habilitarFormularioTareas() {
    if (taskNameInput)  taskNameInput.disabled  = false;
    if (taskStatusInput) taskStatusInput.disabled = false;
    if (userTareaInput) userTareaInput.disabled  = false;

    console.log('Formulario de tareas habilitado');
}

// Deshabilita y limpia los campos de tarea para evitar registros inválidos
function deshabilitarFormularioTareas() {
    if (taskNameInput)  { taskNameInput.disabled = true;  taskNameInput.value  = ''; }
    if (taskStatusInput){ taskStatusInput.disabled = true; taskStatusInput.value = 'activa'; }
    if (userTareaInput) { userTareaInput.disabled = true;  userTareaInput.value  = ''; }
}

// Realiza la consulta al backend para buscar un usuario por documento (HTTP GET)
// Controla errores de conexión y validación de existencia.
async function buscar_mostrar_usuario(documento) {
    try {
        clearError(userIDError);
        clearError(userNameError);

        const usuario = await buscarUsuarioPorDocumento(documento); 
        // buscarUsuarioPorDocumento ejecuta un GET a la API

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

        showError(
            userIDError,
            'Error al conectar con el servidor. Verifica que json-server esté corriendo.'
        );

        return false;
    }
}


// ============================================
// 5. VALIDACIÓN DEL FORMULARIO
// ============================================

// Valida datos antes de ejecutar POST (crear) o PUT (actualizar)
// Evita enviar solicitudes HTTP con datos inválidos.
function validateForm() {

    let isValid = true;

    // Se capturan valores actuales del formulario
    const idVal        = userIDInput    ? userIDInput.value.trim()    : '';
    const nameVal      = userNameInput  ? userNameInput.value.trim()  : '';
    const taskTitleVal = taskNameInput  ? taskNameInput.value.trim()  : '';
    const taskStatusVal= taskStatusInput? taskStatusInput.value       : '';
    const taskDescVal  = userTareaInput ? userTareaInput.value.trim() : '';

    // Limpieza previa de errores visuales
    clearError(userIDError); 
    clearError(userNameError);
    clearError(taskNameError); 
    clearError(taskStatusError); 
    clearError(userTareaError);

    userIDInput     && userIDInput.classList.remove('error');
    userNameInput   && userNameInput.classList.remove('error');
    taskNameInput   && taskNameInput.classList.remove('error');
    taskStatusInput && taskStatusInput.classList.remove('error');
    userTareaInput  && userTareaInput.classList.remove('error');


    // Si NO estamos editando → flujo de creación (HTTP POST)
    if (!editingTaskId) {

        // Validación de documento
        if (!isValidInput(idVal)) {
            showError(userIDError, 'Número de documento requerido');
            userIDInput.classList.add('error');
            isValid = false;

        } else if (!/^\d+$/.test(idVal)) { // Validación con expresión regular
            showError(userIDError, 'El documento debe contener solo números');
            userIDInput.classList.add('error');
            isValid = false;
        }

        // Debe existir usuario previamente consultado vía GET
        if (!currentUser) {
            showError(userIDError, 'Debe buscar un usuario válido primero');
            userIDInput.classList.add('error');
            isValid = false;
        }

        if (!isValidInput(nameVal)) {
            showError(userNameError, 'Nombre de usuario requerido');
            userNameInput.classList.add('error');
            isValid = false;
        }
    }

    // Validación del nombre de la tarea
    if (!isValidInput(taskTitleVal)) {
        showError(taskNameError, 'Nombre de la tarea requerido');
        taskNameInput.classList.add('error');
        isValid = false;
    }

    // Validación del estado (control de dominio)
    if (!['activa', 'inactiva'].includes(taskStatusVal)) {
        showError(taskStatusError, 'Estado inválido');
        taskStatusInput.classList.add('error');
        isValid = false;
    }

    // Validación de descripción
    if (!isValidInput(taskDescVal)) {
        showError(userTareaError, 'Descripción de la tarea requerida');
        userTareaInput.classList.add('error');
        isValid = false;
    }

    return isValid; // Si es true → se permite ejecutar POST o PUT
}
// ============================================
// 6. CREACIÓN DE ELEMENTOS
// ============================================

// Construye dinámicamente una tarjeta de tarea en el DOM.
// No usa innerHTML → evita riesgos y mantiene control estructural.
// Representa visualmente un registro obtenido o creado vía API (GET o POST).
function createMessageElement(taskId, userID, userName, taskTitle, taskDesc, status, storedFecha, documento) {

    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.id = taskId;          // Referencia para operaciones PUT o DELETE
    card.dataset.documento = documento || '';

    // Header: usuario + fecha
    const header = document.createElement('div'); 
    header.className = 'message-card__header';

    const userWrap = document.createElement('div'); 
    userWrap.className = 'message-card__user';

    const avatar = document.createElement('div');
    avatar.className = 'message-card__avatar';
    avatar.textContent = getInitials(userName); // Avatar dinámico

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'message-card__username';
    usernameSpan.textContent = userName;

    userWrap.appendChild(avatar);
    userWrap.appendChild(usernameSpan);

    const timestamp = document.createElement('span');
    timestamp.className = 'message-card__timestamp';
    timestamp.textContent = storedFecha ? storedFecha : getCurrentTimestamp();

    header.appendChild(userWrap);
    header.appendChild(timestamp);

    // Contenido principal
    const titleEl = document.createElement('div');
    titleEl.className = 'message-card__title';
    titleEl.textContent = taskTitle;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-card__content';
    contentEl.textContent = taskDesc;

    // Estado visual sincronizado con el backend
    const statusEl = document.createElement('div');
    statusEl.className = 'message-card__status ' + (status === 'activa' ? 'activa' : 'inactiva');
    statusEl.textContent = status === 'activa' ? 'Activa' : 'Inactiva';

    // Botones de acción (Edit → PUT, Delete → DELETE)
    const botones = document.createElement('div'); 
    botones.className = 'message-card__botones';

    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.classList.add('message-card__eliminar');
    eliminar.textContent = 'Eliminar';
    eliminar.dataset.action = 'delete';

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.classList.add('message-card__editar');
    editar.textContent = 'Editar';
    editar.dataset.action = 'edit';

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

// Controla cambios en inputs y limpia errores en tiempo real.
// Mejora UX y evita validaciones tardías.
function handleInputChange(e) {
    const target = e.target;
    if (!target) return;

    // Sanitiza documento (solo números)
    if (target === userIDInput) {
        const cleaned = target.value.replace(/\D+/g, '');
        if (target.value !== cleaned) target.value = cleaned;

        clearError(userIDError);
        target.classList.remove('error');

        populateUserSuggestions(cleaned);

        if (!cleaned && usersList) usersList.innerHTML = '';

        // Si cambian el documento, se invalida el usuario cargado
        if (currentUser) limpiarDatosUsuario();
    }

    if (target === userNameInput)  { clearError(userNameError);   target.classList.remove('error'); }
    if (target === taskNameInput)  { clearError(taskNameError);   target.classList.remove('error'); }
    if (target === taskStatusInput){ clearError(taskStatusError); target.classList.remove('error'); }
    if (target === userTareaInput) { clearError(userTareaError);  target.classList.remove('error'); }
}


// Prepara la interfaz para editar una tarea existente.
// Activa flujo HTTP PUT.
async function manejarClickEditar(taskId) {

    const card = document.querySelector(`.message-card[data-id="${taskId}"]`);
    if (!card) return;

    // Extrae datos actuales del DOM
    const title = card.querySelector('.message-card__title')?.textContent;
    const description = card.querySelector('.message-card__content')?.textContent;
    const status = card.querySelector('.message-card__status')?.classList.contains('activa') ? 'activa' : 'inactiva';
    const userName = card.querySelector('.message-card__username')?.textContent;
    const documento = card.dataset.documento;

    // Carga datos en el formulario
    if (taskNameInput) taskNameInput.value = title || '';
    if (userTareaInput) userTareaInput.value = description || '';
    if (taskStatusInput) taskStatusInput.value = status || 'activa';

    if (userIDInput) {
        userIDInput.value = documento || '';
        userIDInput.disabled = true; // No se permite cambiar usuario en edición
    }

    if (userNameInput) {
        userNameInput.value = userName || '';
        userNameInput.disabled = true;
    }

    editingTaskId = taskId; // Activa modo actualización (PUT)

    if (submitBtnEl) {
        submitBtnEl.querySelector('.btn__text').textContent = 'Actualizar Tarea';
        submitBtnEl.classList.add('btn--update');
    }

    mostrarBotonCancelar();
    habilitarFormularioTareas();

    // Sincroniza usuario actual vía GET
    const usuario = await buscarUsuarioPorDocumento(documento);
    if (usuario) currentUser = usuario;
}


// Maneja la eliminación de una tarea (flujo DELETE)
async function manejarClickEliminar(taskId) {
    try {
        const confirmar = confirm('¿Desea eliminar esta tarea? Esta acción no se puede deshacer.');
        if (!confirmar) return;

        await eliminarTarea(taskId);

        const card = document.querySelector(`.message-card[data-id="${taskId}"]`);
        if (card) card.remove();

        totalMessagesCount = Math.max(0, totalMessagesCount - 1);
        updateMessageCount();

        if (totalMessagesCount === 0) showEmptyState();

        mostrarNotificacion('Tarea eliminada correctamente');

    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        alert('Error al eliminar la tarea. Verifica que el servidor esté disponible.');
    }
}


// Muestra botón cancelar solo en modo edición.
function mostrarBotonCancelar() {
    let btnCancel = document.getElementById('btnCancelEdit');

    if (!btnCancel && submitBtnEl?.parentElement) {
        btnCancel = document.createElement('button');
        btnCancel.id = 'btnCancelEdit';
        btnCancel.type = 'button';
        btnCancel.className = 'btn btn--secondary';
        btnCancel.innerHTML = '<span class="btn__text">Cancelar</span>';
        btnCancel.style.marginLeft = 'var(--spacing-sm)';
        btnCancel.addEventListener('click', cancelarEdicion);
        submitBtnEl.parentElement.appendChild(btnCancel);
    }

    if (btnCancel) btnCancel.classList.remove('hidden');
}


// Restaura formulario al modo creación (POST)
function cancelarEdicion() {

    editingTaskId = null;

    if (taskNameInput) taskNameInput.value = '';
    if (userTareaInput) userTareaInput.value = '';
    if (taskStatusInput) taskStatusInput.value = 'activa';

    if (submitBtnEl) {
        submitBtnEl.querySelector('.btn__text').textContent = 'Asignar Tarea';
        submitBtnEl.classList.remove('btn--update');
    }

    const btnCancel = document.getElementById('btnCancelEdit');
    if (btnCancel) btnCancel.classList.add('hidden');

    if (userIDInput) userIDInput.disabled = false;
    if (userNameInput && !currentUser) userNameInput.disabled = false;

    clearError(taskNameError);
    clearError(userTareaError);
    clearError(taskStatusError);
}


// Delegación de eventos para acciones edit/delete
function manejarClickCard(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.message-card');
    if (!card) return;

    const taskId = card.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit' && taskId) {
        e.preventDefault();
        manejarClickEditar(taskId);
        return;
    }

    if (action === 'delete' && taskId) {
        e.preventDefault();
        manejarClickEliminar(taskId);
        return;
    }
}


// Actualiza visualmente una tarjeta tras un PUT exitoso
function actualizarCardEnDOM(taskId, tarea) {

    const card = document.querySelector(`.message-card[data-id="${taskId}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.message-card__title');
    if (titleEl) titleEl.textContent = tarea.title;

    const contentEl = card.querySelector('.message-card__content');
    if (contentEl) contentEl.textContent = tarea.description;

    const statusEl = card.querySelector('.message-card__status');
    if (statusEl) {
        statusEl.className = 'message-card__status ' + (tarea.status === 'activa' ? 'activa' : 'inactiva');
        statusEl.textContent = tarea.status === 'activa' ? 'Activa' : 'Inactiva';
    }

    // Feedback visual post-actualización
    card.style.transition = 'background-color 0.3s ease';
    card.style.backgroundColor = 'var(--color-primary-lighter)';
    setTimeout(() => { card.style.backgroundColor = ''; }, 1000);
}


// Control principal del formulario.
// Flujo:
// - GET usuario (si no está cargado)
// - POST nueva tarea
// - PUT actualización
async function handleFormSubmit(event) {

    event.preventDefault();

    const userID = userIDInput.value.trim();

    // Paso 1: buscar usuario (GET)
    if (!currentUser && !editingTaskId) {
        if (!userID) {
            showError(userIDError, 'Ingrese un número de documento');
            return;
        }

        const encontrado = await buscar_mostrar_usuario(userID);
        if (!encontrado) return;

        return;
    }

    // Validación de coherencia de usuario
    if (!editingTaskId && currentUser && String(currentUser.documento) !== String(userID)) {
        showError(userIDError, 'El documento no coincide con el usuario cargado');
        limpiarDatosUsuario();
        return;
    }

    if (!validateForm()) return;

    const taskTitle  = taskNameInput.value.trim();
    const taskDesc   = userTareaInput.value.trim();
    const taskStatus = taskStatusInput.value;

    try {

        // Flujo PUT (actualizar)
        if (editingTaskId) {

            const datosActualizados = {
                title: taskTitle,
                description: taskDesc,
                status: taskStatus
            };

            const tareaActualizada = await actualizarTarea(editingTaskId, datosActualizados);
            actualizarCardEnDOM(editingTaskId, tareaActualizada);

            alert('✅ Tarea actualizada correctamente');
            messageFormEl.reset();
            cancelarEdicion();
            cargarTareasExistentes(); // Refuerza sincronización con backend

        } else {

            // Flujo POST (crear)
            const nuevaTarea = {
                userId: currentUser.id,
                documento: currentUser.documento,
                nombre_completo: currentUser.nombre_completo,
                title: taskTitle,
                description: taskDesc,
                status: taskStatus,
                fecha: getCurrentTimestamp()
            };

            const tareaRegistrada = await asignar_tarea(nuevaTarea);

            const card = createMessageElement(
                tareaRegistrada.id,
                currentUser.id,
                currentUser.nombre_completo,
                taskTitle,
                taskDesc,
                taskStatus,
                nuevaTarea.fecha,
                currentUser.documento
            );

            messagesContainerEl.insertBefore(card, messagesContainerEl.firstChild);

            totalMessagesCount++;
            updateMessageCount();
            hideEmptyState();

            taskNameInput.value   = '';
            userTareaInput.value  = '';
            taskStatusInput.value = 'activa';

            alert('✅ Tarea asignada correctamente');
        }

    } catch (error) {
        console.error('Error en la operación:', error);
        showError(userTareaError, 'Error al guardar. Verifica que json-server esté corriendo.');
    }
}
// ============================================
// 8. REGISTRO DE EVENTOS
// ============================================

// Se centraliza la conexión entre la interfaz (DOM) y la lógica del sistema.
// Aquí se activan los listeners que disparan validaciones y operaciones HTTP.

if (messageFormEl)
    messageFormEl.addEventListener('submit', handleFormSubmit); 
// Evento principal → controla flujo GET (buscar usuario), POST (crear) y PUT (actualizar)

if (userIDInput)
    userIDInput.addEventListener('input', handleInputChange);
// Sanitiza documento y limpia errores en tiempo real

if (userNameInput)
    userNameInput.addEventListener('input', handleInputChange);

if (taskNameInput)
    taskNameInput.addEventListener('input', handleInputChange);

if (userTareaInput)
    userTareaInput.addEventListener('input', handleInputChange);

if (taskStatusInput)
    taskStatusInput.addEventListener('change', handleInputChange);
// Detecta cambios en el select de estado


// Autocompletado dinámico usando caché local (sin nueva petición HTTP)
if (userNameInput) {
    userNameInput.addEventListener('focus', function () {
        const idVal = userIDInput ? userIDInput.value.replace(/\D+/g, '') : '';
        populateUserSuggestions(idVal);
    });
}


// Delegación de eventos en contenedor principal.
// Permite manejar múltiples botones (editar/eliminar) con un solo listener.
// Escalable y eficiente.
if (messagesContainerEl) {
    messagesContainerEl.addEventListener('click', manejarClickCard);
}


// ============================================
// 9. INICIALIZACIÓN
// ============================================

// Carga inicial de tareas almacenadas en backend (HTTP GET).
// Sincroniza el estado visual con la base de datos al iniciar la app.
async function cargarTareasExistentes() {

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        // Método HTTP GET automático en fetch

        if (!response.ok)
            throw new Error(`Error HTTP: ${response.status}`);

        const tareas = await response.json();
        console.log('Tareas cargadas desde la API:', tareas);

        if (tareas.length === 0) {
            showEmptyState();
            return;
        }

        messagesContainerEl.innerHTML = '';

        // Orden cronológico inverso → más reciente primero
        const tareasOrdenadas = [...tareas].reverse();

        tareasOrdenadas.forEach(tarea => {

            const card = createMessageElement(
                tarea.id,
                tarea.userId,
                tarea.nombre_completo,
                tarea.title,
                tarea.description,
                tarea.status,
                tarea.fecha,
                tarea.documento
            );

            messagesContainerEl.appendChild(card);
        });

        totalMessagesCount = tareas.length;
        updateMessageCount();
        hideEmptyState();

    } catch (error) {

        console.error('Error al cargar tareas existentes:', error);
        showEmptyState(); // Manejo visual de fallo de conexión
    }
}


// Estado inicial del sistema antes de cargar datos
deshabilitarFormularioTareas();
updateMessageCount();


// Punto de entrada oficial de la aplicación.
// Garantiza que el DOM esté completamente cargado antes de ejecutar lógica.
document.addEventListener('DOMContentLoaded', function () {

    console.log('✅ DOM completamente cargado');
    console.log('Sistema de Gestión de Tareas iniciado');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Asegúrate de que json-server esté corriendo en el puerto 3000');

    deshabilitarFormularioTareas(); // Previene acciones sin usuario válido
    cargarTareasExistentes();       // GET inicial para renderizar tareas
});