// 🔥 SCRIPT DE TESTING PARA FORZAR MODO INGLÉS
// Ejecuta este script en la consola del navegador para forzar temporalmente el modo inglés

console.log('🔥 ACTIVATING FORCE ENGLISH MODE...');

// Método 1: Establecer flag en localStorage
localStorage.setItem('force-english-eval', 'true');
console.log('✅ Set force-english-eval flag in localStorage');

// Método 2: Establecer idioma en localStorage
localStorage.setItem('smart-student-lang', 'en');
localStorage.setItem('language', 'en');
console.log('✅ Set language to EN in localStorage');

// Método 3: Agregar parámetro URL
const currentUrl = new URL(window.location);
currentUrl.searchParams.set('lang', 'en');
window.history.replaceState({}, '', currentUrl);
console.log('✅ Added lang=en to URL');

// Método 4: Agregar elemento de testing
let testElement = document.createElement('div');
testElement.setAttribute('data-testid', 'en-toggle-active');
testElement.style.display = 'none';
document.body.appendChild(testElement);
console.log('✅ Added test element for EN toggle detection');

// Método 5: Establecer atributo en document
document.documentElement.lang = 'en';
document.documentElement.setAttribute('data-lang', 'en');
console.log('✅ Set document language to EN');

console.log('🎯 FORCE ENGLISH MODE ACTIVATED!');
console.log('Now try creating or repeating an evaluation - it should generate in English.');
console.log('');
console.log('To disable force mode, run:');
console.log('localStorage.removeItem("force-english-eval");');
console.log('');
console.log('To check current settings, run:');
console.log('console.log("force-english-eval:", localStorage.getItem("force-english-eval"));');
console.log('console.log("smart-student-lang:", localStorage.getItem("smart-student-lang"));');
console.log('console.log("URL lang param:", new URL(window.location).searchParams.get("lang"));');
