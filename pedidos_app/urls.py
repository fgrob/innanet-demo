from django.urls import path
from . import views

urlpatterns = [

    path('', views.pedidos),
    path('clientes/<str:accion>', views.clientes),
    path('clientes/<int:cliente_id>/listapedidos', views.pedidos_cliente),
    path('clientes/<int:cliente_id>/nuevopedido', views.nuevo_pedido),
    path('ingresarpedido', views.ingresar_pedido),
    path('pedido/<int:pedido_id>/editardatos', views.editar_datos_pedido),
    
    path('pedidos', views.pedidos),
    path('pedido/<int:number>/presupuesto', views.crear_presupuesto),
    path('pedido/<int:pedido_id>/base', views.presup_base),
    path('pedido/<int:pedido_id>/ref', views.presup_ref),
    path('seleccionarpresupuesto', views.otra_id_ref),
    path('pedido/<int:pedido_id>/ref/copiar', views.copiar_presupuesto),
    path('pedido/<int:pedido_id>/notaspresup', views.agregar_notas_presupuesto),
    path('oficio/<int:oficio_id>', views.costo_mod),
    path('pedido/<int:pedido_id>/creartrabajo', views.guardar_trabajo),
    path('trabajo/<int:trabajo_id>/editar', views.editar_trabajo),
    path('trabajo/<int:trabajo_id>/guardaredicion', views.guardar_edicion_trabajo),
    path('trabajo/<int:trabajo_id>/eliminar', views.eliminar_trabajo),
    path('catmateriales/<int:categoria_id>', views.materiales_categoria),
    path('material/<int:material_id>', views.material),
    path('pedido/<int:pedido_id>/agregarmaterial', views.agregar_material),
    path('material/<int:material_id>/editar', views.editar_material),
    path('material/<int:material_id>/guardaredicion', views.guardar_edicion_material),
    path('material/<int:material_id>/eliminar', views.eliminar_material),
    path('pedido/<int:pedido_id>/agregarcostos', views.agregar_costos),
    path('pedido/<int:pedido_id>/editarcostos', views.editar_costos),
    path('pedido/<int:pedido_id>/buscarmargen', views.buscar_margen),
    path('pedido/<int:pedido_id>/cantidad', views.agregar_cantidad),
    path('pedido/<int:pedido_id>/cerrarpresupuesto', views.cerrar_presupuesto),
    path('pedido/<int:pedido_id>/aprobarpresupuesto', views.aprobar_presupuesto),

    path('clientes/<int:cliente_id>/pdf/<str:accion>', views.selector_pedidos_pdf),
    path('pedido/<int:pedido_id>/pdf', views.pdf_unitario),
    path('pdf', views.pdf_final),
    path('pedido/<int:pedido_id>/pdf/cuentabancaria', views.cuenta_bancaria),

    path('ordentrabajo/<int:trabajo_id>', views.ot_preview),
    path('ordentrabajo', views.ot_final),

    path('confirmar/<int:pedido_id>', views.confirmar_pedido),
    path('pedido/<int:pedido_id>/anular', views.anular_pedido),
    path('asignacion/<int:pedido_id>', views.asignacion_maestros),
    path('asignar/<int:pedido_id>', views.asignar_maestros),

    path('produccion', views.produccion),    
    path('produccion/<int:trabajo_id>/info', views.info_trabajo),
    path('trabajo/<int:trabajo_id>/actualizarstatus', views.actualizar_status_trabajo),
    path('produccion/<int:pedido_id>/cerrarpedido', views.cerrar_pedido),

    path('database', views.database),
    path('database/<int:pedido_id>/info', views.db_modal),
    path('pedido/<int:pedido_id>', views.pedido),   
    path('pedido/<int:pedido_id>/status/<int:accion>', views.editar_status), #editar y guardar edición

    path('materiales/lista', views.lista_materiales),
    path('categoria/ingresar', views.ingresar_categoria),
    path('materiales/<str:accion>', views.guardar_material),
    path('maestros/lista', views.lista_maestros),
    path('maestros/ingresar', views.ingresar_maestro),
    path('maestros/lista/modificar', views.modificar_costo_diario),

    path('trabajos', views.trabajos),
    path('trabajos/statuspago', views.status_pago),

    path('tablesdata', views.tables_data), #informacion ajax para poblar las datatables
    path('reportes/historial', views.historial),
    path('reportes/informeresumen', views.informe_resumen),
    path('reportes/excel', views.excel_ddbb),
    path('reportes/abonos', views.abonos_mensuales),
    path('reportes/abonos/revisar', views.revision_abonos)

    # path('importardatos/<str:accion>', views.importar_datos),
]

