from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from pedidos_app.models import *
from django.utils import timezone
from django.contrib import messages
from .utilidades import ExtendedEncoder

def produccion(request):
    return render(request, 'secciones/produccion.html')

def actualizar_status_trabajo(request, trabajo_id):
# Para actualizar el status del trabajo de Pendiente a Terminado, o viceversa

    trabajo = Trabajo.objects.get(id=trabajo_id)
    pedido = trabajo.presupuesto_asociado.pedido

    # de pendiente a terminado
    if trabajo.status_trabajo == '0':
            trabajo.status_trabajo = 1
            trabajo.fecha_termino_trabajo = timezone.now()
            trabajo.save()
    else:
        trabajo.status_trabajo = 0
        trabajo.fecha_termino_trabajo = None
        trabajo.save()

    # para ver si están todos los trabajos del pedido listos:
    nr_trabajos = 0
    marcador_de_termino = 0
    for trabajos in pedido.presupuesto.trabajos.all():
            nr_trabajos += 1
    if nr_trabajos == pedido.presupuesto.trabajos_terminados:
        marcador_de_termino = 1
        if pedido.fecha_termino == None:
            pedido.fecha_termino = timezone.now()
            pedido.save()
    else:
        pedido.fecha_termino = None
        pedido.save()

    context = {
        'pedido_id': pedido.id,
        'trabajo': Trabajo.objects.get(id=trabajo_id).get_status_trabajo_display(),
        'termino': marcador_de_termino
    }

    return JsonResponse(context)

# view que marca el pedido como terminado y establece la fecha de término


def cerrar_pedido(request, pedido_id):

    pedido = Pedido.objects.get(id=pedido_id)

    nr_trabajos = 0
    for trabajo in pedido.presupuesto.trabajos.all():
        nr_trabajos += 1

    if pedido.presupuesto.trabajos_terminados != nr_trabajos:
        messages.error(request, 'Error. El pedido tiene trabajos pendientes.')
        return redirect('/produccion')
    else:
        pedido.status = 5
        pedido.fecha_cierre = timezone.now()
        if pedido.fecha_termino == None:
            # evaluacion auxiliar por si se diera el caso que no tenga fecha de termino (podria pasar)
            pedido.fecha_termino = timezone.now()
        pedido.save()
        return HttpResponse(request)


def info_trabajo(request, trabajo_id):
    trabajo = Trabajo.objects.get(id=trabajo_id)
    pedido = trabajo.presupuesto_asociado.pedido
    trabajo_rel = {
        'tipo_trabajo': trabajo.tipo_trabajo.oficio,
        'maestro_asociado': trabajo.maestro_asociado.nombre + " " + trabajo.maestro_asociado.apellido,
        'total_simp': trabajo.total_simp,
        'total_trabajo': trabajo.total_trabajo,
        'total_simp_general': trabajo.total_simp * pedido.cantidad,
        'total_trabajo_general': trabajo.total_trabajo * pedido.cantidad
    }
    context = {
        'pedido': pedido,
        'trabajo': trabajo,
        'trabajo_rel': trabajo_rel,
    }

    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)

    

        