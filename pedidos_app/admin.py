from django.contrib import admin
from django.contrib.admin.models import LogEntry
from .models import *

# Register your models here.

admin.site.register(Maestro)
admin.site.register(CostoMOD)
admin.site.register(CategoriaMateriales)
admin.site.register(ListaMateriales)
admin.site.register(Presupuesto)
admin.site.register(Cliente)
admin.site.register(Pedido)
admin.site.register(Trabajo)
admin.site.register(Material)
admin.site.register(Imposiciones)

