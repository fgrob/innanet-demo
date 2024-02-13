from re import M
from django.shortcuts import render, redirect
from django.db.models import Sum, Count, Q, F
from pedidos_app.models import *
from django.contrib import messages
from django.utils import timezone
import datetime
from django.db.models.functions import ExtractMonth, ExtractYear



def historial(request):

    return render(request, 'secciones/reportes/historial.html')

def excel_ddbb(request):

    # if request.user.is_staff:
        return render(request, 'secciones/reportes/excelddbb.html')
    # else:
    #     messages.error(request, 'No dispone de los privilegios para entrar a esta sección')
    #     return redirect('/database')

def abonos_mensuales(request, año = timezone.now().year, mes = timezone.now().month):

    # if request.user.is_staff:

        try:
            nueva_fecha = request.POST['fecha']
            nueva_fecha = nueva_fecha.split("-")
            año = int(nueva_fecha[0])
            mes = int(nueva_fecha[1])
        except:
            pass
        confirmados = Pedido.objects.filter(fecha_confirmacion__year=año, fecha_confirmacion__month=mes).order_by('-fecha_confirmacion')
        terminados = Pedido.objects.filter(fecha_cierre__year=año, fecha_cierre__month=mes).order_by('-fecha_cierre')

        total_confirmados = 0
        rentabilidad_confirmados = 0
        for pedido in confirmados:
            total_confirmados += pedido.presupuesto.total * pedido.cantidad
            rentabilidad_confirmados += pedido.presupuesto.rentabilidad * pedido.cantidad
        total_abonos_confirmados = total_confirmados / 2

        total_terminados = 0
        rentabilidad_terminados = 0
        for pedido in terminados:
            total_terminados += pedido.presupuesto.total * pedido.cantidad
            rentabilidad_terminados += pedido.presupuesto.rentabilidad * pedido.cantidad
        total_abonos_terminados = total_terminados / 2

        total_abonos = total_abonos_confirmados + total_abonos_terminados
        total_rentabiliad = (rentabilidad_confirmados + rentabilidad_terminados)/2

        if mes < 10:
            mes = str(0) + str(mes)

        context = {
            'confirmados':confirmados,
            'total_abonos_confirmados': total_abonos_confirmados,
            'terminados': terminados,
            'total_abonos_terminados': total_abonos_terminados,
            'total_abonos': total_abonos,
            'total_rentabilidad': total_rentabiliad,
            'fecha': str(año) + "-" + str(mes)
        }
        return render(request, 'secciones/reportes/abonosxmes.html', context)
    # else:
    #     messages.error(request, 'No dispone de los privilegios para entrar a esta sección')
    #     return redirect('/database')

def revision_abonos(request):

    if request.POST.getlist('revision_confirmados'):
        for pedido in request.POST.getlist('revision_confirmados'):
            target = Pedido.objects.get(id=pedido)
            target.abono_confirmacion = 1
            target.save()

    if request.POST.getlist('revision_cerrados'):
        for pedido in request.POST.getlist('revision_cerrados'):
            target = Pedido.objects.get(id=pedido)
            target.abono_cierre = 1
            target.save()

    return redirect('/reportes/abonos')


def informe_resumen(request, año = timezone.now().year, mes = timezone.now().month):

    # if request.user.is_staff:
        try:
            nueva_fecha = request.POST['fecha']
            nueva_fecha = nueva_fecha.split("-")
            año = int(nueva_fecha[0])
            mes = int(nueva_fecha[1])
        except:
            pass

        pedidos = Pedido.objects.all()
        fecha_actual = datetime.date(año, mes, 1).strftime('%B').capitalize() + ' ' + str(año)

        confirmados_neto = pedidos.filter(fecha_confirmacion__year=año, fecha_confirmacion__month=mes).aggregate(total = Sum(F('presupuesto__subtotal') * F('presupuesto__pedido__cantidad')))
        confirmados_rentabilidad = pedidos.filter(fecha_confirmacion__year=año, fecha_confirmacion__month=mes).aggregate(total = Sum(F('presupuesto__rentabilidad') * F('presupuesto__pedido__cantidad')))

        cerrados_total = pedidos.filter(fecha_cierre__year=año, fecha_cierre__month=mes).aggregate(total = Sum(F('presupuesto__total')* F('presupuesto__pedido__cantidad')))
        cerrados_rentabilidad = pedidos.filter(fecha_cierre__year=año, fecha_cierre__month=mes).aggregate(total = Sum(F('presupuesto__rentabilidad') * F('presupuesto__pedido__cantidad')))
               
        total_abonos = (int(cerrados_total['total'] or 0) / 2) + (int(confirmados_neto['total'] or 0) * 1.19 / 2)
        total_abonos_rentabilidad = (int(cerrados_rentabilidad['total'] or 0) / 2) + (int(confirmados_rentabilidad['total'] or 0) / 2)


        cantidad_pendientes = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 0).count()
        cantidad_pendientes_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 0).count() - cantidad_pendientes

        cantidad_revision = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 1).count()
        cantidad_revision_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 1).count() - cantidad_revision

        cantidad_no_confirmados = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 2).count()
        cantidad_no_confirmados_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 2).count() - cantidad_no_confirmados

        cantidad_confirmados = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 3).count()
        cantidad_confirmados_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 3).count() - cantidad_confirmados

        cantidad_fabrica = pedidos.filter(fecha_creacion__lte = datetime.date(año,mes + 1, 1), status = 4 ).count()
        cantidad_fabrica_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 4).count() - cantidad_fabrica

        cantidad_sin_cierre = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1 ),status = 4, fecha_termino__isnull=False, fecha_cierre__isnull=True).exclude(reserva_tienda=1).count()
        cantidad_sin_cierre_tienda = pedidos.filter(fecha_creacion__lte = datetime.date(año, mes + 1, 1), status = 4, fecha_termino__isnull=False, fecha_cierre__isnull=True).count() - cantidad_sin_cierre


        cantidad_ingresados_mes = pedidos.filter(fecha_creacion__year=año, fecha_creacion__month=mes).count()
        cantidad_ingresados_mes_tienda = pedidos.filter(fecha_creacion__year=año, fecha_creacion__month=mes).count() - cantidad_ingresados_mes

        cantidad_confirmados_mes = pedidos.filter(fecha_confirmacion__year = año, fecha_confirmacion__month = mes).count()
        cantidad_confirmados_mes_tienda = pedidos.filter(fecha_confirmacion__year = año, fecha_confirmacion__month = mes).count() - cantidad_confirmados_mes

        cantidad_ingresados_fabrica_mes = pedidos.filter(fecha_ingreso_fabrica__year=año, fecha_ingreso_fabrica__month=mes).count()
        cantidad_ingresados_fabrica_mes_tienda = pedidos.filter(fecha_ingreso_fabrica__year=año, fecha_ingreso_fabrica__month=mes).count() - cantidad_ingresados_fabrica_mes

        cantidad_terminados_mes = pedidos.filter(fecha_termino__year=año, fecha_termino__month=mes).count()
        cantidad_terminados_mes_tienda = pedidos.filter(fecha_termino__year=año, fecha_termino__month=mes).count() - cantidad_terminados_mes

        cantidad_cerrados_mes = pedidos.filter(fecha_cierre__year=año, fecha_cierre__month=mes).count()
        cantidad_cerrados_mes_tienda = pedidos.filter(fecha_cierre__year=año, fecha_cierre__month=mes).count() - cantidad_cerrados_mes

        trabajos = Trabajo.objects.filter(fecha_asignacion__isnull=False)\
            .values('maestro_asociado')\
                .annotate(\
                        cantidad_asignados=Count('total_pago', filter=Q(fecha_asignacion__year=año, fecha_asignacion__month=mes, presupuesto_asociado__pedido__status__in=[4,5])),\
                        total_asignados=Sum('total_pago', filter=Q(fecha_asignacion__year=año, fecha_asignacion__month=mes, presupuesto_asociado__pedido__status__in=[4,5])),\
                                cantidad_pendientes=Count('total_pago', filter=Q(fecha_asignacion__lt= datetime.date(año, mes + 1, 1), status_trabajo=0, presupuesto_asociado__pedido__status__in=[4,5])),\
                                total_pendientes=Sum('total_pago', filter=Q(fecha_asignacion__lt= datetime.date(año, mes + 1, 1), status_trabajo=0, presupuesto_asociado__pedido__status__in=[4,5])),\
                                    total_terminados=Sum('total_pago', filter=Q(fecha_termino_trabajo__year=año, fecha_termino_trabajo__month=mes, presupuesto_asociado__pedido__status__in=[4,5])),\
                                    cantidad_terminados=Count('total_pago', filter=Q(fecha_termino_trabajo__year=año, fecha_termino_trabajo__month=mes, presupuesto_asociado__pedido__status__in=[4,5])))\
                                        .order_by('maestro_asociado')

        maestros = Maestro.objects.all()
        #la lista de trabajos viene por id. Vamos a reemplazarla por los nombres:
        for trabajo in trabajos:
            trabajo['maestro_asociado'] = maestros.get(id=trabajo['maestro_asociado']).nombre + ' ' + maestros.get(id=trabajo['maestro_asociado']).apellido
            
        historial_ventas = Pedido.objects.annotate(month=ExtractMonth("fecha_confirmacion"), year=ExtractYear("fecha_confirmacion")).values("month", "year").annotate(total=Sum(F("presupuesto__subtotal") * F('presupuesto__pedido__cantidad')), rentabilidad = Sum(F("presupuesto__rentabilidad") * F('presupuesto__pedido__cantidad')), cantidad = Count("presupuesto__subtotal")).exclude(fecha_confirmacion__isnull=True).exclude(fecha_confirmacion__year=2020).order_by("year", "month")
        historial_abonos = Pedido.objects.annotate(month=ExtractMonth("fecha_confirmacion"), year=ExtractYear("fecha_confirmacion")).values("month", "year").annotate(total=Sum(F("presupuesto__total") * F('presupuesto__pedido__cantidad')), rentabilidad = Sum(F("presupuesto__rentabilidad") * F('presupuesto__pedido__cantidad'))).exclude(fecha_confirmacion__isnull=True).exclude(fecha_confirmacion__year=2020).order_by("year", "month")

        for x in historial_abonos:
            datos_cierre = pedidos.filter(fecha_cierre__year=x['year'], fecha_cierre__month=x['month']).aggregate(total = Sum('presupuesto__total'), rentabilidad = Sum('presupuesto__rentabilidad'))
            abonos_cierre = int(datos_cierre['total'] or 0) / 2
            rentabilidad_cierre = int(datos_cierre['rentabilidad'] or 0) / 2

            x['total'] = (int(x['total']  or 0) / 2) + abonos_cierre
            x['rentabilidad'] = (int(x['rentabilidad']  or 0) / 2) + rentabilidad_cierre
       
        if mes < 10:
            mes = str(0) + str(mes)


        context = {
            'fecha': str(año) + "-" + str(mes),
            'fecha_actual': fecha_actual,
            'confirmados_neto': confirmados_neto,
            'confirmados_rentabilidad': confirmados_rentabilidad,
            'total_abonos': total_abonos,
            'total_abonos_rentabilidad': total_abonos_rentabilidad,

            'historial_ventas': historial_ventas,
            'historial_abonos': historial_abonos,

            'cantidad_pendientes': cantidad_pendientes,
            'cantidad_pendientes_tienda': cantidad_pendientes_tienda,
            'cantidad_revision': cantidad_revision,
            'cantidad_revision_tienda': cantidad_revision_tienda,
            'cantidad_no_confirmados': cantidad_no_confirmados,
            'cantidad_no_confirmados_tienda': cantidad_no_confirmados_tienda,
            'cantidad_confirmados': cantidad_confirmados,
            'cantidad_confirmados_tienda': cantidad_confirmados_tienda,
            'cantidad_fabrica': cantidad_fabrica,
            'cantidad_fabrica_tienda': cantidad_fabrica_tienda,
            'cantidad_sin_cierre': cantidad_sin_cierre,
            'cantidad_sin_cierre_tienda': cantidad_sin_cierre_tienda,

            'cantidad_ingresados_mes': cantidad_ingresados_mes,
            'cantidad_ingresados_mes_tienda': cantidad_ingresados_mes_tienda,
            'cantidad_confirmados_mes': cantidad_confirmados_mes,
            'cantidad_confirmados_mes_tienda': cantidad_confirmados_mes_tienda,
            'cantidad_ingresados_fabrica_mes': cantidad_ingresados_fabrica_mes,
            'cantidad_ingresados_fabrica_mes_tienda': cantidad_ingresados_fabrica_mes_tienda,
            'cantidad_terminados_mes': cantidad_terminados_mes,
            'cantidad_terminados_mes_tienda': cantidad_terminados_mes_tienda,
            'cantidad_cerrados_mes': cantidad_cerrados_mes,
            'cantidad_cerrados_mes_tienda': cantidad_cerrados_mes_tienda,
            'trabajos': trabajos,

        }


        return render(request, 'secciones/reportes/informe_resumen.html', context)
    # else:
    #     messages.error(request, 'No dispone de los privilegios para entrar a esta sección')
    #     return redirect('/database')


