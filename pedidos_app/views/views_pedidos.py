# from time import time
from django.shortcuts import render, redirect
from pedidos_app.models import *
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from .views_presupuestos import presupuesto_totales
from .utilidades import ExtendedEncoder, validaciones, mensajes_ajax
# from django.contrib.auth.decorators import login_required


def clientes(request, accion):
    if accion == 'lista':
        # ver lista de clientes
        return render(request, 'secciones/clientes.html')

    elif accion == 'crear':
        if Cliente.objects.filter(email=request.POST['email']).exists():
            messages.error(request, "Error. Ese email ya está registrado")
            return redirect('/clientes/lista')
        Cliente.objects.create(
            nombre=request.POST['nombre'],
            apellido=request.POST['apellido'],
            email=request.POST['email'],
            celular=request.POST['celular']
        )
        messages.success(request, "Cliente creado exitosamente")
        return redirect('/clientes/lista')

    elif accion == 'editar':
        # guardar edición de cliente
        cliente_id = request.POST['pkModal']
        cliente = Cliente.objects.get(id=cliente_id)
        cliente.nombre = request.POST['nombreModal']
        cliente.apellido = request.POST['apellidoModal']
        cliente.email = request.POST['emailModal']
        cliente.celular = request.POST['celularModal']
        cliente.save()

        messages.success(request, "Cliente modificado exitosamente")
        return redirect('/clientes/lista')


def pedidos_cliente(request, cliente_id):
    # lista de pedidos x clientes
    cliente = Cliente.objects.get(id=cliente_id)
    pedidos = cliente.pedidos.all().order_by('-id')
    context = {
        'pedidos': list(pedidos.values()),
        'cliente': cliente.nombre + " " + cliente.apellido
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def nuevo_pedido(request, cliente_id):
    # crear nuevo pedido (sección cliente)
    cliente = Cliente.objects.get(id=cliente_id)
    context = {
        'cliente': cliente,
        'accion': 'ingresar',
        'pedidos': cliente.pedidos.order_by('-id')[:4]
    }
    return render(request, 'acciones/ingresar_pedido.html', context)


def editar_datos_pedido(request, pedido_id):
    # renderiza los datos de ingreso del pedido en la sección ingreso de pedido
    pedido = Pedido.objects.get(id=pedido_id)
    context = {
        'pedido': pedido,
        'cliente': pedido.cliente,
        'accion': 'editar',
        'pedidos': pedido.cliente.pedidos.order_by('-id')[:4]
    }
    return render(request, 'acciones/ingresar_pedido.html', context)


def ingresar_pedido(request):
    # guarda los datos en la sección ingreso de pedido
    try:
        reserva_tienda = request.POST['reserva']
    except:
        reserva_tienda = 0

    if request.POST['accion'] == 'ingresar':
        Pedido.objects.create(
            producto=request.POST['producto'],
            medidas=request.POST['medidas'],
            madera=request.POST['madera'],
            color=request.POST['color'],
            cantidad=request.POST['cantidad'],
            detalles_fabricacion=request.POST['detalles_fabricacion'],
            detalles_pintura=request.POST['detalles_pintura'],
            cliente=Cliente.objects.get(id=request.POST['pk']),
            presupuesto=Presupuesto.objects.create(),
            fecha_creacion=timezone.now(),
            reserva_tienda = reserva_tienda
        )
        messages.success(request, 'Pedido ingresado exitosamente')
        return redirect('/pedidos')
    elif request.POST['accion'] == 'editar':
        pedido = Pedido.objects.get(id=request.POST['idpedido'])
        pedido.producto = request.POST['producto']
        pedido.medidas = request.POST['medidas']
        pedido.madera = request.POST['madera']
        pedido.color = request.POST['color']
        pedido.cantidad = request.POST['cantidad']
        pedido.detalles_fabricacion = request.POST['detalles_fabricacion']
        pedido.detalles_pintura = request.POST['detalles_pintura']
        pedido.reserva_tienda = reserva_tienda
        pedido.save()

        #recalculamos el total pago de los maestros por si hubiera cambios en la cantidad
        if pedido.status > '0':
            trabajos = pedido.presupuesto.trabajos.all()
            for trabajo in trabajos:
                trabajo.total_pago = trabajo.total_simp * int(pedido.cantidad)
                trabajo.save()
    
        messages.success(request, 'Datos de ingreso modificados exitosamente')
        return redirect('/database')    

def pedidos(request):
    # renderiza la sección de pedidos
    return render(request, 'secciones/pedidos.html')

def pedido(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
    # Envía información de pedido vía JSON
        context = {
            'pedido': pedido,
            'cliente': pedido.cliente
        }
        return JsonResponse(context, encoder=ExtendedEncoder, safe=False)
    else:
    # renderiza la pagina detalles de pedido
        totales = presupuesto_totales(pedido.presupuesto.id)
        context = {
            'pedido': pedido,
            'totales': totales,
        }
        return render(request, 'acciones/info_pedido.html', context)


def confirmar_pedido(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)

    if pedido.status != '2':
        validaciones(request, pedido.status)
        mensajes = mensajes_ajax(request)
        return JsonResponse(mensajes, encoder=ExtendedEncoder, safe=False)
    else:
        if pedido.fecha_pdf == None:
            messages.error(request, 'Error. Para confirmar un pedido primero tienes que enviar el presupuesto PDF')
            mensajes = mensajes_ajax(request)
            return JsonResponse(mensajes, encoder=ExtendedEncoder, safe=False)
        pedido.status = 3
        pedido.fecha_confirmacion = timezone.now()
        pedido.save()
        messages.success(request, 'Pedido ID ' + str(pedido_id) + ' confirmado')
        mensajes = mensajes_ajax(request)
        return JsonResponse(mensajes, encoder=ExtendedEncoder, safe=False)

def anular_pedido(request, pedido_id):
    # view del boton anular pedido en el modal
    pedido = Pedido.objects.get(id=pedido_id)
    pedido.status = 6
    pedido.save()
    return HttpResponse(request)
    

def asignacion_maestros(request, pedido_id):
# view para seleccionar los maestros del pedido

    pedido = Pedido.objects.get(id=pedido_id)

    if pedido.status < '3':
        # si el status es menor a 'confirmado', se envía mensaje de error.
        validaciones(request, pedido.status)
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            mensajes = mensajes_ajax(request)
            return JsonResponse(mensajes, encoder=ExtendedEncoder, safe=False)
        return redirect(request.META.get('HTTP_REFERER', '/database'))

    context = {
        'pedido': pedido,
        'maestros': Maestro.objects.all().order_by('nombre')
    }

    return render(request, 'acciones/asignar_maestros.html', context)


def asignar_maestros(request, pedido_id):
# view para guardar los maestros asignados

    trabajos_id = request.POST.getlist('trabajo_id')
    maestros_id = request.POST.getlist('maestro')
    notas_ot = request.POST.getlist('notas_ot')

    pedido = Pedido.objects.get(id=pedido_id)
    try:
        request.session['excepcion']
        excepcion = 1
    except:
        excepcion = 0

    contador = 0
    for x in trabajos_id:
        trabajo = Trabajo.objects.get(id=x)
        try:
            if trabajo.maestro_asociado != Maestro.objects.get(id=maestros_id[contador]):
                trabajo.maestro_asociado = Maestro.objects.get(id=maestros_id[contador])
                trabajo.fecha_asignacion = None
        except:
            pass
        trabajo.notas_trabajo = notas_ot[contador]
        trabajo.save()
        contador += 1

    for x in maestros_id:
        if x == '0':
            messages.error(request, 'Error. Faltan asignaciones')
            return redirect('/asignacion/' + str(pedido_id))

    if pedido.status < '4':
        pedido.status = 4  # status 'En Fabricación'
        pedido.fecha_ingreso_fabrica = timezone.now()
        pedido.save()
        messages.success(request, 'Pedido ID ' + str(pedido.id) + ' ingresado a fábrica')
        return redirect('/produccion')

    elif excepcion == 1:
        #esta excepcion nace del caso en que agreguen un trabajo al presupuesto a un pedido que se encuentre en fabricación o ya terminado
        del request.session['excepcion']
        excepcion = 0
        messages.success(request, 'Nuevo trabajo creado correctamente')
        return redirect('/pedido/' + str(pedido.id) + '/presupuesto')

    else:
        messages.success(request, 'Re asignación OK')
        return redirect('/database')

def editar_status(request, pedido_id, accion):
    if accion == 0:
        # acccion 0 es rendedirzar la página de edicion
        pedido = Pedido.objects.get(id=pedido_id)

        context = {
            'pedido': pedido,
        }
        return render(request, 'acciones/reasignar_status.html', context)  
    elif accion == 1:
        # accion 1 es guardar los cambios
        pedido = Pedido.objects.get(id=pedido_id)
        trabajos = pedido.presupuesto.trabajos.all()
        status = request.POST['status']
        if status == '6':
            # anulado
            pedido.status = 6
            pedido.save()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' anulado')
            return redirect('/database')

        elif status > pedido.status:
            # VALIDACION
            messages.error(
                request, 'Error. No se puede seleccionar un status superior al actual')
            return redirect('/pedido/' + str(pedido_id) + '/status/0')

        elif status == '5':
            # terminado
            messages.error(
                request, 'Error. Para marcar como terminado debes usar el flujo normal del programa')
            return redirect('/pedido/' + str(pedido_id) + '/status/0')
        elif status == '4':
            # en fabricación
            pedido.status = 4
            pedido.fecha_cierre = None
            pedido.save()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' en Fabricación')
            return redirect('/database')
        elif status == '3':
            # confirmado
            pedido.status = 3
            pedido.fecha_cierre = None
            pedido.fecha_termino = None
            pedido.fecha_ingreso_fabrica = None
            pedido.save()
            for trabajo in trabajos:
                if trabajo.status_pago != "1":
                    trabajo.status_trabajo = 0
                    trabajo.fecha_termino_trabajo = None
                    trabajo.save()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' confirmado')
            return redirect('/database')

        elif status == '2':
            # no confirmado
            pedido.status = 2
            pedido.fecha_cierre = None
            pedido.fecha_termino = None
            pedido.fecha_ingreso_fabrica = None
            pedido.fecha_confirmacion = None
            pedido.save()
            for trabajo in trabajos:
                if trabajo.status_pago != "1":
                    trabajo.status_trabajo = 0
                    trabajo.fecha_termino_trabajo = None
                    trabajo.save()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' no confirmado')
            return redirect('/database')

        elif status == '1':
            # en revisión
            pedido.status = 1
            pedido.fecha_cierre = None
            pedido.fecha_termino = None
            pedido.fecha_ingreso_fabrica = None
            pedido.fecha_confirmacion = None
            pedido.fecha_pdf = None
            pedido.save()
            for trabajo in trabajos:
                if trabajo.status_pago != "1":
                    trabajo.status_trabajo = 0
                    trabajo.fecha_termino_trabajo = None
                    trabajo.save()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' en revisión')
            return redirect('/database')

        elif status == '0':
            # pendiente
            presupuesto = pedido.presupuesto
            materiales = pedido.presupuesto.materiales.all()
            pedido.status = 0
            pedido.fecha_cierre = None
            pedido.fecha_termino = None
            pedido.fecha_ingreso_fabrica = None
            pedido.fecha_confirmacion = None
            pedido.fecha_pdf = None
            pedido.save()

            presupuesto.porcentaje_gastos_generales = 0
            presupuesto.otros_gastos = 0
            presupuesto.porcentaje_utilidad = 0
            presupuesto.notas_presupuesto = ""
            presupuesto.save()

            trabajos.delete()
            materiales.delete()

            messages.success(request, 'Pedido ID ' +
                             str(pedido.id) + ' pendiente')
            return redirect('/database')
