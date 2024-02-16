# Innanet Demo: Gestión de Producción
Innanet es una solución web avanzada diseñada para optimizar la gestión de producción en empresa manufacturera de muebles a pedido.

## Propósito y Funcionalidad

El objetivo de Innanet es proporcionar una herramienta integral que facilite la gestión de todos los aspectos de la producción de muebles a pedido, desde la entrada del pedido hasta la entrega del producto final. Las características clave incluyen:

- **Gestión de Clientes y Pedidos**: Facilita la entrada y seguimiento de clientes y sus pedidos.
- **Cotizaciones y Presupuestos**: Permite la creación y aprobación de presupuestos de manera eficiente.
- **Planificación de la Producción**: Optimiza la asignación de recursos y la planificación de la producción.
- **Seguimiento de la Producción**: Monitorea el estado de la producción.
- **Reportes y Análisis**: Genera informes detallados para la toma de decisiones basada en datos.

## Flujo del Programa

El programa se organiza en varias secciones clave, cada una diseñada para facilitar diferentes aspectos de la gestión de producción y pedidos. A continuación, se detalla el flujo mejorado:

### 1. Sección 'Clientes':
- **Ingresar cliente**: Registro de nuevos clientes en el sistema.
- **Ingresar pedido**: Creación de pedidos asociados a los clientes registrados.

### 2. Sección 'Pedidos':
- **Seleccionar pedido**: Elección de un pedido específico para su gestión.
- **Cotizar**: Generación de una cotización detallada para el pedido seleccionado.
- **Enviar presupuesto a revisión / Aprobar presupuesto**: Revisión y aprobación del presupuesto generado.
- **Enviar presupuesto PDF a cliente**: Envío del presupuesto aprobado al cliente en formato PDF.
- **Confirmar pedido**: Confirmación del pedido por parte del cliente.
- **Enviar a producción**: Inicio del proceso de producción del pedido confirmado.
- **Asignar mano de obra que se encargará de fabricar el pedido**: Asignación de tareas específicas a los trabajadores, utilizando una interfaz que permite seleccionar el personal adecuado para cada tarea del pedido.

### 3. Sección 'Producción':
- **Descargar OT (Orden de Trabajo)**: Descarga de la OT al hacer clic en el estado del trabajo (Pendiente), iniciando oficialmente la tarea asignada.
- **Marcar el trabajo como terminado**: Actualización del estado del trabajo una vez completado.
- **Cerrar el pedido**: Finalización del pedido cuando todos los trabajos asociados están terminados.

### 4. Sección 'Trabajos':
- **Marcar como pagados los trabajos terminados**: Registro de los pagos a los trabajadores por los trabajos completados.

### Otras opciones:
- **Sección 'Base de datos'**: Acceso y gestión de toda la información relacionada con los pedidos, incluyendo opciones de edición y cambio de estado.
- **Sección 'Reportes'**: Generación de informes sobre el programa, incluyendo logs de usuario, informes de ventas y rentabilidad, información sobre abonos, y la capacidad de descargar datos para análisis en Excel.

## Tecnologías y Habilidades

- **Django**: Uso avanzado del framework para crear una aplicación web robusta y escalable.
- **Python**: Aplicación de buenas prácticas de programación y patrones de diseño.
- **Gestión de Bases de Datos**: Diseño e implementación de modelos de datos eficientes para el manejo de la producción y los pedidos.
- **Desarrollo Frontend**: Integración de interfaces de usuario intuitivas utilizando HTML, CSS y JavaScript.
- **Seguridad Web**: Implementación de medidas de seguridad para proteger la información y las transacciones.
- **Automatización y Mejora de Procesos**: Automatización de tareas repetitivas y mejora de los flujos de trabajo de producción.

### Link demo: https://innanet.fdev.cl
   - **Usuario: visitante**
   - **Pass: usuario1**
     
## Capturas de pantalla
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Home.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Home-modal.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Presupuesto.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Produccion.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Produccion-modal.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Trabajos.png?raw=true" width="200" height="100"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Informe%20Resumen.png?raw=true" width="200" height="100"></img>



