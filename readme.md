# Innanet Demo

Este repositorio contiene el código fuente de Innanet, una aplicación web desarrollada con Django para gestionar la producción en una empresa manufacturera de muebles a pedido.

Link demo: http://44.220.148.179/
Usuario: visitante
Pass: usuario1

## Configuración

Crear archivo .env en carpeta raíz del proyecto y editar datos según corresponda:

```plaintext
DJANGO_ENV=local
SECRET_KEY=****
DEBUG=True
ALLOWED_HOSTS=127.0.0.1, localhost
DB_NAME=****
DB_USER=****
DB_PASSWORD=****
DB_HOST=127.0.0.1
```

## Uso

El flujo del programa se organiza en las siguientes secciones:

### 1. Sección 'Clientes':
   - **Ingresar cliente**
   - **Ingresar pedido**

### 2. Sección 'Pedidos':
   - **Seleccionar pedido**
   - **Cotizar**
   - **Enviar presupuesto a revisión / Aprobar presupuesto**
   - **Enviar presupuesto PDF a cliente**
   - **Confirmar pedido**
   - **Enviar a producción**
   - **Asignar mano de obra que se encargará de fabricar el pedido**

### 3. Sección 'Producción':
   - **Descargar OT (Orden de trabajo) haciendo clic en el status del trabajo (Pendiente)**
   - **Marcar el trabajo como terminado**
   - **Cerrar el pedido si todos los trabajos del pedido están terminados**

### 4. Sección 'Trabajos':
   - **Marcar como pagados los trabajos terminados**

### Otras opciones:

#### Sección 'Base de datos'
   - **Toda la información relacionada a un pedido.**
   - **Opciones de edición y cambio de status**

#### Sección 'Reportes'
   - **Logs del programa por usuario**
   - **Informe de ventas y rentabilidad**
   - **Información sobre abonos**
   - **Descarga de datos para Excel**



## Capturas de pantalla
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Home.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Home-modal.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Presupuesto.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Produccion.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Produccion-modal.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Trabajos.png?raw=true" width="400" height="300"></img>
<img src="https://github.com/fgrob/innanet-demo/blob/main/Screenshots/Informe%20Resumen.png?raw=true" width="400" height="300"></img>



