from django import template
from django.contrib.humanize.templatetags.humanize import intcomma
import datetime
from datetime import date, datetime
import locale


locale.setlocale(locale.LC_TIME, "es_MX.utf8")
register = template.Library()

@register.filter
def formato_peso(number):
    try:
        result = '$' + intcomma(round(number))    
        return result
    except:
        return '$0'

@register.filter
def formato_porcentaje(number):
    result = intcomma(round(number, 2)) + '%'    
    return result

@register.filter
#filtro para calcular los días que han pasado desde una fecha concreta
def dias_fecha(fecha):
    try:
        fecha = datetime.astimezone(fecha) #para convertir la fecha del servidor en fecha local
        desde_date = fecha.date() 
        hasta_date = date.today()
        delta = hasta_date - desde_date    

        return delta.days

    except:
        return fecha

@register.filter
#tipo: "29 de marzo"
def formato_fecha(fecha):
    if fecha == None:
        return ""
    fecha = datetime.astimezone(fecha)
    fecha_sin_hora = fecha.date()
    return fecha_sin_hora.strftime("%#d de %B")

@register.filter
#tipo: "29 de marzo de 2022" (sin hora)
def formato_fecha_sinhora(fecha):
    try:
        fecha = datetime.astimezone(fecha)
        fecha_sin_hora = fecha.date()
        return fecha_sin_hora.strftime("%#d de %B de %Y")
    except:
        return fecha

@register.filter
#tipo: "01/01/91"
def formato_fecha_basico(fecha):
    if fecha == None:
        return ""
    fecha = datetime.astimezone(fecha)
    fecha_sin_hora = fecha.date()
    return fecha_sin_hora.strftime("%d/%m/%y")

@register.filter
#tipo: "01/01/91" (con hora)
def formato_fecha_basico_2(fecha):
    try:
        fecha = datetime.astimezone(fecha)
        return fecha.strftime("%x a las %H:%M")
    except:
        return fecha

