# Generated by Django 4.0.2 on 2022-06-25 03:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos_app', '0004_presupuesto_rentabilidad_presupuesto_subtotal_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='trabajo',
            name='total_simp',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='trabajo',
            name='total_trabajo',
            field=models.IntegerField(default=0),
        ),
    ]
