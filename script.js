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

// ============================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ============================================
**/
// Formulario
const messageFormEl = document.getElementById('messageForm'); // form principal

// Campos de entrada
const userIDInput = document.getElementById('userID'); // documento (solo números)
const userNameInput = document.getElementById('userName'); // nombre (datalist)
const taskNameInput = document.getElementById('taskName'); // título de la tarea
const userTareaInput = document.getElementById('userTarea'); // descripción
const taskStatusInput = document.getElementById('taskStatus'); // activa/inactiva

// Botón de envío
const submitBtnEl = document.getElementById('submitBtn');

// Elementos para mostrar errores
const userIDError = document.getElementById('userIDError');
const userNameError = document.getElementById('userNameError');
const taskNameError = document.getElementById('taskNameError');
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

// Dataset de ejemplo (reemplaza por llamada a API si tienes datos reales)

// Simulacion de datos sin backend 
const users = [
    { id: '10314', name: 'Ana Pérez' },
    { id: '10314', name: 'Carlos Ruiz' },
    { id: '20456', name: 'María Gómez' },
    { id: '20456', name: 'Luis Herrera' },
    { id: '30001', name: 'Sofía Martínez' }
];

// Variable para llevar el conteo de mensajes
let totalMessagesCount = 0;


// ============================================
// 2. FUNCIONES AUXILIARES
// ============================================

function isValidInput(value) {
    // true si el valor no está vacío
    return String(value).trim().length > 0;
}

function showError(errorElement, message) {
    if (!errorElement) return;
    errorElement.textContent = message; // muestra texto en el span de error
}

function clearError(errorElement) {
    if (!errorElement) return;
    errorElement.textContent = '';
}

function getCurrentTimestamp() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return now.toLocaleDateString('es-ES', options);
}

function getInitials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return parts.map(p => p[0]).slice(0,2).join('').toUpperCase();
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

function populateUserSuggestions(documentNumber) {
    if (!usersList) return;
    usersList.innerHTML = '';
    if (!documentNumber) return;

    // uso de la base de datos simulada para controlar sin conexion a backend
    const matches = users.filter(u => u.id === documentNumber);
    if (matches.length === 0) return;
    matches.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.name;
        usersList.appendChild(opt);
    });
}


// ============================================
// 3. CREACIÓN DE ELEMENTOS
// ============================================

function createMessageElement(userID, userName, taskTitle, taskDesc) {
    // construir tarjeta de tarea (avatar, usuario, timestamp, título, descripción)
    const card = document.createElement('div'); card.className = 'message-card';
    const header = document.createElement('div'); header.className = 'message-card__header';
    const userWrap = document.createElement('div'); userWrap.className = 'message-card__user';
    const avatar = document.createElement('div'); avatar.className = 'message-card__avatar'; avatar.textContent = getInitials(userName);
    const usernameSpan = document.createElement('span'); usernameSpan.className = 'message-card__username'; usernameSpan.textContent = userName;
    userWrap.appendChild(avatar); userWrap.appendChild(usernameSpan);
    const timestamp = document.createElement('span'); timestamp.className = 'message-card__timestamp'; timestamp.textContent = getCurrentTimestamp();
    header.appendChild(userWrap); header.appendChild(timestamp);
    const titleEl = document.createElement('div'); titleEl.className = 'message-card__title'; titleEl.textContent = taskTitle;
    const contentEl = document.createElement('div'); contentEl.className = 'message-card__content'; contentEl.textContent = taskDesc;
    card.appendChild(header); card.appendChild(titleEl); card.appendChild(contentEl);
    return card;
}


// ============================================
// 4. MANEJO DE EVENTOS
// ============================================

function validateForm() {
    let isValid = true;

    const idVal = userIDInput ? userIDInput.value.trim() : '';
    const nameVal = userNameInput ? userNameInput.value.trim() : '';
    const taskTitleVal = taskNameInput ? taskNameInput.value.trim() : '';
    const taskStatusVal = taskStatusInput ? taskStatusInput.value : '';
    const taskDescVal = userTareaInput ? userTareaInput.value.trim() : '';

    // limpiar previos
    clearError(userIDError); clearError(userNameError); clearError(taskNameError); clearError(userTareaError);
    userIDInput && userIDInput.classList.remove('error');
    userNameInput && userNameInput.classList.remove('error');
    taskNameInput && taskNameInput.classList.remove('error');
    userTareaInput && userTareaInput.classList.remove('error');

    if (!isValidInput(idVal)) {
        showError(userIDError, 'Número de documento requerido');
        userIDInput.classList.add('error');
        isValid = false;
    } else if (!/^\d+$/.test(idVal)) {
        showError(userIDError, 'El documento debe contener solo números');
        userIDInput.classList.add('error');
        isValid = false;
    }

        // verificar que el documento exista en la base de datos local
        const matchingUsers = users.filter(u => u.id === idVal);
        if (idVal && matchingUsers.length === 0) {
            showError(userIDError, 'Usuario no registrado');
            userIDInput.classList.add('error');
            isValid = false;
        }

    if (!isValidInput(nameVal)) {
        showError(userNameError, 'Nombre de usuario requerido');
        userNameInput.classList.add('error');
        isValid = false;
    }

    if (!isValidInput(taskTitleVal)) {
        showError(taskNameError, 'Nombre de la tarea requerido');
        taskNameInput.classList.add('error');
        isValid = false;
    }

    // validar estado (opcional, pero aseguramos valores válidos)
    if (taskStatusInput && !['activa', 'inactiva'].includes(taskStatusVal)) {
        showError(taskStatusError, 'Estado inválido');
        taskStatusInput.classList.add('error');
        isValid = false;
    }

    if (!isValidInput(taskDescVal)) {
        showError(userTareaError, 'Descripción de la tarea requerida');
        userTareaInput.classList.add('error');
        isValid = false;
    }

    return isValid;
}

function handleInputChange(e) {
    const target = e.target;
    if (!target) return;
    if (target === userIDInput) {
        const cleaned = target.value.replace(/\D+/g, '');
        if (target.value !== cleaned) target.value = cleaned;
        clearError(userIDError);
        target.classList.remove('error');
        populateUserSuggestions(cleaned);
        if (!cleaned) usersList && (usersList.innerHTML = '');
    }
    if (target === userNameInput) { clearError(userNameError); target.classList.remove('error'); }
    if (target === taskNameInput) { clearError(taskNameError); target.classList.remove('error'); }
    if (target === taskStatusInput) { clearError(taskStatusError); target.classList.remove('error'); }
    if (target === userTareaInput) { clearError(userTareaError); target.classList.remove('error'); }
}

function handleFormSubmit(event) {
    event.preventDefault(); // evitar envío por defecto
    if (!validateForm()) return; // bloquear si inválido

    const documento = userIDInput.value.trim(); const nombre = userNameInput.value.trim();
    const taskTitle = taskNameInput.value.trim(); const tarea = userTareaInput.value.trim();
    const status = taskStatusInput ? taskStatusInput.value : 'activa';

    const card = createMessageElement(documento, nombre, taskTitle, tarea);
    // estado: atributo + badge al final
    if (taskStatusInput) {
        card.dataset.status = status;
        const statusEl = document.createElement('div');
        statusEl.className = 'message-card__status ' + (status === 'activa' ? 'activa' : 'inactiva');
        statusEl.textContent = status === 'activa' ? 'Activa' : 'Inactiva';
        card.appendChild(statusEl);
    }
    messagesContainerEl.insertBefore(card, messagesContainerEl.firstChild);

    totalMessagesCount++; updateMessageCount(); hideEmptyState();
    messageFormEl.reset(); usersList && (usersList.innerHTML = '');
}


// ============================================
// 5. REGISTRO DE EVENTOS
// ============================================

if (messageFormEl) messageFormEl.addEventListener('submit', handleFormSubmit);
if (userIDInput) userIDInput.addEventListener('input', handleInputChange);
if (userNameInput) userNameInput.addEventListener('input', handleInputChange);
if (taskNameInput) taskNameInput.addEventListener('input', handleInputChange);
if (userTareaInput) userTareaInput.addEventListener('input', handleInputChange);
if (taskStatusInput) taskStatusInput.addEventListener('change', handleInputChange);

if (userIDInput) userIDInput.addEventListener('input', (e) => {
    const cleaned = e.target.value.replace(/\D+/g, '');
    if (e.target.value !== cleaned) e.target.value = cleaned;
    populateUserSuggestions(cleaned);
});

if (userNameInput) {
    userNameInput.addEventListener('focus', function() {
        const idVal = userIDInput ? userIDInput.value.replace(/\D+/g, '') : '';
        populateUserSuggestions(idVal);
    });
}

// Inicializar contador
updateMessageCount();

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM completamente cargado');
});


// ============================================
// 8. FUNCIONALIDADES ADICIONALES (BONUS)
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