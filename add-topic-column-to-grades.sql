-- Agregar columna 'topic' a la tabla 'grades' para almacenar el tema de la actividad
-- Esta columna es OPCIONAL y almacena información descriptiva como:
-- "Comprensión lectora: Cuentos infantiles", "Números del 1 al 20", etc.

-- Agregar la columna si no existe
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS topic text;

-- Agregar comentario explicativo
COMMENT ON COLUMN public.grades.topic IS 'Tema o descripción pedagógica de la actividad evaluada (campo opcional)';

-- Crear índice para búsquedas rápidas por tema (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_grades_topic ON public.grades (topic) WHERE topic IS NOT NULL;

-- Notificar a PostgREST para recargar el esquema
SELECT pg_notify('pgrst', 'reload schema');

-- Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'grades' 
ORDER BY ordinal_position;
