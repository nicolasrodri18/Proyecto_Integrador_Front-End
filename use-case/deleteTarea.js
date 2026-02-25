export const eliminarTarea = async (id) => {
	try {
		const respuesta = await fetch(`http://localhost:3000/tasks/${id}`, {
			method: 'DELETE'
		});

		if (!respuesta.ok) throw new Error('Error al eliminar la tarea');

		return true;
	} catch (error) {
		console.error('Hubo un problema al eliminar la tarea:', error);
		throw error;
	}
};

