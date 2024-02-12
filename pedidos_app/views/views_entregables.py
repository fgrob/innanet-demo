from datetime import datetime, timedelta
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from .views_presupuestos import presupuesto_totales
from pedidos_app.models import *
from django.utils import timezone
from django.contrib import messages
from .utilidades import ExtendedEncoder, mensajes_ajax



def pdf_unitario(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)
    if pedido.status < '2' or pedido.status == '6':
        messages.error(request, 'El PDF no está disponible')
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            mensajes = mensajes_ajax(request)
            return JsonResponse(mensajes, encoder=ExtendedEncoder, safe=False)
        return redirect('/database')
    pedidos_id = [pedido_id]
    request.session['pedidos'] = pedidos_id

    accion = "preview"
    return pdf(request, pedidos_id, accion)

def pdf(request, pedidos_id, accion):
    # pantalla de preview de presupuesto donde puedes especificar la cuenta, agregar más presupuestos, y generar la versión final

    pedidos = []
    subtotal_presupuestos = 0
    total_presupuestos = 0
    for x in pedidos_id:
        pedido_objetivo = Pedido.objects.get(id=x)
        totales_pedido = presupuesto_totales(pedido_objetivo.presupuesto.id)
        subtotal_presupuestos = subtotal_presupuestos + \
            totales_pedido['subtotal']
        total_presupuestos = total_presupuestos + totales_pedido['total']

        pedido = {
            'pedido': pedido_objetivo,
            'totales': totales_pedido,
        }
        pedidos.append(pedido)

    if pedidos[0]['pedido'].fecha_pdf == None:
        fecha_pdf = timezone.now()
    else:
        fecha_pdf = pedidos[0]['pedido'].fecha_pdf

    fecha_plazo = fecha_pdf + timedelta(days=30)

    context = {
        'pedidos': pedidos,
        'subtotal_presupuestos': subtotal_presupuestos,
        'total_presupuestos': total_presupuestos,
        'fecha_pdf': fecha_pdf,
        'fecha_plazo': fecha_plazo
    }
    if accion == "preview":
        # renderiza la versión preview con opciones
        return render(request, 'entregables/pdf_preview.html', context)
    elif accion == "generar":
        # renderiza la versión final imprimible. Fija la fecha PDF en cada pedido, en caso que no tengan todavía
        if pedidos[0]['pedido'].fecha_pdf == None:
            for x in pedidos_id:
                pedido_objetivo = Pedido.objects.get(id=x) 
                pedido_objetivo.fecha_pdf = timezone.now()
                pedido_objetivo.save()
        return render(request, 'entregables/pdf.html', context)


def cuenta_bancaria(request, pedido_id):
    # Para cambiar la cuenta bancaria asociada al pedido. Por defecto, Tienda
    pedido = Pedido.objects.get(id=pedido_id)
    cuenta = {}
    if pedido.cuenta == 0:
        pedido.cuenta = 1
        pedido.save()
        cuenta['status'] = 'fabrica'
    else:
        pedido.cuenta = 0
        pedido.save()
        cuenta['status'] = 'tienda'
    return JsonResponse(cuenta)


def selector_pedidos_pdf(request, cliente_id, accion):
    if accion == 'lista':
        # lista de PDFs disponibles para un cliente dado
        cliente = Cliente.objects.get(id=cliente_id)
        pedidos = cliente.pedidos.all().order_by('-id')
        context = {
            'cliente': cliente,
            'pedidos': pedidos,
        }
        return render(request, 'entregables/pdf_selector.html', context)
    elif accion == 'preview':
        # Junta las ID seleccionadas en una lista, y llama a la función pdf preview. También hace algunas validaciones
        pedidos_id = request.POST.getlist('selector')
        request.session['pedidos'] = pedidos_id
        if pedidos_id:
            fecha_pdf_uno = Pedido.objects.get(id=pedidos_id[0]).fecha_pdf
            if fecha_pdf_uno == None:
                fecha_pdf_uno = timezone.now()
            for pedido_id in pedidos_id:
                pedido = Pedido.objects.get(id=pedido_id)
                if pedido.fecha_pdf == None:
                    pedido.fecha_pdf = timezone.now()
                delta = pedido.fecha_pdf - fecha_pdf_uno
                if delta.days > 7 or delta.days < -7:
                    messages.error(
                        request, 'Solo es posible juntar presupuestos con menos de 7 días de diferencia en su fecha de envío PDF')
                    return redirect(request.META['HTTP_REFERER'])
            return pdf(request, pedidos_id, accion)
        else:
            messages.error(request, 'Debes seleccionar al menos 1 pedido')
            return redirect(request.META['HTTP_REFERER'])

def pdf_final(request):
    #su funcion es capturar la lista de pedidos que están en el preview, y usarlos para renderizar la version final. 
    # Es la acción directa del boton 'generar PDF'
    pedidos_id = request.session['pedidos']

    accion = "generar"
    return pdf(request, pedidos_id, accion)

def ot_preview(request, trabajo_id):
    request.session['trabajo_id'] = trabajo_id
    trabajo = Trabajo.objects.get(id=trabajo_id)

    if trabajo.fecha_asignacion == None:
        fecha_asignacion = timezone.now()
    else:
        fecha_asignacion = trabajo.fecha_asignacion

    context = {
        'trabajo': trabajo,
        'fecha_ot': fecha_asignacion
    }

    if trabajo.presupuesto_asociado.pedido.status < '4' or trabajo.presupuesto_asociado.pedido.status > '5':
        messages.error(request, 'Error. Solo se puede descargar la orden para trabajos en fabricación y trabajos terminados.')
        return redirect('/database')

    return render(request, 'entregables/ot_preview.html', context)

def ot_final(request):
    trabajo_id = request.session['trabajo_id']
    trabajo = Trabajo.objects.get(id=trabajo_id)

    if trabajo.fecha_asignacion == None:
        fecha_asignacion = timezone.now()
        trabajo.fecha_asignacion = fecha_asignacion
        trabajo.save()
    else:
        fecha_asignacion = trabajo.fecha_asignacion

    context = {
        'trabajo': trabajo,
        'fecha_ot': fecha_asignacion
    }
    return render(request, 'entregables/ot.html', context)


