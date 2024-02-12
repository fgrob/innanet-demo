from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from pedidos_app.models import *
from .utilidades import ExtendedEncoder
from .views_presupuestos import presupuesto_totales
from django.core import serializers


def database(request):

    # pedido = Pedido.objects.all()
    # context = {'listaPedidos': pedido}
    return render(request, 'secciones/database.html')
    # return render(request, 'secciones/database.html', context)


def db_modal(request, pedido_id):

    pedido = Pedido.objects.get(id=pedido_id)
    cliente = pedido.cliente
    reserva_tienda = pedido.reserva_tienda
    presupuesto = pedido.presupuesto
    totales = presupuesto_totales(presupuesto.id)

    trabajos = []
    for trabajo in pedido.presupuesto.trabajos.all():
        try:
            if trabajo.maestro_asociado == None:
                maestro_asociado = "Sin asignación"
            else:
                maestro_asociado = trabajo.maestro_asociado.nombre + " " + trabajo.maestro_asociado.apellido

            dic = {
                'tipo_trabajo': trabajo.tipo_trabajo.oficio,
                'maestro_asociado': maestro_asociado,
                'id': trabajo.id
            }
            trabajos.append(dic)
        except:
            pass

    context = {
        'pedido': pedido,
        'cliente': cliente,
        'reserva_tienda':reserva_tienda,
        'presupuesto': presupuesto,
        'trabajos': trabajos,
        'totales': totales,
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)



