// 🔧 FUNCIÓN SIMPLE Y DIRECTA PARA DETECTAR IDIOMA
const detectCurrentLanguage = useCallback(() => {
  console.log('🌍 SIMPLE LANGUAGE DETECTION...');
  
  // 🎯 BUSCAR EL TOGGLE EN DIRECTAMENTE
  let isEnglish = false;
  
  // Método 1: Buscar toggle EN activo
  const enElements = document.querySelectorAll('*');
  for (const element of enElements) {
    if (element.textContent?.trim() === 'EN') {
      const rect = element.getBoundingClientRect();
      // Si está visible en la parte superior (header)
      if (rect.top >= 0 && rect.top < 120 && rect.width > 0) {
        // Verificar si está activo
        const isActive = 
          element.closest('[data-state="checked"]') !== null ||
          element.closest('[aria-checked="true"]') !== null ||
          element.getAttribute('data-state') === 'checked' ||
          element.getAttribute('aria-checked') === 'true' ||
          element.parentElement?.getAttribute('data-state') === 'checked';
        
        if (isActive) {
          isEnglish = true;
          console.log('✅ EN toggle found and ACTIVE!');
          break;
        }
      }
    }
  }
  
  // Método 2: Verificar contexto si no se encontró toggle activo
  if (!isEnglish && currentUiLanguage === 'en') {
    isEnglish = true;
    console.log('✅ Using English from context');
  }
  
  const language = isEnglish ? 'en' : 'es';
  
  // Sincronizar estado
  if (language === 'en') {
    localStorage.setItem('smart-student-lang', 'en');
    localStorage.setItem('language', 'en');
    document.documentElement.lang = 'en';
  }
  
  console.log('🎯 LANGUAGE DECISION:', language, language === 'en' ? '🇺🇸' : '🇪🇸');
  return language;
}, [currentUiLanguage]);
