from django.shortcuts import render, redirect
from pedidos_app.models import *
from django.contrib import messages


def lista_materiales(request):
    # pagina de materiales
    categorias = CategoriaMateriales.objects.all().order_by('categoria')
    context = {
        'categorias': categorias
    }
    return render(request, 'recursos/materiales.html', context)

def ingresar_categoria(request):
    CategoriaMateriales.objects.create(
        categoria = request.POST['nuevacategoriaModal']
    )
    messages.success(request, "Categoría creada correctamente")
    return redirect('/materiales/lista')

def guardar_material(request, accion):
    # guarda el material en la base de datos (crea o edita)
    if accion == 'crear':
        if request.POST['categoria'] == '0':
            messages.error(request, 'Error. Debes seleccionar una categoría')
            return redirect('/materiales/lista')


        ListaMateriales.objects.create(
            categoria=CategoriaMateriales.objects.get(
                id=request.POST['categoria']),
            material=request.POST['material'],
            costo_neto=request.POST['costo'],
            unidad_medida=request.POST['unidad'],
        )
        messages.success(request, 'Material agregado')
        return redirect('/materiales/lista')

    elif accion == "editar":
        material = ListaMateriales.objects.get(id=request.POST['pkModal'])
        material.categoria = CategoriaMateriales.objects.get(
            id=request.POST['categoriaModal'])
        material.material = request.POST['materialModal']
        material.costo_neto = request.POST['costoModal']
        material.unidad_medida = request.POST['unidadModal']
        material.save()

        messages.success(request, 'Material actualizado')
        return redirect('/materiales/lista')

def lista_maestros(request):

    context = {
        'maestros': Maestro.objects.all(),
        'trabajos': CostoMOD.objects.all(),
    }
    return render(request, 'recursos/maestros.html', context)

def ingresar_maestro(request):
    
    Maestro.objects.create(
        nombre = request.POST['nombre'],
        apellido = request.POST['apellido']
    )
    messages.success(request, 'Maestro ingresado')
    return redirect('/maestros/lista')

def modificar_costo_diario(request):
    tipo_trabajo_id = request.POST['pkModal']
    trabajo = CostoMOD.objects.get(id=tipo_trabajo_id)
    trabajo.total_diario = request.POST['totalModal']
    trabajo.save()

    messages.success(request, 'Costo modificado')
    return redirect('/maestros/lista')
