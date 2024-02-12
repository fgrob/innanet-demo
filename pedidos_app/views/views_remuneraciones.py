from django.http import HttpResponse, JsonResponse
from .utilidades import ExtendedEncoder

from django.shortcuts import render, redirect
from pedidos_app.models import *
from django.contrib import messages
from django.utils import timezone


def trabajos(request):
    #hoja trabajos
    return render(request, 'secciones/trabajos.html')


def status_pago(request):
    trabajos_id = request.POST.getlist('check')
    if trabajos_id == []:
        messages.error(
            request, "Debes seleccionar al menos 1 trabajo para realizar esta accion")
        return redirect('/trabajos')

    if request.POST['accion'] == 'pagar':
        for x in trabajos_id:
            trabajo = Trabajo.objects.get(id=x)
            if trabajo.status_pago == '1':
                messages.warning(request, 'El trabajo N° ' + x +
                                 ' ya se encuentra pagado. Se omite el cambio.')
            else:
                trabajo.status_pago = 1
                trabajo.fecha_pago = timezone.now()
                trabajo.save()
        messages.success(request, 'Trabajo(s) pagados.')
        return redirect('/trabajos')
    elif request.POST['accion'] == 'nopagar':
        for x in trabajos_id:
            trabajo = Trabajo.objects.get(id=x)
            if trabajo.status_pago == '0':
                messages.warning(request, 'El trabajo N° ' +
                                 x + ' no estaba pagado. Se omite el cambio.')
            else:
                trabajo.status_pago = 0
                trabajo.fecha_pago = None
                trabajo.save()
        messages.success(request, 'Se ajustó el status a pendiente de pago')
        return redirect('/trabajos')
