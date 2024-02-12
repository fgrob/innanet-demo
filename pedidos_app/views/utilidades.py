from django.forms import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Model
from django.contrib import messages
from pedidos_app.models import *
from auditlog.models import LogEntry
from datetime import datetime, timedelta
from django.http import JsonResponse

class ExtendedEncoder(DjangoJSONEncoder):
#Codificador para transformar los modelos en diccionarios y poder enviarlos vía JSON
#La gracia de este código es que soporta todo tipo de datos, incluídas las fechas 
    def default(self, o):
        if isinstance(o, Model):
            return model_to_dict(o)

        return super().default(o)

def validaciones(request, status):
#validaciones para pedidos

    if status == '0':
        messages.error(request, 'El presupuesto no está listo')
    elif status == '1':
        messages.error(request, 'El presupuesto está en revisión')
    elif status == '2':
        messages.error(request, 'El presupuesto no está confirmado')
    elif status == '3':
        messages.warning(request, 'El presupuesto ya está confirmado')
    return

def mensajes_ajax(request):
#funcion para guardar los mensajes disponibles en un diccionario, para luego enviar vía ajax
    django_messages = []
    for message in messages.get_messages(request):
        django_messages.append({
            "level": message.level,
            "message": message.message,
            "extra_tags": message.tags,
    })
    return django_messages


def tables_data(request):
    # datos ajax para las datatables

    if request.POST['datos'] == 'clientes':
        # clientes para las tablas
        diccionario_clientes = {}
        clientes = Cliente.objects.all()
        for cliente in clientes:
            diccionario_clientes[cliente.id] = cliente.nombre + ' ' + cliente.apellido
        return JsonResponse(diccionario_clientes, encoder=ExtendedEncoder, safe=False)

    if request.POST['hoja'] == 'database':
        if request.POST['datos'] == 'base':
            # datos base para la tabla de la hoja database
            pedidos = list(Pedido.objects.all().values('id', 'cliente_id', 'producto','medidas', 'color', 'cantidad', 'fecha_creacion', 'fecha_termino', 'status', 'reserva_tienda'))
            return JsonResponse(pedidos, encoder=ExtendedEncoder, safe=False)

    elif request.POST['hoja'] == 'produccion':
        if request.POST['datos'] == 'base':
            #datos base para la tabla de la hoja produccion
            pedidos = list(Pedido.objects.filter(status=4).values())
            return JsonResponse(pedidos, encoder=ExtendedEncoder, safe=False)

        elif request.POST['datos'] == 'trabajos':
            #trabajos para la tabla de la hoja produccion
            # Busca todos los trabajos correspondientes a los pedidos con el status especificado, y crea un diccionario al estilo de diccionario = {id pedido: [id del trabajo, tipo, maestro, etc]} para cada trabajo en cada pedido   
            pedidos = Pedido.objects.filter(status=4)   
            trabajos = {}
            for pedido in pedidos:
                trabajos[pedido.id] = [(trabajo.id, str(trabajo.tipo_trabajo) ,str(trabajo.maestro_asociado), trabajo.status_trabajo, trabajo.fecha_asignacion) for trabajo in pedido.presupuesto.trabajos.all().order_by('id')]
            return JsonResponse(trabajos, safe=False)

    elif request.POST['hoja'] == 'trabajos':
        if request.POST['datos'] == 'base':
            trabajos = list(Trabajo.objects.filter(
            presupuesto_asociado__pedido__status__gte=4, presupuesto_asociado__pedido__status__lt=6).values('status_trabajo', 'id', 'maestro_asociado_id', 'fecha_asignacion', 'status_trabajo','costo_trabajo','total_simp', 'total_pago', 'dias_trabajo', 'fecha_termino_trabajo', 'status_pago', 'fecha_pago', 'presupuesto_asociado_id', 'presupuesto_asociado__pedido__cliente_id', 'presupuesto_asociado__pedido__producto', 'presupuesto_asociado__pedido__medidas', 'presupuesto_asociado__pedido__color', 'presupuesto_asociado__pedido__cantidad'))
            return JsonResponse(trabajos, encoder=ExtendedEncoder, safe=False)

        elif request.POST['datos'] == 'maestros':
            diccionario_maestros = {}
            maestros = Maestro.objects.all()
            for maestro in maestros:
                diccionario_maestros[maestro.id] = maestro.nombre + ' ' + maestro.apellido
            return JsonResponse(diccionario_maestros, encoder=ExtendedEncoder, safe=False)

    elif request.POST['hoja'] == 'clientes':
        if request.POST['datos'] == 'base':
            clientes = list(Cliente.objects.all().values())
            return JsonResponse(clientes, encoder=ExtendedEncoder, safe=False)
    
    elif request.POST['hoja'] == 'pedidos':
        if request.POST['datos'] == 'base':
            pedidos = list(Pedido.objects.filter(status__in=[0, 1, 2, 3]).values())
            return JsonResponse(pedidos, encoder=ExtendedEncoder, safe=False)
    
    elif request.POST['hoja'] == 'materiales':
        if request.POST['datos'] == 'base':
            materiales = list(ListaMateriales.objects.all().values())
            return JsonResponse(materiales, encoder=ExtendedEncoder, safe=False)
        
        elif request.POST['datos'] == 'categorias':
            diccionario_categorias = {}
            categorias =  CategoriaMateriales.objects.all()
            for categoria in categorias:
                diccionario_categorias[categoria.id] = categoria.categoria
            return JsonResponse(diccionario_categorias, encoder=ExtendedEncoder, safe=False)

    elif request.POST['hoja'] == 'historial':
        if request.POST['datos'] == 'base':
            last_month = datetime.today() - timedelta(days=30)
            logs = list(LogEntry.objects.filter(timestamp__gte=last_month).values())
            return JsonResponse(logs, encoder=ExtendedEncoder, safe=False)

    elif request.POST['hoja'] == 'excelddbb':
        if request.POST['datos'] == 'base':
            # pedidos = list(Pedido.objects.all().values('fecha_confirmacion', 'id', 'producto', 'cliente_id', 'presupuesto_id', 'fecha_cierre', 'presupuesto__rentabilidad', 'presupuesto__subtotal'))
            pedidos = list(Pedido.objects.all().values('id', 'producto', 'medidas', 'color', 'cliente_id','reserva_tienda', 'status', 'fecha_creacion', 'fecha_pdf', 'fecha_confirmacion', 'fecha_ingreso_fabrica', 'fecha_termino', 'fecha_cierre', 'cantidad', 'presupuesto__total_costos', 'presupuesto__porcentaje_utilidad', 'presupuesto__subtotal', 'presupuesto__rentabilidad',))
            return JsonResponse(pedidos, encoder=ExtendedEncoder, safe=False)



            
            

