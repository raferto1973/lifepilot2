# Life Pilot 🧭

**Life Pilot** es una aplicación web progresiva (PWA) diseñada para el seguimiento integral de la salud, recuperación física, alimentación y hábitos diarios. Creada para ofrecer un control total sobre rutinas médicas (especialmente enfocado a la recuperación lumbar y control de tensión arterial), la app permite registrar el progreso diario mediante una interfaz moderna, *responsive* e instalable en cualquier dispositivo.

## 🌟 Características Principales

* **Seguimiento Físico y Médico:** Registro diario de Peso, Tensión Arterial (Sistólica y Diastólica), Pulso, Horas de Sueño, Vasos de Agua, Nivel de Dolor y Medicación.
* **Rutina de Ejercicios y Estiramientos:** Control de rutinas de rehabilitación con *checkboxes* interactivos. Los ejercicios están preprogramados por semanas y fases de intensidad creciente.
* **Plan de Alimentación Dinámico:** Tabla de dieta semanal personalizable.
* **Cuidado Personal:** Checklist diario para hábitos de higiene y cuidado, completamente personalizable por el usuario.
* **Diario de Notas:** Espacio para apuntar observaciones médicas o sensaciones diarias.
* **Panel de Estadísticas y Gráficas:** Visualización de la evolución mediante gráficas generadas con *Chart.js*, incluyendo:
  * Evolución de Peso y Dolor.
  * Tensión Arterial.
  * Hábitos (Sueño y Agua).
  * Porcentaje de Cumplimiento global en Ejercicio y Cuidado Personal (Doughnut charts).
* **Configuración Personalizada:** Panel de Ajustes (⚙️) integrado mediante modales propios, que permite al usuario añadir, editar o eliminar elementos de la dieta, la tabla de estiramientos y la lista de cuidado personal.
* **Sincronización en la Nube:** Integración oficial con la API de **Dropbox** para guardar y recuperar todo el progreso y configuración a través de diferentes dispositivos.
* **Aplicación Instalable (PWA):** Life Pilot funciona offline y se puede instalar como aplicación nativa en iOS, Android y Windows gracias a su *Service Worker* integrado.

## 🛠️ Tecnologías Utilizadas

* **HTML5, CSS3, JavaScript (Vanilla):** Sin frameworks pesados para garantizar una carga ultrarrápida.
* **Chart.js:** Para el renderizado de gráficos y estadísticas.
* **Tabler Icons:** Iconografía limpia y moderna.
* **Dropbox SDK:** Sincronización y backup de datos.
* **Vercel:** Plataforma de despliegue continuo (CI/CD) conectada automáticamente al repositorio de GitHub.

## 🚀 Despliegue y Sincronización Automática

El proyecto está configurado para **despliegue continuo (CD) mediante Vercel**. Cualquier *commit* y *push* dirigido a la rama `master` en GitHub desencadenará de forma automática una nueva compilación y publicación del sitio web en segundos.

## 💾 Estructura de Datos (Local Storage)

La aplicación prima la privacidad y rapidez, guardando todos los datos en el navegador del usuario utilizando `localStorage`. La estructura de guardado incluye:
* `lumbar-plan-state`: Estado de los ejercicios de la fase actual.
* `diet-state`, `stretch-state`: Progreso diario.
* `health-log`: Registro histórico de constantes vitales.
* `care-log`: Registro histórico de cuidados personales.
* `notes-log`: Histórico del diario.
* `cfg-diet`, `cfg-stretches`, `cfg-care`: Configuración dinámica personalizada por el usuario.

Todos estos datos se empaquetan en un archivo `JSON` único al sincronizar con Dropbox.

## 📱 Instalación (PWA)

Al acceder a la URL de producción desde un dispositivo móvil (Safari/Chrome), el usuario verá un botón de **Instalar App** que permite añadir Life Pilot a la pantalla de inicio, operando a pantalla completa como una app nativa.

---
*Desarrollado para la mejora continua del bienestar personal.*
