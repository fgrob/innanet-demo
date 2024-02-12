from django.db import models
from auditlog.registry import auditlog
from auditlog.models import AuditlogHistoryField

class Maestro(models.Model):

    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    #trabajos

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre + " " + self.apellido

        
class CostoMOD(models.Model): #tengo inicializar esta tabla 1 vez con los valores

    oficio = models.CharField(max_length=15)
    total_diario = models.IntegerField()    
    #trabajos

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.oficio

class Imposiciones(models.Model):

    total = models.IntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CategoriaMateriales(models.Model):
    categoria = models.CharField(max_length=50)
    #materiales
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.categoria

class ListaMateriales(models.Model):

    categoria = models.ForeignKey(CategoriaMateriales, related_name="materiales", on_delete=models.CASCADE)
    material = models.CharField(max_length=50)
    costo_neto = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    #asignaciones 

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.material + " (" + self.categoria.categoria + ")"

class Cliente(models.Model):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, null=True)
    celular = models.IntegerField(null=True)
    #pedidos

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre + " " + self.apellido
 
#--------Tablas de esqueleto programa:

class Presupuesto(models.Model):
    #el presupuesto y sus valores son siempre es unitarios

    porcentaje_gastos_generales = models.DecimalField(max_digits=7, decimal_places=4, default=0)
    otros_gastos = models.IntegerField(default=0)
    porcentaje_utilidad = models.DecimalField(max_digits=23, decimal_places=20, default=0)
    notas_presupuesto = models.TextField(blank=True, default='')
    #trabajos
    #materiales
    #pedido (one to one)

    total_costos = models.IntegerField(default=0)
    subtotal = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    rentabilidad = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_trabajos_simp(self):
        try:
            total_trabajos_simp = 0
            for trabajos in self.trabajos.all():
                total_trabajos_simp += trabajos.total_simp
            return total_trabajos_simp
        except:
            return 0
    
    @property
    def total_trabajos(self): #con imposiciones
        try:
            total_trabajos = 0
            for trabajos in self.trabajos.all():
                total_trabajos += trabajos.total_trabajo
            return total_trabajos
        except:
            return 0
    
    @property
    def total_materiales(self): 
        try:
            total_materiales = 0
            for materiales in self.materiales.all():
                total_materiales += materiales.total_material
            return total_materiales
        except:
            return 0

    #la cantidad de trabajos terminados la uso en la hoja producción, para saber si mostrar el boton cerrar presupuesto:        
    @property
    def trabajos_terminados(self):
        trabajos_terminados = 0
        for trabajo in self.trabajos.all():
            if trabajo.status_trabajo == '1':
                trabajos_terminados += 1

        return trabajos_terminados

    def __str__(self):
        return "Presupuesto (Pedido ID " + str(self.id) + ")"

    
class Trabajo(models.Model):

    STATUS_TRABAJO = (
        ('0', 'Pendiente'),
        ('1', 'Terminado'),
    )

    STATUS_PAGO = (
        ('0', 'Pendiente'),
        ('1', 'Pagado'),
    )

    maestro_asociado = models.ForeignKey(Maestro, related_name="trabajos", on_delete=models.SET_NULL, null=True)
    tipo_trabajo = models.ForeignKey(CostoMOD, related_name="trabajos", on_delete=models.CASCADE, null=True)
    presupuesto_asociado = models.ForeignKey(Presupuesto, related_name="trabajos", on_delete=models.CASCADE)

    status_trabajo = models.CharField(max_length=10, choices=STATUS_TRABAJO, default='0')
    status_pago = models.CharField(max_length=10, choices=STATUS_PAGO, default='0')
    fecha_pago = models.DateTimeField(null=True, blank=True)

    costo_trabajo = models.IntegerField(default=0)
    dias_trabajo = models.DecimalField(max_digits=3, decimal_places=1)
    imposiciones = models.IntegerField(default=0)
    total_trabajo = models.IntegerField(default=0)      
    total_simp = models.IntegerField(default=0)
    total_pago = models.IntegerField(default=0)

    notas_trabajo = models.TextField(default='')

    fecha_asignacion = models.DateTimeField(null=True, blank=True)
    fecha_termino_trabajo = models.DateTimeField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    # @property
    # def total_simp(self):
    #     return int(self.dias_trabajo * self.costo_trabajo)  
    # @property
    # def total_trabajo(self):
    #     return int(self.dias_trabajo * (self.costo_trabajo + self.imposiciones))

    def __str__(self):
        return "OT  " + str(self.id) + " (Pedido ID " + str(self.presupuesto_asociado.id) + ")" + " - " + str(self.tipo_trabajo)
class Material(models.Model):

    cantidad = models.DecimalField(max_digits=8, decimal_places=2)
    costo_material = models.IntegerField(default=0)
    material_asignado = models.ForeignKey(ListaMateriales, related_name="asignaciones", on_delete=models.CASCADE)
    presupuesto_asociado = models.ForeignKey(Presupuesto, related_name="materiales", on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_material(self):
        return int(self.cantidad * self.costo_material)

    def __str__(self):
        return  str(self.material_asignado) + " (Pedido ID " + str(self.presupuesto_asociado.id) + ")"
        

class Pedido(models.Model):

    STATUS_PEDIDO = (
        ('0', 'Pendiente'),
        ('1', 'En revisión'),
        ('2', 'No confirmado'),
        ('3', 'Confirmado'),
        ('4', 'En fabricación'),    
        ('5', 'Terminado'),
        ('6', 'Anulado'),
    )

    producto = models.CharField(max_length=100)
    cantidad = models.IntegerField(default=1)
    medidas = models.CharField(max_length=60, null=True)
    madera = models.CharField(max_length=60, null=True)
    color = models.CharField(max_length=60, null=True)
    detalles_fabricacion = models.TextField(null=True, blank=True)
    detalles_pintura = models.TextField(null=True, blank=True)

    reserva_tienda = models.IntegerField(default=0) # 0 pedido normal, 1 pedido tienda cliente

    fecha_creacion = models.DateTimeField(null=True, blank=True)
    fecha_pdf = models.DateTimeField(null=True, blank=True)
    fecha_confirmacion = models.DateTimeField(null=True, blank=True)
    fecha_ingreso_fabrica = models.DateTimeField(null=True, blank=True)
    fecha_termino = models.DateTimeField(null=True, blank=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_PEDIDO, default='0')
    updated_at = models.DateTimeField(auto_now=True)

    cliente = models.ForeignKey(Cliente, related_name="pedidos", on_delete=models.SET_NULL, blank=True, null=True) #si se borrara el cliente, el presupuesto podría seguir existiendo. El valor del cliente sería Null
    presupuesto = models.OneToOneField(Presupuesto, related_name="pedido", on_delete=models.CASCADE, null=True)
    cuenta = models.IntegerField(default=0) #cuenta bancaria. 0 es tienda, 1 es fabrica
    abono_confirmacion = models.IntegerField(default=0) # revisión de abono. 1 Es revisado
    abono_cierre = models.IntegerField(default=0) # revisión de abono. 1 Es revisado

    def __str__(self):
        # return "Pedido ID " + str(self.id) + " - " + self.producto + " (" + self.cliente.nombre + " " + self.cliente.apellido + ")"
        return self.producto + " (Pedido ID " + str(self.id) + ") - " + self.cliente.nombre + " " + self.cliente.apellido


auditlog.register(Pedido)
auditlog.register(Presupuesto)
auditlog.register(Trabajo)
auditlog.register(Material)
auditlog.register(Cliente)
auditlog.register(ListaMateriales)
auditlog.register(CategoriaMateriales)
auditlog.register(CostoMOD)
auditlog.register(Maestro)







    
    





