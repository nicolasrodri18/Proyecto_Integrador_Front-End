
export const actualizarTarea = async (id, nuevosDatos) => {
    try {
        const respuesta = await fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevosDatos)
        });

        if (!respuesta.ok) throw new Error("Error al actualizar la tarea");

        const tareaActualizada = await respuesta.json();
        return tareaActualizada;
    } catch (error) {
        console.error("Hubo un problema:", error);
        throw error;
    }
}