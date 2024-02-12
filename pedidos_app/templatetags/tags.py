from pedidos_app.models import ListaMateriales, Material, Trabajo, CostoMOD, Imposiciones
from .filtros import formato_peso
from django import template
register = template.Library()

@register.simple_tag
# tag para calcular el total de un trabajo pasandole el costo simp (costo trabajo x días) y la cantidad a fabricar
def costo_trabajo_final(costo_trabajo, dias):

    total = costo_trabajo * dias
    return formato_peso(total)


@register.simple_tag
# tag auxiliar de la cotización para verificar el valor actualizado de un trabajo versus el guardado en el presupuesto
def costo_trabajo_actualizado(trabajo_id, tipo_trabajo_id):
    costo_trabajo = Trabajo.objects.get(
        id=trabajo_id).costo_trabajo
    costo_base = CostoMOD.objects.get(id=tipo_trabajo_id).total_diario

    if costo_trabajo < costo_base:
        costo_base = formato_peso(costo_base)
        return "El valor x día actual es de " + costo_base
    else:
        return ""

@register.simple_tag
# tag auxiliar de la cotización para verificar el valor actualizado de las imposiciones versus el guardado en el presupuesto
def imposiciones_actualizadas(trabajo_id):
    imposiciones_trabajo = Trabajo.objects.get(
        id=trabajo_id).imposiciones
    imposiciones_base = Imposiciones.objects.get(id=1).total

    if imposiciones_trabajo < imposiciones_base:
        imposiciones_base = formato_peso(imposiciones_base)
        return "El valor actual de las imp. es de " + imposiciones_base
    else:
        return ""

@register.simple_tag
# tag auxiliar de la cotización para verificar el costo actual de un material versus el guardado en el presupuesto
def costo_material_actualizado(material_registrado_id, material_base_id):
    costo_presupuesto = Material.objects.get(
        id=material_registrado_id).costo_material
    costo_base = ListaMateriales.objects.get(id=material_base_id).costo_neto

    if costo_presupuesto < costo_base:
        costo_base = formato_peso(costo_base)
        return "El costo actual es de " + costo_base
    else:
        return ""

@register.simple_tag
#tag para el reporte abonos por mes. Divide el total del presupuesto por 2 (los abonos del 50%)
def abono(valor, cantidad):
    return formato_peso((valor * cantidad) / 2)

    
