# Generated by Django 4.0.2 on 2022-04-30 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='material',
            name='cantidad',
            field=models.DecimalField(decimal_places=2, max_digits=8),
        ),
    ]
