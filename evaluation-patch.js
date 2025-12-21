// 🔧 PARCHE CRÍTICO: Evaluaciones EN Activo
// Este script debe ejecutarse después de cargar la página de evaluaciones

console.log('🔧 Aplicando parche para evaluaciones EN activo...');

// 1. Función mejorada de detección de idioma
function detectLanguageImproved() {
    console.log('🔍 PARCHE: Detección mejorada de idioma iniciada');
    
    // Verificar múltiples fuentes
    const sources = {
        localStorage: localStorage.getItem('smart-student-lang'),
        documentLang: document.documentElement.lang,
        context: window.languageContext?.language,
        urlParams: new URLSearchParams(window.location.search).get('lang')
    };
    
    console.log('📊 PARCHE: Fuentes de idioma:', sources);
    
    // Buscar toggle EN activo de manera más robusta
    let enToggleActive = false;
    const allElements = document.querySelectorAll('*');
    
    for (let element of allElements) {
        const text = element.textContent?.trim();
        const rect = element.getBoundingClientRect();
        
        // Buscar EN en la parte superior derecha
        if (text === 'EN' && rect.top < 100 && rect.right > window.innerWidth - 300) {
            // Verificar si está activo usando múltiples métodos
            const isActive = element.classList.contains('active') ||
                           element.getAttribute('data-state') === 'checked' ||
                           element.getAttribute('aria-checked') === 'true' ||
                           element.parentElement?.getAttribute('data-state') === 'checked' ||
                           element.closest('[data-state="checked"]') !== null;
            
            if (isActive) {
                enToggleActive = true;
                console.log('✅ PARCHE: Toggle EN activo encontrado', element);
                break;
            }
        }
    }
    
    // Determinar idioma final
    const shouldUseEnglish = enToggleActive || sources.localStorage === 'en' || sources.documentLang === 'en';
    const finalLanguage = shouldUseEnglish ? 'en' : 'es';
    
    console.log(`🎯 PARCHE: Idioma final determinado: ${finalLanguage}`);
    console.log(`🔍 PARCHE: Razón: ${enToggleActive ? 'Toggle EN activo' : 'Configuración localStorage/document'}`);
    
    return finalLanguage;
}

// 2. Función mejorada de generación de evaluación
function improvedEvaluationGeneration() {
    console.log('📝 PARCHE: Función mejorada de generación iniciada');
    
    // Interceptar el handleCreateEvaluation original
    if (window.handleCreateEvaluation) {
        const originalFunction = window.handleCreateEvaluation;
        
        window.handleCreateEvaluation = async function(...args) {
            console.log('🚀 PARCHE: Interceptando handleCreateEvaluation');
            
            try {
                // Aplicar detección mejorada de idioma
                const language = detectLanguageImproved();
                
                // Forzar sincronización antes de continuar
                localStorage.setItem('smart-student-lang', language);
                document.documentElement.lang = language;
                
                console.log(`🔄 PARCHE: Idioma sincronizado a ${language}`);
                
                // Llamar función original con timeout aumentado
                const timeoutId = setTimeout(() => {
                    console.log('⏱️ PARCHE: Timeout de 30 segundos alcanzado');
                    alert('La generación de evaluación está tomando más tiempo de lo normal. Por favor, intenta nuevamente.');
                }, 30000);
                
                const result = await originalFunction.apply(this, args);
                clearTimeout(timeoutId);
                
                console.log('✅ PARCHE: Generación completada exitosamente');
                return result;
                
            } catch (error) {
                console.error('❌ PARCHE: Error en generación:', error);
                
                // Mostrar error más descriptivo al usuario
                const errorMessage = `Error al generar evaluación: ${error.message || 'Error desconocido'}`;
                alert(errorMessage);
                
                // Intentar fallback
                console.log('🔄 PARCHE: Intentando método de fallback...');
                return await fallbackEvaluationGeneration();
            }
        };
        
        console.log('✅ PARCHE: handleCreateEvaluation interceptado exitosamente');
    }
}

// 3. Función de fallback para generación
async function fallbackEvaluationGeneration() {
    console.log('🆘 PARCHE: Ejecutando generación de fallback');
    
    const language = detectLanguageImproved();
    
    try {
        // Parámetros básicos de fallback
        const params = {
            bookTitle: 'Ciencias Naturales',
            topic: 'Evaluación General',
            language: language,
            questionCount: 15,
            timeLimit: 120
        };
        
        console.log('📡 PARCHE: Llamando API de fallback con:', params);
        
        const response = await fetch('/api/generate-dynamic-evaluation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Fallback-Mode': 'true'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ PARCHE: Fallback exitoso');
        
        return data;
        
    } catch (error) {
        console.error('❌ PARCHE: Fallback también falló:', error);
        alert('No se pudo generar la evaluación. Por favor, revisa tu conexión e intenta nuevamente.');
        throw error;
    }
}

// 4. Función para aplicar todas las correcciones
function applyEvaluationPatches() {
    console.log('🔧 PARCHE: Aplicando todas las correcciones...');
    
    // Corrección 1: Mejorar detección de idioma
    improvedEvaluationGeneration();
    
    // Corrección 2: Interceptar clicks en botones
    document.addEventListener('click', function(event) {
        const target = event.target;
        const buttonText = target.textContent?.trim();
        
        if (buttonText === 'Crear Evaluación' || buttonText === 'Create Evaluation' || 
            buttonText === 'Repetir Evaluación' || buttonText === 'Retake Evaluation') {
            
            console.log(`🎯 PARCHE: Click interceptado en "${buttonText}"`);
            
            // Verificar estado antes de continuar
            const language = detectLanguageImproved();
            console.log(`🌍 PARCHE: Idioma detectado para "${buttonText}": ${language}`);
            
            // Mostrar indicador de carga mejorado
            const loadingOverlay = document.createElement('div');
            loadingOverlay.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                           background: rgba(0,0,0,0.7); z-index: 9999; display: flex; 
                           align-items: center; justify-content: center; color: white;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; margin-bottom: 10px;">
                            Generando evaluación en ${language === 'en' ? 'inglés' : 'español'}...
                        </div>
                        <div style="font-size: 14px; opacity: 0.8;">
                            Por favor espera, esto puede tomar hasta 30 segundos
                        </div>
                    </div>
                </div>
            `;
            loadingOverlay.id = 'evaluation-loading-overlay';
            document.body.appendChild(loadingOverlay);
            
            // Remover overlay después de 35 segundos como máximo
            setTimeout(() => {
                const overlay = document.getElementById('evaluation-loading-overlay');
                if (overlay) {
                    overlay.remove();
                }
            }, 35000);
        }
    });
    
    // Corrección 3: Limpiar overlays en casos de éxito
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const result = await originalFetch.apply(this, args);
        
        // Si fue exitoso, limpiar overlay
        if (result.ok && args[0]?.includes('/api/generate-dynamic-evaluation')) {
            setTimeout(() => {
                const overlay = document.getElementById('evaluation-loading-overlay');
                if (overlay) {
                    overlay.remove();
                }
            }, 1000);
        }
        
        return result;
    };
    
    console.log('✅ PARCHE: Todas las correcciones aplicadas');
}

// 5. Función de diagnóstico rápido
function quickDiagnosis() {
    console.log('🩺 PARCHE: Diagnóstico rápido del sistema');
    
    const results = {
        userLogged: !!localStorage.getItem('smart-student-user'),
        language: localStorage.getItem('smart-student-lang'),
        onEvaluationPage: window.location.pathname.includes('evaluacion'),
        hasCreateButton: !!document.querySelector('button[data-testid="create-evaluation"], button:contains("Crear Evaluación")'),
        apiReachable: 'testing...'
    };
    
    console.table(results);
    
    // Test rápido de API
    fetch('/api/generate-dynamic-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
    }).then(response => {
        console.log(`📡 PARCHE: API alcanzable: ${response.status}`);
    }).catch(error => {
        console.log(`❌ PARCHE: API no alcanzable: ${error.message}`);
    });
    
    return results;
}

// Aplicar parches al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEvaluationPatches);
} else {
    applyEvaluationPatches();
}

// Ejecutar diagnóstico después de 2 segundos
setTimeout(quickDiagnosis, 2000);

// Exponer funciones globalmente para debug manual
window.evaluationPatch = {
    applyPatches: applyEvaluationPatches,
    detectLanguage: detectLanguageImproved,
    diagnose: quickDiagnosis,
    fallbackGeneration: fallbackEvaluationGeneration
};

console.log('🎉 PARCHE: Sistema de correcciones cargado completamente');
console.log('💡 PARCHE: Usa window.evaluationPatch para funciones de debug');
