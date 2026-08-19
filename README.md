# Life Pilot

Life Pilot es una aplicación web progresiva (PWA) para seguir un plan personal de recuperación L5-S1/S1, actividad física, alimentación, constantes de salud y hábitos diarios. Funciona en navegador, se puede instalar y conserva los datos en el dispositivo mediante `localStorage`.

> El contenido sanitario de la aplicación es orientativo y no sustituye una exploración ni una indicación profesional. La debilidad progresiva, alteraciones de esfínteres, anestesia perineal o síntomas importantes en ambas piernas requieren atención urgente.

## Plan L5-S1/S1

El calendario activo abarca del 19 de agosto al 31 de diciembre de 2026. Las fechas orientan la organización, pero la progresión depende del semáforo neurológico y de la respuesta durante las 24 horas siguientes.

| Fase | Fechas | Objetivo |
| --- | --- | --- |
| 1. Proteger S1 y valorar | 19–28 agosto | Actividad tolerada, fuerza base y exploración presencial de S1 |
| 2. Preparar marcha y viaje | 29 agosto–19 septiembre | Aumentar marcha, fuerza y tolerancia funcional |
| 3. Vietnam | 20 septiembre–7 octubre | Turismo como actividad principal, control de carga y rutina corta |
| 4. Fuerza y resistencia | 8–31 octubre | Recuperar fuerza, piscina y bicicleta progresivamente |
| 5. Retorno al deporte | 1–30 noviembre | Introducir run/walk y peloteo si se cumplen los criterios |
| 6. Normalización | 1–31 diciembre | Consolidar fuerza, running, bicicleta, piscina y tenis |

### Semáforo de progresión

- **Verde:** dolor 0–2/10, pie igual o mejor y recuperación completa al día siguiente.
- **Amarillo:** más hormigueo o rigidez residual; reducir el volumen un 25–50 % durante 2–3 días.
- **Rojo:** adormecimiento constante, irradiación nueva o debilidad; detener la progresión y consultar.

Los estiramientos y la movilidad se incorporan directamente al checklist de cada día según la sesión. El plan evita estiramiento neural, flexión lumbar profunda y cualquier movimiento que lleve los síntomas más lejos hacia el pie.

### Viaje a Vietnam

Entre el 20 de septiembre y el 7 de octubre el calendario cambia automáticamente al modo viaje:

- El turismo y la marcha sustituyen al entrenamiento habitual.
- La rutina de mantenimiento aparece tres días por semana.
- No hay un objetivo obligatorio de pasos.
- Se recomiendan pausas, alternar jornadas exigentes y suaves, usar mochila ligera y maleta con ruedas.
- En desplazamientos largos se recuerda cambiar de postura y levantarse cada 45–60 minutos cuando sea posible.

### TESMED MAX 7.8 Power

El equipo figura como **pendiente de autorización médica** y no genera sesiones en el calendario. El manual del fabricante contraindica su uso cuando existen alteraciones de nervios periféricos; actualmente se vigilan parestesias compatibles con S1. También recoge contraindicaciones como hipertensión arterial grave, marcapasos/desfibrilador, arritmias o cardiopatía grave, epilepsia y embarazo.

La guía NICE NG59 no recomienda TENS para dolor lumbar con o sin ciática. La aplicación enlaza el manual oficial y muestra las principales normas de seguridad, pero no propone programas ni colocación de electrodos.

Fuentes: [manual oficial TESMED MAX 7.8](https://cdn.shopify.com/s/files/1/0513/3680/6597/files/MANUALE_MAX_7.8_-_08_2021.pdf?v=1638375283), [ficha oficial del equipo](https://tesmed.com/products/tesmed-7-8-power) y [NICE NG59](https://www.nice.org.uk/guidance/ng59/chapter/Recommendations).

## Menú familiar de 15 días

La alimentación usa un ciclo de 15 días con una sola receta compartida y raciones diferentes. De lunes a viernes la comida es para el usuario y su hijo deportista de 21 años, y la cena para el usuario y su pareja de 50 años. Los fines de semana, comida y cena son para la pareja.

- El déficit energético se aplica sólo al usuario.
- El hijo mantiene una ración completa de proteína y más hidratos según entrenamiento y hambre.
- La pareja utiliza una ración de mantenimiento, sin copiar la reducción del usuario.
- Cada comida muestra con quién se comparte y el editor permite modificar tanto el plato como ese contexto.
- El ciclo prioriza alimentos frescos, verduras, legumbres, cereales integrales, pescado, huevos y carnes magras, con control de sodio por la hipertensión.

## Funciones

- Checklist diario de ejercicio, movilidad, estiramientos y revisión S1 a 24 horas.
- Registro de peso, tensión arterial, pulso, sueño, agua, dolor, medicación y cumplimiento diario del menú/dieta.
- Seguimiento de parestesia S1, adormecimiento, debilidad y semáforo diario.
- Gráficas de peso, dolor, parestesia, tensión, sueño, agua, adherencia a la dieta y cumplimiento.
- Menú familiar de 15 días, raciones adaptadas y checklist de alimentación.
- Cuidado personal y diario de notas.
- Configuración de dieta, movilidad y cuidados.
- Sincronización del progreso mediante Dropbox.
- Instalación PWA y funcionamiento offline.

## Ejecutar en local

Requiere Python 3 disponible en el `PATH`.

```powershell
cd "C:\Users\rafer\OneDrive\Escritorio\LIFEPILOT2"
python -m http.server 8000
```

Abrir [http://localhost:8000](http://localhost:8000) y mantener PowerShell abierto. Para detener el servidor, pulsar `Ctrl+C`.

No se recomienda abrir `index.html` directamente porque el service worker y algunas funciones de la PWA necesitan un servidor HTTP.

## Tecnología y estructura

- HTML5, CSS3 y JavaScript sin framework.
- Chart.js para las gráficas.
- Tabler Icons para iconografía.
- Dropbox SDK para sincronización.
- Service worker y manifiesto para la PWA.

Archivos principales:

- `index.html`: interfaz y contenido informativo.
- `app.js`: calendario, estado, seguimiento, gráficas y Dropbox.
- `style.css`: presentación responsive y modo oscuro.
- `sw.js`: caché y funcionamiento offline.
- `manifest.json`: metadatos de instalación.
- `plan_recuperacion_ejercicio_dieta_4.html`: versión histórica independiente; la aplicación activa parte de `index.html`.

## Datos locales y privacidad

Los datos se guardan en el navegador. Las claves principales son:

- `lumbar-plan-state`: marcas del calendario de ejercicio.
- `diet-state` y `stretch-state`: progreso de alimentación y movilidad.
- `health-log`: constantes y seguimiento neurológico.
- `care-log`: cuidado personal.
- `notes-log`: diario.
- `cfg-diet`, `cfg-stretches` y `cfg-care`: configuración personalizada local.

Dropbox sincroniza las claves de progreso configuradas en `DATA_KEYS`. No se debe incluir información clínica sensible si la cuenta o el dispositivo no están adecuadamente protegidos.

## Despliegue

El repositorio está conectado a Vercel. Un push a `master` inicia el despliegue continuo configurado para el proyecto.
