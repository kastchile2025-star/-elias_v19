
VM1533:27     courseId: f3951885-93e2-46b4-b176-af8a7737bfec
VM1533:28     name: B
VM1533:29     courseName: N/A
VM1533:26   • id: e877100b-5880-431a-a02f-630b95de8d7a
VM1533:27     courseId: f1405f84-4d6f-45d7-9ad0-ed8be626cd03
VM1533:28     name: A
VM1533:29     courseName: N/A
VM1533:33 
📥 PASO 2: Calificaciones en Firebase
Promise {<pending>}
VM1533:36 
Cursos en Firebase (2):
VM1533:38   • Course Document ID: 1ro_bsico
VM1533:38   • Course Document ID: 2do_bsico
VM1533:42 
📊 PASO 3: Inspección de calificaciones
VM1533:65 
Muestra de calificaciones:
VM1533:66 
(index)
firebaseCourseDoc
courseId
course
sectionId
section
studentName
0	'1ro_bsico'	'1ro_bsico'	undefined	'a'	undefined	'Sof�a Gonz�lez Gonz�lez'
1	'1ro_bsico'	'1ro_bsico'	undefined	'a'	undefined	'Mat�as Gonz�lez D�az'
2	'2do_bsico'	'2do_bsico'	undefined	'a'	undefined	'Sof�a Rojas Gonz�lez'
3	'2do_bsico'	'2do_bsico'	undefined	'a'	undefined	'Mat�as Rojas D�az'
Array(4)
VM1533:69 
🔗 PASO 4: Intentando hacer match
VM1533:94 
Mapa de courseName + section → sectionId:
VM1533:95 Primeras 5 entradas:
VM1533:101 
✅ PASO 5: Probando matches
VM1533:109 
📝 Sof�a Gonz�lez Gonz�lez
VM1533:110    Firebase: courseId="1ro_bsico", course="undefined", section="undefined"
VM1533:111    Key buscada: "|"
VM1533:112    Match: ❌ NO ENCONTRADO
VM1533:109 
📝 Mat�as Gonz�lez D�az
VM1533:110    Firebase: courseId="1ro_bsico", course="undefined", section="undefined"
VM1533:111    Key buscada: "|"
VM1533:112    Match: ❌ NO ENCONTRADO
VM1533:109 
📝 Sof�a Rojas Gonz�lez
VM1533:110    Firebase: courseId="2do_bsico", course="undefined", section="undefined"
VM1533:111    Key buscada: "|"
VM1533:112    Match: ❌ NO ENCONTRADO
VM1533:109 
📝 Mat�as Rojas D�az
VM1533:110    Firebase: courseId="2do_bsico", course="undefined", section="undefined"
VM1533:111    Key buscada: "|"
VM1533:112    Match: ❌ NO ENCONTRADO
VM1533:118 
✅ DIAGNÓSTICO COMPLETO
auto-repair.js:68 ✅ No se encontraron notificaciones fantasma
﻿

