// 🔧 DETECCIÓN SÚPER AGRESIVA DEL TOGGLE EN
function detectEnToggleAggressive() {
  console.log('🔍 AGGRESSIVE EN TOGGLE DETECTION START');
  
  // Buscar TODOS los elementos que contengan "EN"
  const allElements = Array.from(document.querySelectorAll('*'));
  const enElements = allElements.filter(el => {
    const text = el.textContent?.trim();
    return text === 'EN' || text === 'En' || text === 'en';
  });
  
  console.log('🔍 Found', enElements.length, 'elements with EN text');
  
  for (let i = 0; i < enElements.length; i++) {
    const element = enElements[i];
    const rect = element.getBoundingClientRect();
    
    // Si el elemento está visible
    if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < 200) {
      console.log(`🔍 EN Element ${i}:`, {
        tagName: element.tagName,
        text: element.textContent?.trim(),
        position: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        className: element.className,
        id: element.id,
        // Estados del elemento
        dataState: element.getAttribute('data-state'),
        ariaChecked: element.getAttribute('aria-checked'),
        ariaPressed: element.getAttribute('aria-pressed'),
        role: element.getAttribute('role'),
        // Estados del padre
        parentTag: element.parentElement?.tagName,
        parentClass: element.parentElement?.className,
        parentDataState: element.parentElement?.getAttribute('data-state'),
        parentAriaChecked: element.parentElement?.getAttribute('aria-checked'),
        // Elementos cercanos con estado
        closestChecked: element.closest('[data-state="checked"]'),
        closestAriaChecked: element.closest('[aria-checked="true"]'),
        closestSwitch: element.closest('[role="switch"]'),
        // Verificar si hay elementos activos en los ancestros
        hasActiveAncestor: checkActiveAncestor(element)
      });
      
      // Verificaciones múltiples para estado activo
      const checks = {
        'element.data-state': element.getAttribute('data-state') === 'checked',
        'element.aria-checked': element.getAttribute('aria-checked') === 'true',
        'element.aria-pressed': element.getAttribute('aria-pressed') === 'true',
        'parent.data-state': element.parentElement?.getAttribute('data-state') === 'checked',
        'parent.aria-checked': element.parentElement?.getAttribute('aria-checked') === 'true',
        'closest-checked': element.closest('[data-state="checked"]') !== null,
        'closest-aria-checked': element.closest('[aria-checked="true"]') !== null,
        'closest-switch-checked': element.closest('[role="switch"][data-state="checked"]') !== null,
        'ancestor-active': checkActiveAncestor(element)
      };
      
      const isActive = Object.values(checks).some(check => check === true);
      
      console.log(`🔍 EN Element ${i} checks:`, checks, 'ACTIVE:', isActive);
      
      if (isActive) {
        console.log('✅ FOUND ACTIVE EN TOGGLE!');
        return true;
      }
    }
  }
  
  console.log('❌ NO ACTIVE EN TOGGLE FOUND');
  return false;
}

function checkActiveAncestor(element) {
  let current = element.parentElement;
  let depth = 0;
  while (current && depth < 5) {
    if (current.getAttribute('data-state') === 'checked' || 
        current.getAttribute('aria-checked') === 'true' ||
        current.getAttribute('aria-pressed') === 'true') {
      return true;
    }
    current = current.parentElement;
    depth++;
  }
  return false;
}

// Test function
console.log('EN toggle active:', detectEnToggleAggressive());
