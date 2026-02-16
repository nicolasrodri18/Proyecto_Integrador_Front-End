/**
 * CONFIGURACIÓN DE LA API
 * Nota: Asegúrate de que tu servidor (json-server o similar) esté corriendo en el puerto 3000
 */
const BASE_URL = 'http://localhost:3000';

// 1. Función para buscar el usuario por documento (Criterio 7)
async function getUserByDocument(documento) {
    try {
        const respuesta = await fetch(`${BASE_URL}/usuarios?documento=${documento}`);
        const data = await respuesta.json();
        // Como devuelve un array, retornamos la primera posición o null si no hay nada (Criterio 9)
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Error al buscar usuario:", error);
        return null;
    }
}

// 2. Función para registrar una tarea (Criterio 13 y 15)
async function registrarTarea(nuevaTarea) {
    try {
        const respuesta = await fetch(`${BASE_URL}/tareas`, {
            method: 'POST',
            body: JSON.stringify(nuevaTarea),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al registrar tarea:", error);
    }
}

// 3. Función para obtener tareas de un usuario específico (Criterio 14)
async function obtenerTareaUsuario(userId) {
    try {
        const respuesta = await fetch(`${BASE_URL}/tareas?userId=${userId}`);
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        return [];
    }
}