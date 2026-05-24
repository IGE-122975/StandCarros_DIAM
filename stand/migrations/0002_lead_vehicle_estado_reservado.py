from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('stand', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Actualiza os choices do campo estado no Vehicle para incluir 'reservado'.
        # No SQLite, choices são apenas metadados (não criam restrições na BD),
        # mas a migração é necessária para manter código e base de dados sincronizados.
        migrations.AlterField(
            model_name='vehicle',
            name='estado',
            field=models.CharField(
                choices=[
                    ('disponivel', 'Disponível'),
                    ('reservado', 'Reservado'),
                    ('vendido', 'Vendido'),
                ],
                default='disponivel',
                max_length=20,
            ),
        ),

        # Cria a tabela Lead na base de dados.
        migrations.CreateModel(
            name='Lead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('telefone', models.CharField(blank=True, max_length=30)),
                ('mensagem', models.TextField()),
                ('estado', models.CharField(
                    choices=[('novo', 'Novo'), ('contactado', 'Contactado'), ('fechado', 'Fechado')],
                    default='novo',
                    max_length=20,
                )),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('utilizador', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='leads',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('veiculo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='leads',
                    to='stand.vehicle',
                )),
            ],
            options={
                'ordering': ['-criado_em'],
            },
        ),
    ]
