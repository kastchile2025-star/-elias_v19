// Versión pública del sistema de corrección dinámica de asignaciones
(function(){
	'use strict';
	if (typeof window.regenerarAsignacionesDinamicas === 'function') {
		// Ya cargado previamente
		return;
	}

	function obtenerConfiguracionDinamica() {
		try {
			const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
			const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
			const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
			const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
			return { usuarios, cursos, secciones, asignacionesProfesores };
		} catch { return null; }
	}

	function mapear(config) {
		const { usuarios, cursos, secciones } = config;
		const estudiantes = usuarios.filter(u => (u.role==='student'||u.role==='estudiante') && u.isActive!==false);
		const seccionesPorCurso = {};
		cursos.forEach(c => { seccionesPorCurso[c.id] = secciones.filter(s => s.courseId===c.id); });
		const asignaciones = [];
		estudiantes.forEach(e => {
			let c=null, s=null;
			if (e.courseId && e.sectionId) { c=cursos.find(x=>x.id===e.courseId); s=secciones.find(x=>x.id===e.sectionId); }
			if (!c && e.activeCourses && e.activeCourses.length>0) {
				const name=e.activeCourses[0];
				c=cursos.find(x=>x.name===name || x.name.includes(name) || name.includes(x.name));
				if (c) { const arr=seccionesPorCurso[c.id]||[]; s=arr[0]; }
			}
			if (!c && cursos.length>0) { c=cursos[0]; const arr=seccionesPorCurso[c.id]||[]; s=arr[0]; }
			if (c && s) {
				asignaciones.push({ id:`${e.id}-${s.id}-${Date.now()}`, studentId:e.id, courseId:c.id, sectionId:s.id, assignedAt:new Date().toISOString(), isActive:true, studentName:e.displayName||e.username, courseName:c.name, sectionName:s.name });
			}
		});
		return asignaciones;
	}

	function actualizarPerfiles(asignaciones, config) {
		const usuarios=[...config.usuarios];
		asignaciones.forEach(a=>{ const i=usuarios.findIndex(u=>u.id===a.studentId); if(i!==-1){ usuarios[i]={...usuarios[i], courseId:a.courseId, sectionId:a.sectionId, activeCourses: usuarios[i].activeCourses || [a.courseName], updatedAt:new Date().toISOString()}; }});
		localStorage.setItem('smart-student-users', JSON.stringify(usuarios));
		return usuarios;
	}

	function ejecutar() {
		try {
			const cfg = obtenerConfiguracionDinamica();
			if (!cfg) throw new Error('No hay configuración');
			const asignaciones = mapear(cfg);
			localStorage.setItem('smart-student-student-assignments', JSON.stringify(asignaciones));
			actualizarPerfiles(asignaciones, cfg);
			return { exito:true, asignacionesCreadas: asignaciones.length };
		} catch (e) {
			console.error('[fix-dynamic] error:', e); return { exito:false, mensaje: e.message };
		}
	}

	window.regenerarAsignacionesDinamicas = function(){ return ejecutar(); };
	window.obtenerEstadisticasAsignaciones = function(){ try{ const a=JSON.parse(localStorage.getItem('smart-student-student-assignments')||'[]'); const p=JSON.parse(localStorage.getItem('smart-student-teacher-assignments')||'[]'); const u=JSON.parse(localStorage.getItem('smart-student-users')||'[]'); const s={ asignacionesEstudiantes:a.length, asignacionesProfesores:p.length, usuariosTotales:u.length, estudiantes:u.filter(x=>x.role==='student'||x.role==='estudiante').length, profesoresEnSistema:u.filter(x=>x.role==='teacher'||x.role==='profesor').length, cobertura:a.length>0?'Completa':'Incompleta' }; console.table(s); return s; } catch(e){ return null; } };

	// Ejecutar una pasada inicial silenciosa
	try { ejecutar(); } catch {}
})();
