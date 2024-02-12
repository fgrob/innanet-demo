from django.shortcuts import render, redirect
from django.utils import timezone
from django.http import JsonResponse
from .utilidades import ExtendedEncoder
from django.contrib import messages
from pedidos_app.models import *



def presupuesto_totales(presupuesto_id):
    # Devuelve un diccionario con los totales generales del presupuesto
    presupuesto = Presupuesto.objects.get(id=presupuesto_id)
  
    # totales unitarios
    total_trabajos_simp = presupuesto.total_trabajos_simp
    total_trabajos = presupuesto.total_trabajos
    total_materiales = presupuesto.total_materiales

    costos_directos_unit = total_materiales + total_trabajos
    porcentaje_gastos_generales = presupuesto.porcentaje_gastos_generales
    gastos_generales_unit = costos_directos_unit * \
        (porcentaje_gastos_generales / 100)
    otros_gastos_unit = presupuesto.otros_gastos
    porcentaje_utilidad = presupuesto.porcentaje_utilidad
    total_costos_unit = otros_gastos_unit + \
        gastos_generales_unit + costos_directos_unit
    subtotal_unit = total_costos_unit / (1 - (porcentaje_utilidad / 100))
    total_unit = float(subtotal_unit) * 1.19
    iva_unit = float(subtotal_unit) * 0.19
    rentabilidad_unit = subtotal_unit * (porcentaje_utilidad / 100)

    #guardamos los valores en la base de datos:
    presupuesto.total_costos = round(total_costos_unit)
    presupuesto.subtotal = round(subtotal_unit)
    presupuesto.total = round(total_unit)
    presupuesto.rentabilidad = round(rentabilidad_unit)
    presupuesto.save()

    # totales considerando cantidad
    cantidad = presupuesto.pedido.cantidad
    costos_directos_total = costos_directos_unit * cantidad
    gastos_generales_total = gastos_generales_unit * cantidad
    otros_gastos_total = otros_gastos_unit * cantidad
    total_costos = (otros_gastos_unit + gastos_generales_unit +
                    costos_directos_unit) * cantidad
    subtotal = total_costos / (1 - (porcentaje_utilidad / 100))
    total = float(subtotal) * 1.19
    iva = float(subtotal) * 0.19
    rentabilidad = subtotal * (porcentaje_utilidad / 100)

    # calculo del total pago (se hace recién acá por si hubiera cambios en la cantidad)
    trabajos = presupuesto.trabajos.all()
    for trabajo in trabajos:
        trabajo.total_pago = trabajo.total_simp * cantidad
        trabajo.save()

    totales = {
        'cantidad': cantidad,
        'total_trabajos_simp': total_trabajos_simp,
        'total_trabajos': total_trabajos,
        'total_materiales': total_materiales,
        'costos_directos_unit': costos_directos_unit,
        'costos_directos_total': costos_directos_total,
        'porcentaje_gastos_generales': porcentaje_gastos_generales,
        'gastos_generales_unit': gastos_generales_unit,
        'gastos_generales_total': gastos_generales_total,
        'otros_gastos_unit': otros_gastos_unit,
        'otros_gastos_total': otros_gastos_total,
        'total_costos_unit': total_costos_unit, 
        'total_costos': total_costos, 
        'porcentaje_utilidad': porcentaje_utilidad,
        'subtotal_unit': subtotal_unit,
        'subtotal': subtotal,
        'iva_unit': iva_unit,
        'iva': iva,
        'total_unit': total_unit,
        'total': total,
        'rentabilidad_unit': rentabilidad_unit,
        'rentabilidad': rentabilidad
    }
    return totales


def crear_presupuesto(request, number):
    pedido = Pedido.objects.get(id=number)
    if pedido.status > '1' and pedido.status < '6': 
        if request.user.is_staff:
            pass
        else:
            messages.warning(request, 'Advertencia. Solo los usuarios administradores pueden editar presupuestos ya aprobados.')
            return redirect('/pedido/' + str(number))
    totales = presupuesto_totales(pedido.presupuesto.id)
    context = {
        'pedido': pedido,
        'mod': CostoMOD.objects.all(),
        'materiales': CategoriaMateriales.objects.all().order_by('categoria'),
        'imposiciones': Imposiciones.objects.get(id=1),
        'totales': totales,
    }
    return render(request, 'acciones/crear_presupuesto.html', context)


def presup_base(request, pedido_id):
    trabajos = Pedido.objects.get(id=pedido_id).presupuesto.trabajos.all()
    for trabajo in trabajos:
        if trabajo.status_pago == '1':
            messages.error(request, 'No se puede usar esta función si alguno de los trabajos se encuentra pagado')
            return redirect('/pedido/' + str(pedido_id) + '/presupuesto')
    request.session['id_base'] = pedido_id
    messages.warning(
        request, "Selecciona el pedido a copiar y luego pincha 'Usar como Base'")
    return redirect('/database')


def presup_ref(request, pedido_id):
    try:
        request.session['id_base']
        if request.session['id_base'] == None:
            messages.error(request, 'Para usar esta función tienes que ir al presupuesto y hacer click en el boton correspondiente')
            return redirect('/database')
    except:
        messages.error(request, 'Para usar esta función tienes que ir al presupuesto y hacer click en el boton correspondiente')
        return redirect('/database')

    context = {
        'pedido_base': Pedido.objects.get(id=request.session['id_base']),
        'pedido_ref': Pedido.objects.get(id=pedido_id)
    }
    return render(request, 'acciones/basar_presupuesto.html', context)


def otra_id_ref(request):
    messages.warning(
        request, "Selecciona el pedido a copiar y luego pincha 'Usar como Base'")
    return redirect('/database')


def copiar_presupuesto(request, pedido_id):
    presupuesto_base = Pedido.objects.get(
        id=request.session['id_base']).presupuesto
    presupuesto_ref = Pedido.objects.get(
        id=pedido_id).presupuesto

    trabajos = presupuesto_base.trabajos.all()
    trabajos.delete()
    materiales = presupuesto_base.materiales.all()
    materiales.delete()

    presupuesto_base.porcentaje_gastos_generales = presupuesto_ref.porcentaje_gastos_generales
    presupuesto_base.otros_gastos = presupuesto_ref.otros_gastos
    presupuesto_base.porcentaje_utilidad = presupuesto_ref.porcentaje_utilidad
    presupuesto_base.notas_presupuesto = presupuesto_ref.notas_presupuesto

    for trabajo in presupuesto_ref.trabajos.all():
        Trabajo.objects.create(
            tipo_trabajo=trabajo.tipo_trabajo,
            presupuesto_asociado=presupuesto_base,
            costo_trabajo=trabajo.costo_trabajo,
            dias_trabajo=trabajo.dias_trabajo,
            imposiciones=trabajo.imposiciones,
            notas_trabajo=trabajo.notas_trabajo,
            total_trabajo = trabajo.total_trabajo,
            total_simp = trabajo.total_simp,
            total_pago = trabajo.total_pago
        )

    for material in presupuesto_ref.materiales.all():
        Material.objects.create(
            cantidad=material.cantidad,
            costo_material=material.costo_material,
            material_asignado=material.material_asignado,
            presupuesto_asociado=presupuesto_base
        )

    presupuesto_base.save()
    request.session['id_base'] = None
    messages.success(request, 'Presupuesto copiado')
    return redirect('/pedido/' + str(presupuesto_base.pedido.id) + '/presupuesto')

def agregar_notas_presupuesto(request, pedido_id):
    presupuesto = Pedido.objects.get(id=pedido_id).presupuesto
    presupuesto.notas_presupuesto = request.POST['notas_presupuesto']
    presupuesto.save()
    return JsonResponse({})


def costo_mod(request, oficio_id):
    # Devuelve el valor diario del maestro segun lo registrado
    costo_mod = {'total_diario': CostoMOD.objects.get(
        id=oficio_id).total_diario}
    return JsonResponse(costo_mod)


def guardar_trabajo(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)

    Trabajo.objects.create(
        tipo_trabajo = CostoMOD.objects.get(id=request.POST['tipo_trabajo']),
        presupuesto_asociado = pedido.presupuesto,
        costo_trabajo = request.POST['costo_diario'],
        dias_trabajo = request.POST['dias'],
        imposiciones = request.POST['imposiciones'],
        total_trabajo = float(request.POST['dias']) * (int(request.POST['costo_diario']) + int(request.POST['imposiciones'])),
        total_simp = float(request.POST['dias']) * int(request.POST['costo_diario']),
        # total_pago se calcula en presupuesto_totales
        # total_pago = float(request.POST['dias']) * int(request.POST['costo_diario']) * pedido.cantidad,
        notas_trabajo=request.POST['notas_trabajo'],
    )
    trabajo = Pedido.objects.get(id=pedido_id).presupuesto.trabajos.last()

    subtotales = {
        'total_simp': trabajo.total_simp,
        'total_trabajo': trabajo.total_trabajo
    }
    totales = presupuesto_totales(
        Pedido.objects.get(id=pedido_id).presupuesto.id)

    if pedido.status > '3' and pedido.status < '6':
        #si se está creando trabajo en un pedido que esta terminado o en producción, esto obligará a ir a la página de asignación altiro
        excepcion = 1
        request.session['excepcion'] = 1
        messages.warning(request, "Para agregar un trabajo a un pedido que tiene status 'En fabricación' o 'Terminado', se requiere asignar un maestro")
    else:
        excepcion = 0

    context = {
        'trabajo': trabajo,
        'subtotales': subtotales,
        'totales': totales,
        'excepcion': excepcion
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def editar_trabajo(request, trabajo_id):
    presupuesto = Trabajo.objects.get(id=trabajo_id).presupuesto_asociado
    trabajo = Trabajo.objects.get(id=trabajo_id)
    costo_base = CostoMOD.objects.get(id=trabajo.tipo_trabajo.id).total_diario #para verificar el valor actual del trabajo con el guardado
    imposiciones_base = Imposiciones.objects.get(id=1).total

    totales = presupuesto_totales(presupuesto.id)
    context = {
        'presupuesto': presupuesto,
        'trabajo': trabajo,
        'costo_base': costo_base,
        'imposiciones_base': imposiciones_base,
        'totales': totales
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def guardar_edicion_trabajo(request, trabajo_id):
    trabajo = Trabajo.objects.get(id=trabajo_id)

    trabajo.tipo_trabajo = CostoMOD.objects.get(id=request.POST['tipo_trabajo'])
    trabajo.costo_trabajo = request.POST['costo_diario']
    trabajo.dias_trabajo = float(request.POST['dias']) #el float lo agregué para que en los logs no detecte un cambio en los días cuando no los hay
    trabajo.imposiciones = request.POST['imposiciones']
    trabajo.total_trabajo = float(request.POST['dias']) * (int(request.POST['costo_diario']) + int(request.POST['imposiciones']))
    trabajo.total_simp = float(request.POST['dias']) * int(request.POST['costo_diario'])
    # total_pago se calcula en presupuesto_totales
    # trabajo.total_pago = float(request.POST['dias']) * int(request.POST['costo_diario']) * trabajo.presupuesto_asociado.pedido.cantidad
    trabajo.notas_trabajo = request.POST['notas_trabajo']
    trabajo.save()

    trabajo = Trabajo.objects.get(id=trabajo_id)

    subtotales = {
        'total_simp': trabajo.total_simp,
        'total_trabajo': trabajo.total_trabajo
    }
    totales = presupuesto_totales(trabajo.presupuesto_asociado.id)
    context = {
        'trabajo': trabajo,
        'subtotales': subtotales,
        'totales': totales,
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def eliminar_trabajo(request, trabajo_id):
    presupuesto_id = Trabajo.objects.get(id=trabajo_id).presupuesto_asociado.id
    trabajo = Trabajo.objects.get(id=trabajo_id)
    if Trabajo.objects.get(id=trabajo_id).status_pago == '0':
        # si el trabajo está pagado, esto previene que se borre. en JS se envía un mensaje de "no se puede eliminar"
        Trabajo.objects.get(id=trabajo_id).delete()
    totales = presupuesto_totales(presupuesto_id)
    context = {
        'trabajo': trabajo,
        'totales': totales,
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def materiales_categoria(request, categoria_id):
    # trae los materiales según la categoria dada
    materiales = list(CategoriaMateriales.objects.get(
        id=categoria_id).materiales.all().order_by('material').values())
    return JsonResponse(materiales, safe=False)


def material(request, material_id):
    # según el material seleccionado, busca su costo y su unidad de medida
    material = ListaMateriales.objects.get(id=material_id)
    context = {
        'costo_neto': material.costo_neto,
        'unidad_medida': material.unidad_medida
    }
    return JsonResponse(context)


def agregar_material(request, pedido_id):
    # añade un objeto material al presupuesto y devuelve el dato para que javascript lo proceseX
    material_id = request.POST['materiales']
    presupuesto = Pedido.objects.get(id=pedido_id).presupuesto
    Material.objects.create(
        cantidad=request.POST['cantidad'],
        costo_material=request.POST['costo_mat'],
        material_asignado=ListaMateriales.objects.get(id=material_id),
        presupuesto_asociado=presupuesto
    )
    material = Pedido.objects.get(id=pedido_id).presupuesto.materiales.last()
    material_asignado = material.material_asignado
    material_categoria = material_asignado.categoria
    totales = presupuesto_totales(presupuesto.id)
    context = {
        'material': material,
        'material_asignado': material_asignado,
        'material_categoria': material_categoria,
        'material_total': material.total_material,
        'totales': totales
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def editar_material(request, material_id):
    material = Material.objects.get(id=material_id)
    material_asignado = material.material_asignado
    material_categoria = material_asignado.categoria
    lista_materiales = list(CategoriaMateriales.objects.get(
        id=material_categoria.id).materiales.all().order_by('material'))
    presupuesto = Material.objects.get(id=material_id).presupuesto_asociado
    totales = presupuesto_totales(presupuesto.id)
    context = {
        'lista_materiales': lista_materiales,
        'material': material,
        'material_asignado': material_asignado,
        'material_categoria': material_categoria,
        'material_total': material.total_material,
        'totales': totales
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def guardar_edicion_material(request, material_id):
    material = Material.objects.get(id=material_id)
    presupuesto = material.presupuesto_asociado

    material.cantidad = format(float(request.POST['cantidad']), '.2f') #el float y el format lo agregué para que en los logs no detecte un cambio en la cantidad cuando no los hay
    material.costo_material = request.POST['costo_mat']
    material.material_asignado = ListaMateriales.objects.get(
        id=request.POST['materiales'])
    material.presupuesto_asociado = presupuesto
    material.save()

    material = Material.objects.get(id=material_id)

    totales = presupuesto_totales(presupuesto.id)
    context = {
        'material': material,
        'material_asignado': material.material_asignado,
        'material_categoria': material.material_asignado.categoria,
        'material_total': material.total_material,
        'totales': totales
    }
    return JsonResponse(context, encoder=ExtendedEncoder, safe=False)


def eliminar_material(request, material_id):
    presupuesto_id = Material.objects.get(
        id=material_id).presupuesto_asociado.id
    Material.objects.get(id=material_id).delete()
    totales = presupuesto_totales(presupuesto_id)
    return JsonResponse(totales)


def agregar_costos(request, pedido_id):
    # añade costos varios y la utilidad al presupuesto
    presupuesto = Pedido.objects.get(id=pedido_id).presupuesto
    presupuesto.porcentaje_gastos_generales = request.POST['porcentaje_gastos_generales']
    presupuesto.otros_gastos = request.POST['otros_gastos']
    presupuesto.porcentaje_utilidad = request.POST['porcentaje_utilidad']
    presupuesto.save()
    totales = presupuesto_totales(presupuesto.id)
    return JsonResponse(totales)


def editar_costos(request, pedido_id):
    presupuesto = Pedido.objects.get(id=pedido_id).presupuesto
    totales = presupuesto_totales(presupuesto.id)
    return JsonResponse(totales)


def buscar_margen(request, pedido_id):
    presupuesto = Pedido.objects.get(id=pedido_id).presupuesto
    totales = presupuesto_totales(presupuesto.id)
    context = {
        'costos_directos_unit': totales['costos_directos_unit']
    }
    return JsonResponse(context)


def agregar_cantidad(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)
    pedido.cantidad = request.POST['cantidad_conjunto']
    pedido.save()
    totales = presupuesto_totales(pedido.presupuesto.id)
    return JsonResponse(totales)


def cerrar_presupuesto(request, pedido_id):
    pedido = Pedido.objects.get(id=pedido_id)
    if pedido.status > '1':
        messages.error(request, 'Error. El presupuesto ya está aprobado')
        return redirect('/pedidos')
    if pedido.presupuesto.total_trabajos == 0:
        messages.warning(
            request, 'El presupuesto no tiene trabajos. Se mantiene el status Pendiente')
        return redirect('/pedidos')
    pedido.status = 1  # cambia el status del pedido a 'en revisión'
    pedido.save()
    messages.success(request, 'Status actualizado: En revisión')
    return redirect('/pedidos')


def aprobar_presupuesto(request, pedido_id):
    if request.user.is_staff:
        pedido = Pedido.objects.get(id=pedido_id)
        pedido.status = 2  # cambia el status del pedido a 'no confirmado'
        pedido.fecha_confirmacion = None
        pedido.fecha_pdf = None
        pedido.save()
        messages.success(request, 'Status actualizado: No confirmado')
        return redirect('/pedidos')
    else:
        messages.error(request, 'Error. Solo los administradores pueden aprobar un presupuesto.')
        return redirect('/pedidos')
        
