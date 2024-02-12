from django.shortcuts import HttpResponse, render
from pedidos_app.models import *
from django.http import JsonResponse

# import pandas as pd
# from pedidos_app.models import *
# import dateutil.parser

# def rellenar_costos_bd(request):
#     from .views_presupuestos import presupuesto_totales    
#     presupuestos = Presupuesto.objects.all()
#     for presupuesto in presupuestos:
#         presupuesto_totales(presupuesto.id)
#         print(presupuesto.id)

#     return HttpResponse('Datos actualizados')

# def rellenar_trabajos_bd(request):
#     trabajos = Trabajo.objects.filter(id__gt=4000, id__lte = 6000)
#     for trabajo in trabajos:
#         trabajo.total_simp = int(trabajo.dias_trabajo * trabajo.costo_trabajo)
#         trabajo.total_trabajo = int(trabajo.dias_trabajo * (trabajo.costo_trabajo + trabajo.imposiciones))
#         trabajo.total_pago = trabajo.total_simp * trabajo.presupuesto_asociado.pedido.cantidad
#         trabajo.save()
#         print(trabajo.id)
    
    # dic = {}

    # return HttpResponse('Datos de trabajos actualizados')
    # return JsonResponse(dic, safe=False)


# def test(request):
#     return render(request, 'testing/test.html')

# def importar_datos(request, accion):

#     if accion == "render":

#         return render(request, 'importar.html')
#     else:

#         lista_nulos = []

#         xlsx = pd.ExcelFile(r'C:\Users\F\Desktop\Programación\Wo    rkspace\Proyectos\innanet\datos.xlsx')
#         # xlsx = pd.ExcelFile(r'/home/ubuntu/innanet/datos.xlsx')
#         df1 = pd.read_excel(xlsx, 'CATEGORIAMATERIALES')
#         df2 = pd.read_excel(xlsx, 'MATERIALES')
#         df3 = pd.read_excel(xlsx, 'CLIENTES')
#         df4 = pd.read_excel(xlsx, 'MAESTROS')
#         df5 = pd.read_excel(xlsx, 'COSTOSMOD')
#         df6 = pd.read_excel(xlsx, 'PEDIDOS')
#         df7 = pd.read_excel(xlsx, 'TRABAJOS')
#         df8 = pd.read_excel(xlsx, 'PRESUPUESTOS')
#         df9 = pd.read_excel(xlsx, 'MAT_PED')
        
        
#         #creamos las categorias
#         for cat in df1['CATEGORIA'].values:
#             CategoriaMateriales.objects.create(categoria = cat)
#             print('categoria: ', cat)
#         print('categorias importadas con exito')

#         #creamos los materiales, añadiendoles el objeto categoria correspondiente
#         for lista in df2.values:
#             ListaMateriales.objects.create(
#                 categoria = CategoriaMateriales.objects.get(id=lista[1]),
#                 material = lista[2],
#                 unidad_medida = lista[3],
#                 costo_neto = lista[4]
#                 )
#             print('material:', lista[2])
#         print('materiales importados con exito')
        
#         #creamos los clientes
#         for cliente in df3.values:
#             if pd.isnull(cliente[4]):
#                 email_cliente = None
#             else:
#                 email_cliente = cliente[4]
#             if pd.isnull(cliente[5]):
#                 celular = None
#             else:
#                 celular = cliente[5]
#             Cliente.objects.create(
#                 nombre = cliente[2],
#                 apellido = cliente[3],
#                 email = email_cliente,
#                 celular = celular
#             )
#             print('cliente:', cliente[2], ' ', cliente[3])
#         print('clientes importados con exito')

#         #creamos los maestros
#         for maestro in df4.values:
#             Maestro.objects.create(
#                 nombre = maestro[1],
#                 apellido = maestro[2]
#             )
#             print('maestro:', maestro[1], ' ', maestro[2])
#         print('maestros importados con exito')

#         #creamos los oficios y sus costos diarios
#         for costomod in df5.values:
#             CostoMOD.objects.create(
#                 oficio = costomod[1],
#                 total_diario = costomod[2]
#             )
#             print('Costos Mano de Obra:', costomod[1])
#         print('costos MOD importados con exito')

#         #creamos las imposiciones:
#         Imposiciones.objects.create(total=4000)
#         print('imposiciones importadas con exito')

#         #crear pedido:
#         for pedido in df6.values:
#             # estamos pasando a formato datetimefield fechas tipo: '2008-04-10 11:47:58-05'
#             if pedido[16] != 'None':
#                 fecha_creacion = dateutil.parser.parse(str(pedido[16]))
#             else:
#                 fecha_creacion = None
#             if pedido[17] != 'None':
#                 fecha_pdf = dateutil.parser.parse(str(pedido[17]))
#             else:
#                 fecha_pdf = None
#             if pedido[18] != 'None':
#                 fecha_confirmacion = dateutil.parser.parse(str(pedido[18]))
#             else:
#                 fecha_confirmacion = None
#             if pedido[19] != 'None':
#                 fecha_ingreso_fabrica = dateutil.parser.parse(str(pedido[19]))
#             else:
#                 fecha_ingreso_fabrica = None
#             if pedido[20] != 'None':
#                 fecha_termino = dateutil.parser.parse(str(pedido[20]))
#             else:
#                 fecha_termino = None
            
#             if pd.isnull(pedido[6]):
#                 detalles_fabricacion = None
#             else:
#                 detalles_fabricacion = pedido[6]
            
#             if pd.isnull(pedido[7]):
#                 detalles_pintura = None
#             else:
#                 detalles_pintura = pedido[7]

#             if pd.isnull(pedido[2]):
#                 medidas = None
#             else:
#                 medidas = pedido[2]

#             if pd.isnull(pedido[3]):
#                 madera = None
#             else:
#                 madera = pedido[3]
            
#             if pd.isnull(pedido[4]):
#                 color = None
#             else:
#                 color = pedido[4]
            

#             Pedido.objects.create(
#                 producto = pedido[1],
#                 medidas = medidas,
#                 madera = madera,
#                 color = color,
#                 cantidad = pedido[5],
#                 detalles_fabricacion = detalles_fabricacion,
#                 detalles_pintura = detalles_pintura,
#                 cliente = Cliente.objects.get(id=pedido[9]),
#                 presupuesto=Presupuesto.objects.create(),
#                 fecha_creacion = fecha_creacion,
#                 fecha_pdf = fecha_pdf,
#                 fecha_confirmacion = fecha_confirmacion,
#                 fecha_ingreso_fabrica = fecha_ingreso_fabrica,
#                 fecha_termino = fecha_termino,
#                 status = pedido[22]
#             )
#             print('pedido ', pedido[1])
#             if pedido[1] == "nulo":
#                 lista_nulos.append(pedido[0])
#                 # pedido_obj = Pedido.objects.last()
#                 # pedido_obj.delete()
#                 # print('pedido nulo borrado')
#         print('pedidos importados con exito')

#         for trabajo in df7.values:
#             if trabajo[1] != 'None':
#                 fecha_asignacion = dateutil.parser.parse(str(trabajo[1]))
#             else:
#                 fecha_asignacion = None
            
#             if trabajo[19] != 'None':
#                 fecha_pago = dateutil.parser.parse(str(trabajo[19]))
#             else:
#                 fecha_pago = None

#             if trabajo[15] != 'None':
#                 fecha_termino_trabajo = dateutil.parser.parse(str(trabajo[15]))
#             else:
#                 fecha_termino_trabajo = None
            
#             if trabajo[6] == 'None':
#                 maestro_asociado = None
#             else:
#                 maestro_asociado = Maestro.objects.get(id=trabajo[6])
            
#             if pd.isnull(trabajo[12]):
#                 notas_trabajo = ''
#             else:
#                 notas_trabajo = trabajo[12]
            
#             Trabajo.objects.create(
#                 maestro_asociado = maestro_asociado,
#                 tipo_trabajo = CostoMOD.objects.get(id=trabajo[3]),
#                 presupuesto_asociado = Presupuesto.objects.get(id=trabajo[4]),
#                 status_trabajo = trabajo[13],
#                 status_pago = trabajo[17],
#                 fecha_pago = fecha_pago,
#                 costo_trabajo = trabajo[9],
#                 dias_trabajo = trabajo[10],
#                 imposiciones = trabajo[11],
#                 notas_trabajo = notas_trabajo,
#                 fecha_asignacion = fecha_asignacion,
#                 fecha_termino_trabajo = fecha_termino_trabajo,
#             )
#             print('trabajo de presupuesto id: ', trabajo[4])
#         print('trabajos importados con exito')

#         for presupuesto in df8.values:
#             presupuesto_obj = Presupuesto.objects.get(id=presupuesto[0])
#             if pd.notnull(presupuesto[2]):
#                 presupuesto_obj.porcentaje_gastos_generales = presupuesto[2]

#             if pd.notnull(presupuesto[3]):
#                 presupuesto_obj.otros_gastos = presupuesto[3]

#             presupuesto_obj.porcentaje_utilidad = presupuesto[5]

#             if pd.notnull(presupuesto[6]):
#                 presupuesto_obj.notas_presupuesto = presupuesto[6]
            
#             presupuesto_obj.save()
#             print('datos para presupuesto id ', presupuesto[0])
#         print('presupuestos importados con exito')

#         for material in df9.values:

#             Material.objects.create(
#                 cantidad = material[4],
#                 costo_material = material[5],
#                 material_asignado = ListaMateriales.objects.get(id=material[7]),
#                 presupuesto_asociado = Presupuesto.objects.get(id=material[0]),
#             )
#             print('material presupuesto id ', material[0]) 
#         print('materiales importados con exito')           

#         print('importacion finalizada correctamente')
#         print('---lista de pedidos nulos:')
#         print(lista_nulos)
#         for pedido_id in lista_nulos:
#             presupuesto = Presupuesto.objects.get(id=pedido_id) #por el modelo cascada, eliminar el presupuesto eliminara los trabajos, materiales y pedido asociado.
#             presupuesto.delete() 
#             print('pedido id', pedido_id, ' eliminado')
#         return HttpResponse('importacion completada')