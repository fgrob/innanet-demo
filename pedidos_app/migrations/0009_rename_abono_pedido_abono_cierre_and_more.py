# Generated by Django 4.0.2 on 2022-07-05 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos_app', '0008_pedido_abono'),
    ]

    operations = [
        migrations.RenameField(
            model_name='pedido',
            old_name='abono',
            new_name='abono_cierre',
        ),
        migrations.AddField(
            model_name='pedido',
            name='abono_confirmacion',
            field=models.IntegerField(default=0),
        ),
    ]
