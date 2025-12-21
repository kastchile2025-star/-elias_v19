// 🎨 Script para verificar formato consistente de notificaciones estudiante/profesor
// Este script verifica que ambos roles tengan el mismo formato visual

console.log('🎨 Verificando formato consistente de notificaciones...');

function verifyNotificationFormats() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);

        // 1. Verificar elementos de formato en el DOM
        console.log('\n🔍 Verificando elementos de formato en el DOM...');
        
        // Buscar badges de asignatura
        const badges = document.querySelectorAll('.notifications-panel .badge, [class*="badge"]');
        console.log(`📛 Badges encontrados: ${badges.length}`);
        
        // Buscar iconos circulares
        const circularIcons = document.querySelectorAll('.notifications-panel .bg-blue-100, .bg-orange-100, .bg-purple-100, .bg-green-100');
        console.log(`🔵 Iconos circulares: ${circularIcons.length}`);
        
        // Buscar estructura de notificaciones
        const notificationItems = document.querySelectorAll('.notifications-panel [class*="hover:bg-muted"]');
        console.log(`📋 Items de notificación: ${notificationItems.length}`);

        // 2. Analizar estructura específica por rol
        if (currentUser.role === 'student') {
            console.log('\n📚 Analizando formato ESTUDIANTE...');
            
            // Verificar secciones del estudiante
            const sectionsStudent = {
                pendingEvaluations: document.querySelector('[class*="bg-purple-50"] h3'),
                pendingTasks: document.querySelector('[class*="bg-orange-50"] h3'),
                unreadComments: document.querySelector('[class*="bg-blue-50"] h3'),
                gradesComments: document.querySelector('[class*="bg-green-50"] h3')
            };
            
            Object.entries(sectionsStudent).forEach(([section, element]) => {
                console.log(`   ${section}: ${element ? '✅ Encontrado' : '❌ No encontrado'}`);
                if (element) {
                    console.log(`      Texto: "${element.textContent}"`);
                }
            });
            
            // Verificar badges en comentarios no leídos
            const unreadCommentsSection = document.querySelector('[class*="bg-blue-50"]')?.closest('div')?.nextElementSibling;
            if (unreadCommentsSection) {
                const badgesInComments = unreadCommentsSection.querySelectorAll('[class*="border-blue-200"]');
                console.log(`   📛 Badges en comentarios no leídos: ${badgesInComments.length}`);
            }
            
            // Verificar badges en calificaciones
            const gradesSection = document.querySelector('[class*="bg-green-50"]')?.closest('div')?.nextElementSibling;
            if (gradesSection) {
                const badgesInGrades = gradesSection.querySelectorAll('[class*="border-green-200"], [class*="border-blue-200"]');
                console.log(`   📛 Badges en calificaciones: ${badgesInGrades.length}`);
            }

        } else if (currentUser.role === 'teacher') {
            console.log('\n🎓 Analizando formato PROFESOR...');
            
            // Verificar secciones del profesor
            const sectionsTeacher = {
                pendingEvaluations: document.querySelector('[class*="bg-purple-50"] h3'),
                pendingTasks: document.querySelector('[class*="bg-orange-50"] h3'),
                unreadComments: document.querySelector('[class*="bg-blue-50"] h3'),
                completedTasks: document.querySelector('[class*="bg-orange-100"] h3')
            };
            
            Object.entries(sectionsTeacher).forEach(([section, element]) => {
                console.log(`   ${section}: ${element ? '✅ Encontrado' : '❌ No encontrado'}`);
                if (element) {
                    console.log(`      Texto: "${element.textContent}"`);
                }
            });
        }

        // 3. Verificar consistencia de formato
        console.log('\n🎯 Verificando consistencia de formato...');
        
        // Verificar que todos los items tengan la estructura: icono + contenido + badge
        notificationItems.forEach((item, index) => {
            const icon = item.querySelector('[class*="rounded-full"]');
            const badge = item.querySelector('[class*="border-"], [variant="outline"]');
            const content = item.querySelector('.font-medium');
            
            console.log(`   Item ${index + 1}:`);
            console.log(`      Icono: ${icon ? '✅' : '❌'}`);
            console.log(`      Badge: ${badge ? '✅' : '❌'}`);
            console.log(`      Contenido: ${content ? '✅' : '❌'}`);
            
            if (content && index < 3) {
                console.log(`      Título: "${content.textContent}"`);
            }
        });

        // 4. Verificar funciones de formato
        console.log('\n🛠️ Verificando funciones de formato...');
        
        // Verificar función splitTextForBadge
        if (typeof window.splitTextForBadge !== 'function') {
            console.log('❌ splitTextForBadge no está disponible');
        } else {
            console.log('✅ splitTextForBadge disponible');
            const testResult = window.splitTextForBadge('Matemáticas');
            console.log(`   Prueba "Matemáticas": ${JSON.stringify(testResult)}`);
        }
        
        // Verificar función getCourseAbbreviation
        if (typeof window.getCourseAbbreviation !== 'function') {
            console.log('❌ getCourseAbbreviation no está disponible');
        } else {
            console.log('✅ getCourseAbbreviation disponible');
            const testResult = window.getCourseAbbreviation('Ciencias Naturales');
            console.log(`   Prueba "Ciencias Naturales": "${testResult}"`);
        }

        // 5. Forzar actualización si es necesario
        console.log('\n🔄 Forzando actualización del formato...');
        
        // Disparar eventos para actualizar formato
        window.dispatchEvent(new CustomEvent('notificationFormatUpdate'));
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('formatConsistencyCheck'));
        }, 100);

        console.log('✅ Eventos de actualización disparados');

        return true;

    } catch (error) {
        console.error('❌ Error verificando formato:', error);
        return false;
    }
}

// Función para aplicar formato forzado
function forceFormatConsistency() {
    console.log('\n🔧 Aplicando formato consistente forzado...');
    
    try {
        // Buscar elementos sin badge que deberían tenerlo
        const notificationItems = document.querySelectorAll('.notifications-panel [class*="hover:bg-muted"]');
        
        notificationItems.forEach((item, index) => {
            const badge = item.querySelector('[class*="border-"], [variant="outline"]');
            const content = item.querySelector('.flex-1');
            
            if (!badge && content) {
                console.log(`   Aplicando badge faltante al item ${index + 1}`);
                
                // Crear badge básico si falta
                const header = content.querySelector('.flex.items-center.justify-between');
                if (header && !header.querySelector('[class*="border-"]')) {
                    const badgeHtml = `
                        <div class="text-xs border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 font-medium flex flex-col items-center justify-center text-center leading-tight min-w-[2.5rem] h-8 rounded px-2">
                            <span class="block">GEN</span>
                        </div>
                    `;
                    
                    const timestamp = header.querySelector('.text-xs.text-muted-foreground');
                    if (timestamp) {
                        timestamp.insertAdjacentHTML('beforebegin', badgeHtml);
                        timestamp.style.display = 'none'; // Ocultar timestamp duplicado
                    }
                }
            }
        });
        
        console.log('✅ Formato forzado aplicado');
        return true;
        
    } catch (error) {
        console.error('❌ Error aplicando formato forzado:', error);
        return false;
    }
}

// Ejecutar verificación
console.log('🚀 Ejecutando verificación de formato...');
const success = verifyNotificationFormats();

if (success) {
    console.log('\n🎉 Verificación completada');
    console.log('💡 Usa forceFormatConsistency() para aplicar formato forzado si es necesario');
    console.log('🔄 Recarga la página para ver todos los cambios aplicados');
} else {
    console.log('\n❌ Verificación falló');
}

// Hacer funciones disponibles globalmente
window.verifyNotificationFormats = verifyNotificationFormats;
window.forceFormatConsistency = forceFormatConsistency;

console.log('\n🎨 Script de verificación de formato completado');
