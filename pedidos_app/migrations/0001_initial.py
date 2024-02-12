# Generated by Django 4.0.2 on 2022-04-28 21:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CategoriaMateriales',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('apellido', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100, null=True)),
                ('celular', models.IntegerField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='CostoMOD',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('oficio', models.CharField(max_length=15)),
                ('total_diario', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Imposiciones',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='ListaMateriales',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('material', models.CharField(max_length=50)),
                ('costo_neto', models.IntegerField()),
                ('unidad_medida', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='materiales', to='pedidos_app.categoriamateriales')),
            ],
        ),
        migrations.CreateModel(
            name='Maestro',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('apellido', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Presupuesto',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('porcentaje_gastos_generales', models.DecimalField(decimal_places=4, default=0, max_digits=7)),
                ('otros_gastos', models.IntegerField(default=0)),
                ('porcentaje_utilidad', models.DecimalField(decimal_places=20, default=0, max_digits=23)),
                ('notas_presupuesto', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Trabajo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status_trabajo', models.CharField(choices=[('0', 'Pendiente'), ('1', 'Terminado')], default='0', max_length=10)),
                ('status_pago', models.CharField(choices=[('0', 'Pendiente'), ('1', 'Pagado')], default='0', max_length=10)),
                ('fecha_pago', models.DateTimeField(blank=True, null=True)),
                ('costo_trabajo', models.IntegerField(default=0)),
                ('dias_trabajo', models.DecimalField(decimal_places=1, max_digits=3)),
                ('imposiciones', models.IntegerField(default=0)),
                ('notas_trabajo', models.TextField(default='')),
                ('fecha_asignacion', models.DateTimeField(blank=True, null=True)),
                ('fecha_termino_trabajo', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('maestro_asociado', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='trabajos', to='pedidos_app.maestro')),
                ('presupuesto_asociado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trabajos', to='pedidos_app.presupuesto')),
                ('tipo_trabajo', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='trabajos', to='pedidos_app.costomod')),
            ],
        ),
        migrations.CreateModel(
            name='Pedido',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('producto', models.CharField(max_length=100)),
                ('cantidad', models.IntegerField(default=1)),
                ('medidas', models.CharField(max_length=60, null=True)),
                ('madera', models.CharField(max_length=60, null=True)),
                ('color', models.CharField(max_length=60, null=True)),
                ('detalles_fabricacion', models.TextField(blank=True, null=True)),
                ('detalles_pintura', models.TextField(blank=True, null=True)),
                ('fecha_creacion', models.DateTimeField(blank=True, null=True)),
                ('fecha_pdf', models.DateTimeField(blank=True, null=True)),
                ('fecha_confirmacion', models.DateTimeField(blank=True, null=True)),
                ('fecha_ingreso_fabrica', models.DateTimeField(blank=True, null=True)),
                ('fecha_termino', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('0', 'Pendiente'), ('1', 'En revisión'), ('2', 'No confirmado'), ('3', 'Confirmado'), ('4', 'En fabricación'), ('5', 'Terminado'), ('6', 'Anulado')], default='0', max_length=20)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cuenta', models.IntegerField(default=0)),
                ('cliente', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pedidos', to='pedidos_app.cliente')),
                ('presupuesto', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pedido', to='pedidos_app.presupuesto')),
            ],
        ),
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.IntegerField(default=0)),
                ('costo_material', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('material_asignado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='asignaciones', to='pedidos_app.listamateriales')),
                ('presupuesto_asociado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='materiales', to='pedidos_app.presupuesto')),
            ],
        ),
    ]
