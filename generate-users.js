const fs = require('fs');

// Generar 45 estudiantes por sección
const nombres = [
  "Sofía", "Matías", "Valentina", "Benjamín", "Martina", "Lucas", "Isidora", "Agustín", "Emilia", "Tomás",
  "Amanda", "Diego", "Catalina", "Santiago", "Josefa", "Nicolás", "Florencia", "Gabriel", "Trinidad", "Maximiliano",
  "Antonia", "Joaquín", "Constanza", "Felipe", "María José", "Sebastián", "Fernanda", "Vicente", "Javiera", "Cristóbal",
  "Maite", "Andrés", "Ignacia", "Manuel", "Renata", "Mateo", "Francisca", "Ángel", "Victoria", "Eduardo",
  "Carolina", "Alberto", "Daniela", "Roberto", "Gabriela"
];

const apellidos1 = [
  "González", "López", "Rojas", "Torres", "Fernández", "Muñoz", "Ramírez", "Contreras", "Sepúlveda", "Gutiérrez",
  "Vega", "Espinoza", "Cortés", "Figueroa", "Alarcón", "Jara", "Campos", "Ponce", "Valdés", "Bravo",
  "Medina", "Santana", "Salazar", "Tapia", "Carrasco", "Cáceres", "Ibáñez", "Zamora", "Maldonado", "Reyes",
  "Araya", "Jiménez", "Pizarro", "Gallardo", "Valenzuela", "Castillo", "Henríquez", "Mora", "Sánchez", "Montoya",
  "Aravena", "Poblete", "Osorio", "Pavez", "Flores"
];

const apellidos2 = [
  "Martínez", "Silva", "Pérez", "Castro", "Díaz", "Vargas", "Soto", "Núñez", "Morales", "Herrera",
  "Campos", "Ramos", "Fuentes", "Bustos", "Ruiz", "Ríos", "Molina", "Álvarez", "Sandoval", "Navarro",
  "Parra", "Mendoza", "Olivares", "Vera", "Ortiz", "Escobar", "Vidal", "Garrido", "Farías", "Peña",
  "Leiva", "Paredes", "Cabrera", "Robles", "Lagos", "Moya", "Vera", "Pinto", "Riveros", "Guerra",
  "Barrios", "Aguilar", "Carvajal", "Saavedra", "Muñoz"
];

const students = [];
let rutBase = 10000000;

// Generar estudiantes para cada sección
const sections = [
  { curso: "1ro Básico", seccion: "A" },
  { curso: "1ro Básico", seccion: "B" },
  { curso: "2do Básico", seccion: "A" },
  { curso: "2do Básico", seccion: "B" }
];

sections.forEach(section => {
  for (let i = 0; i < 45; i++) {
    const nombre = nombres[i % nombres.length];
    const apellido1 = apellidos1[i % apellidos1.length];
    const apellido2 = apellidos2[i % apellidos2.length];
    const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    const rutStr = rutBase.toString();
    for (let j = rutStr.length - 1; j >= 0; j--) {
      suma += parseInt(rutStr[j]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dv = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();
    const rut = `${rutBase}-${dv}`;
    
    const email = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}${rutBase}@student.cl`
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const username = `${nombre[0].toLowerCase()}.${apellido1.toLowerCase()}${rutBase.toString().slice(-4)}`
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    students.push({
      role: 'student',
      name: nombreCompleto,
      rut,
      email,
      username,
      password: 'temporal123',
      course: section.curso,
      section: section.seccion,
      subjects: ''
    });
    
    rutBase++;
  }
});

// Generar CSV
const header = 'role,name,rut,email,username,password,course,section,subjects';
const rows = students.map(s => 
  `${s.role},${s.name},${s.rut},${s.email},${s.username},${s.password},${s.course},${s.section},${s.subjects}`
);

fs.writeFileSync('users-consolidated-2025-CORREGIDO.csv', [header, ...rows].join('\n'), 'utf8');
console.log(`✅ Archivo de usuarios generado con ${students.length} estudiantes`);
console.log(`   - 1° Básico A: 45 estudiantes`);
console.log(`   - 1° Básico B: 45 estudiantes`);
console.log(`   - 2° Básico A: 45 estudiantes`);
console.log(`   - 2° Básico B: 45 estudiantes`);
