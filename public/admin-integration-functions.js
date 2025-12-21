/**
 * FUNCIONES DE INTEGRACIÓN PARA MÓDULO ADMIN
 * Smart Student v8 - Integración completa con interfaz de administración
 *
 * Este script proporciona las funciones necesarias para integrar la solución
 * de asignaciones dinámicas directamente en el módulo de administración,
 * permitiendo exportar/importar/validar desde la interfaz administrativa.
 */

(function() {
	'use strict';

	console.log('🏛️ [INTEGRACIÓN ADMIN] Iniciando integración con módulo administrativo...');

	const CONFIG_INTEGRACION = {
		mostrarNotificaciones: true,
		validarAntesDeProcesar: true,
		aplicarCorreccionAutomatica: true,
		mostrarProgreso: true,
		timeoutOperaciones: 30000
	};

	class AdminIntegration {
		constructor() {
			this.isProcessing = false;
			this.toastSystem = null;
			this.initializeToastSystem();
		}
		initializeToastSystem() {
			if (typeof window.showToast === 'function') {
				this.toastSystem = window.showToast;
			} else if (window.toast) {
				this.toastSystem = window.toast;
			} else {
				this.toastSystem = (options) => {
					const prefix = options.variant === 'destructive' ? '❌' : '✅';
					console.log(`${prefix} [${options.title}] ${options.description}`);
				};
			}
		}
		showNotification(title, description, variant = 'default') {
			if (CONFIG_INTEGRACION.mostrarNotificaciones) {
				this.toastSystem({ title, description, variant });
			}
		}
		showProgress(message) {
			if (CONFIG_INTEGRACION.mostrarProgreso) console.log(`⏳ [PROGRESO] ${message}`);
		}
		handleError(error, operation) {
			console.error(`❌ [ERROR ${operation.toUpperCase()}]`, error);
			this.showNotification(`Error en ${operation}`, error.message || 'Error inesperado', 'destructive');
		}
	}

	async function exportarDesdeAdmin() {
		const admin = new AdminIntegration();
		if (admin.isProcessing) {
			admin.showNotification('Operación en progreso', 'Espera a que finalice la operación actual', 'destructive');
			return;
		}
		admin.isProcessing = true;
		try {
			admin.showProgress('Iniciando exportación completa...');
			admin.showNotification('Exportación iniciada', 'Preparando datos...');
			if (CONFIG_INTEGRACION.validarAntesDeProcesar) {
				admin.showProgress('Validando sistema antes de exportar...');
				const validacion = await validarSistemaCompleto();
				if (!validacion.esValido && validacion.problemasCriticos) throw new Error('Problemas críticos antes de exportar');
			}
			if (CONFIG_INTEGRACION.aplicarCorreccionAutomatica) {
				admin.showProgress('Aplicando corrección automática...');
				await aplicarCorreccionAntesDeProcesar();
			}
			admin.showProgress('Ejecutando exportación mejorada...');
			const resultado = await ejecutarExportacionConTimeout();
			if (resultado.exito) {
				admin.showNotification('Exportación exitosa', `Archivo: ${resultado.archivo}`);
				console.log('📊 [EXPORTACIÓN ADMIN] Estadísticas:', resultado.estadisticas);
			} else {
				throw new Error(resultado.mensaje || 'Error durante la exportación');
			}
		} catch (e) {
			admin.handleError(e, 'exportación');
		} finally {
			admin.isProcessing = false;
		}
	}

	async function importarDesdeAdmin(inputElement) {
		const admin = new AdminIntegration();
		if (admin.isProcessing) {
			admin.showNotification('Operación en progreso', 'Espera a que finalice la operación actual', 'destructive');
			return;
		}
		if (!inputElement.files || inputElement.files.length === 0) {
			admin.showNotification('Archivo requerido', 'Selecciona un archivo', 'destructive');
			return;
		}
		admin.isProcessing = true;
		try {
			const archivo = inputElement.files[0];
			
			// Validar tipo de archivo
			console.log('📁 [IMPORTACIÓN] Archivo seleccionado:', {
				nombre: archivo.name,
				tipo: archivo.type,
				tamaño: archivo.size + ' bytes'
			});
			
			if (!archivo.name.endsWith('.json')) {
				throw new Error('El archivo debe ser de tipo JSON (.json)');
			}
			
			if (archivo.size === 0) {
				throw new Error('El archivo está vacío (0 bytes)');
			}
			
			if (archivo.size > 50 * 1024 * 1024) {
				throw new Error('El archivo es demasiado grande (máximo 50MB)');
			}
			
			admin.showProgress('Leyendo archivo...');
			const contenido = await leerArchivoAsync(archivo);
			admin.showProgress('Validando contenido...');
			const valid = validarContenidoArchivo(contenido);
			if (!valid.esValido) {
				const causa = valid.problemas[0] || 'Formato no reconocido';
				const mensajeDetallado = valid.problemas.length > 1 
					? `${causa} (+${valid.problemas.length-1} problemas más. Ver consola para detalles)` 
					: causa;
				
				console.error('❌ [IMPORTACIÓN] Archivo rechazado. Problemas encontrados:', valid.problemas);
				console.log('💡 [AYUDA] Asegúrate de que el archivo:');
				console.log('   1. Sea un archivo JSON válido');
				console.log('   2. Tenga la estructura correcta de Smart Student');
				console.log('   3. Contenga todas las colecciones requeridas');
				
				throw new Error('Archivo inválido • ' + mensajeDetallado);
			}
			admin.showProgress('Creando respaldo...');
			await crearRespaldoSeguridad();
			admin.showProgress('Importando datos...');
			const resultado = await ejecutarImportacionConTimeout(contenido);
			if (resultado.exito) {
				admin.showNotification('Importación exitosa', 'Datos importados y aplicados');
				admin.showProgress('Validando sistema post-importación...');
				const post = await validarSistemaCompleto();
				if (post.esValido) admin.showNotification('Validación exitosa', 'Sistema OK');
				else admin.showNotification('Validación parcial', 'Se detectaron algunas inconsistencias');
				console.log('📊 [IMPORTACIÓN ADMIN] Estadísticas:', resultado.estadisticas);
				admin.showNotification('Recarga recomendada', 'Recarga para aplicar todos los cambios');
			} else {
				throw new Error(resultado.mensaje || 'Error durante la importación');
			}
		} catch (e) {
			admin.handleError(e, 'importación');
			try { await restaurarRespaldoSeguridad(); } catch {}
		} finally {
			admin.isProcessing = false;
			if (inputElement) inputElement.value = '';
		}
	}

	async function validarDesdeAdmin() {
		const admin = new AdminIntegration();
		try {
			admin.showProgress('Validando sistema...');
			admin.showNotification('Validación iniciada', 'Analizando asignaciones...');
			const res = await validarSistemaCompleto();
			if (res.esValido) admin.showNotification('Sistema válido', 'Todas las validaciones pasaron');
			else admin.showNotification('Problemas detectados', `${res.problemas.length} problemas`, 'destructive');
			console.log('📊 [VALIDACIÓN ADMIN] Estadísticas:', res.estadisticas);
			return res;
		} catch (e) {
			admin.handleError(e, 'validación');
		}
	}

	async function aplicarCorreccionAutomatica() {
		const admin = new AdminIntegration();
		try {
			admin.showProgress('Aplicando corrección dinámica...');
			admin.showNotification('Corrección iniciada', 'Regenerando asignaciones...');
			if (typeof window.regenerarAsignacionesDinamicas === 'function') {
				const resultado = window.regenerarAsignacionesDinamicas();
				if (resultado.exito) admin.showNotification('Corrección exitosa', `${resultado.asignacionesCreadas} asignaciones`);
				else throw new Error(resultado.mensaje || 'Error en corrección');
			} else {
				throw new Error('Sistema de corrección dinámica no disponible');
			}
		} catch (e) {
			admin.handleError(e, 'corrección automática');
		}
	}

	async function ejecutarExportacionConTimeout() {
		return new Promise((resolve, reject) => {
			const t = setTimeout(() => reject(new Error('Timeout exportación')), CONFIG_INTEGRACION.timeoutOperaciones);
			try {
				if (typeof window.exportarBBDDConAsignaciones === 'function') {
					const r = window.exportarBBDDConAsignaciones();
					clearTimeout(t); resolve(r);
				} else {
					clearTimeout(t); reject(new Error('Sistema de exportación no disponible'));
				}
			} catch (e) { clearTimeout(t); reject(e); }
		});
	}

	async function ejecutarImportacionConTimeout(contenido) {
		return new Promise((resolve, reject) => {
			const t = setTimeout(() => reject(new Error('Timeout importación')), CONFIG_INTEGRACION.timeoutOperaciones);
			try {
				if (typeof window.importarBBDDConAsignaciones === 'function') {
					const r = window.importarBBDDConAsignaciones(contenido);
					clearTimeout(t); resolve(r);
				} else {
					clearTimeout(t); reject(new Error('Sistema de importación no disponible'));
				}
			} catch (e) { clearTimeout(t); reject(e); }
		});
	}

	function leerArchivoAsync(archivo) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = () => reject(new Error('Error al leer el archivo'));
			reader.readAsText(archivo);
		});
	}

	function validarContenidoArchivo(contenido) {
		try {
			// Validar que el contenido no esté vacío
			if (!contenido || typeof contenido !== 'string') {
				console.error('❌ [VALIDACIÓN] Contenido vacío o no es string:', typeof contenido);
				return { esValido: false, problemas: ['Archivo vacío o formato inválido'] };
			}

			// Validar que sea un string con contenido
			const contenidoTrimmed = contenido.trim();
			if (contenidoTrimmed.length === 0) {
				console.error('❌ [VALIDACIÓN] Archivo vacío después de trim');
				return { esValido: false, problemas: ['Archivo vacío'] };
			}

			// Validar que comience con { o [
			if (!contenidoTrimmed.startsWith('{') && !contenidoTrimmed.startsWith('[')) {
				console.error('❌ [VALIDACIÓN] Archivo no comienza con { o [. Primeros 100 chars:', contenidoTrimmed.substring(0, 100));
				return { esValido: false, problemas: ['Archivo no tiene formato JSON (debe comenzar con { o [)'] };
			}

			// Intentar parsear el JSON
			let datos;
			try {
				datos = JSON.parse(contenido);
			} catch (parseError) {
				console.error('❌ [VALIDACIÓN] Error al parsear JSON:', parseError.message);
				console.error('Primeros 500 caracteres del archivo:', contenido.substring(0, 500));
				return { esValido: false, problemas: [`Archivo no es JSON válido: ${parseError.message}`] };
			}

			const problemas = [];
			if (!Array.isArray(datos['smart-student-users'])) problemas.push('Faltan usuarios (smart-student-users)');
			if (!Array.isArray(datos['smart-student-courses'])) problemas.push('Faltan cursos (smart-student-courses)');
			if (!Array.isArray(datos['smart-student-sections'])) problemas.push('Faltan secciones (smart-student-sections)');
			if (!Array.isArray(datos['smart-student-student-assignments'])) problemas.push('Faltan asignaciones estudiantes');
			if (!Array.isArray(datos['smart-student-teacher-assignments'])) problemas.push('Faltan asignaciones profesores');
			if (datos.calendarConfigs && typeof datos.calendarConfigs !== 'object') problemas.push('calendarConfigs debe ser objeto');
			
			const res = { esValido: problemas.length === 0, problemas };
			if (!res.esValido) {
				console.warn('⚠️ [VALIDACIÓN IMPORTACIÓN] Problemas:', problemas);
			} else {
				console.log('✅ [VALIDACIÓN] Archivo JSON válido con estructura correcta');
			}
			return res;
		} catch (error) {
			console.error('❌ [VALIDACIÓN] Error inesperado:', error);
			return { esValido: false, problemas: [`Error al validar archivo: ${error.message}`] };
		}
	}

	async function crearRespaldoSeguridad() {
		try {
			const datos = {
				timestamp: new Date().toISOString(),
				'smart-student-users': JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
				'smart-student-student-assignments': JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]'),
				'smart-student-teacher-assignments': JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]'),
				'smart-student-tasks': JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
				'smart-student-task-comments': JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]'),
				'smart-student-task-notifications': JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]'),
				'smart-student-evaluations': JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]'),
				'smart-student-evaluation-results': JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]'),
				'smart-student-attendance': JSON.parse(localStorage.getItem('smart-student-attendance') || '[]')
			};
			localStorage.setItem('smart-student-backup-seguridad', JSON.stringify(datos));
			console.log('💾 [RESPALDO] Respaldo creado');
		} catch (e) {
			console.warn('⚠️ [RESPALDO] No se pudo crear respaldo:', e);
		}
	}

	async function restaurarRespaldoSeguridad() {
		try {
			const respaldo = localStorage.getItem('smart-student-backup-seguridad');
			if (!respaldo) return;
			const d = JSON.parse(respaldo);
			localStorage.setItem('smart-student-users', JSON.stringify(d['smart-student-users']||[]));
			localStorage.setItem('smart-student-student-assignments', JSON.stringify(d['smart-student-student-assignments']||[]));
			localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(d['smart-student-teacher-assignments']||[]));
			localStorage.setItem('smart-student-tasks', JSON.stringify(d['smart-student-tasks']||[]));
			localStorage.setItem('smart-student-task-comments', JSON.stringify(d['smart-student-task-comments']||[]));
			localStorage.setItem('smart-student-task-notifications', JSON.stringify(d['smart-student-task-notifications']||[]));
			localStorage.setItem('smart-student-evaluations', JSON.stringify(d['smart-student-evaluations']||[]));
			localStorage.setItem('smart-student-evaluation-results', JSON.stringify(d['smart-student-evaluation-results']||[]));
			localStorage.setItem('smart-student-attendance', JSON.stringify(d['smart-student-attendance']||[]));
			console.log('🔁 [RESTAURACIÓN] Respaldo restaurado');
		} catch (e) {
			console.error('❌ [RESTAURACIÓN] Error:', e);
		}
	}

	async function validarSistemaCompleto() {
		if (typeof window.validarAsignacionesManualmente === 'function') return window.validarAsignacionesManualmente();
		try {
			const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
			const asignaciones = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
			return { esValido: usuarios.length>0 && asignaciones.length>0, problemas: [], estadisticas: { usuarios: usuarios.length, asignaciones: asignaciones.length } };
		} catch (e) {
			return { esValido: false, problemas: [{ tipo:'Error de validación', detalles: e.message }], estadisticas: {} };
		}
	}

	async function aplicarCorreccionAntesDeProcesar() {
		if (typeof window.regenerarAsignacionesDinamicas === 'function') window.regenerarAsignacionesDinamicas();
	}

	function integrarBotonesEnAdmin() {
		const botones = document.querySelectorAll('button');
		let exportBtn = null;
		for (const b of botones) {
			if (b.textContent && (b.textContent.toLowerCase().includes('exportar') || b.textContent.toLowerCase().includes('export'))) { exportBtn = b; break; }
		}
		if (exportBtn) {
			const nuevo = exportBtn.cloneNode(true);
			exportBtn.parentNode.replaceChild(nuevo, exportBtn);
			nuevo.addEventListener('click', (e) => { e.preventDefault(); exportarDesdeAdmin(); });
			console.log('✅ [INTEGRACIÓN] Botón de exportar integrado');
		}
		
		// Solo capturar el input específico de importar base de datos (JSON), NO el de Excel
		const inputsFile = document.querySelectorAll('input[type="file"]');
		for (const input of inputsFile) {
			// Filtrar: solo inputs que acepten .json o que NO tengan accept definido
			const acceptAttr = input.getAttribute('accept');
			if (!acceptAttr || acceptAttr.includes('.json') || acceptAttr.includes('application/json')) {
				input.addEventListener('change', (e) => { 
					if (e.target.files && e.target.files.length > 0) {
						const file = e.target.files[0];
						// Verificar que sea JSON antes de llamar a importarDesdeAdmin
						if (file.name.endsWith('.json')) {
							importarDesdeAdmin(e.target);
						}
					}
				});
				console.log('✅ [INTEGRACIÓN] Input de importar JSON integrado:', input.id || 'sin-id');
			}
		}
	}

	window.exportarDesdeAdmin = exportarDesdeAdmin;
	window.importarDesdeAdmin = importarDesdeAdmin;
	window.validarDesdeAdmin = validarDesdeAdmin;
	window.aplicarCorreccionAutomatica = aplicarCorreccionAutomatica;
	window.integrarConAdmin = function() { integrarBotonesEnAdmin(); };

	console.log('✅ [INTEGRACIÓN ADMIN] Inicializado');
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { if (window.location.pathname.includes('admin') || window.location.pathname.includes('gestion')) window.integrarConAdmin(); }, 2000); });
	} else {
		setTimeout(() => { if (window.location.pathname.includes('admin') || window.location.pathname.includes('gestion')) window.integrarConAdmin(); }, 2000);
	}

})();
