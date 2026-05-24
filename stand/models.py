from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError



class Vehicle(models.Model):

    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('vendido', 'Vendido'),
    ]

    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    ano = models.PositiveIntegerField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quilometragem = models.PositiveIntegerField()
    descricao = models.TextField(blank=True)
    estado = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponivel')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.ano})"

    class Meta:
        ordering = ['-criado_em']


class VehiclePhoto(models.Model):

    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='fotos')
    foto = models.ImageField(upload_to='vehicles/')
    ordem = models.PositiveIntegerField(default=0)  # para ordenar as fotos

    class Meta:
        ordering = ['ordem']


class TestDrive(models.Model):

    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('confirmado', 'Confirmado'),
        ('concluido', 'Concluído'),
        ('rejeitado', 'Rejeitado'),
        ('reagendado', 'Reagendado'),
    ]

    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='testdrives')
    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='testdrives')
    data_hora = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TestDrive de {self.utilizador.username} - {self.veiculo} ({self.estado})"

    class Meta:
        ordering = ['-criado_em']


class Purchase(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compras')
    veiculo = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='compra')
    data_compra = models.DateTimeField(auto_now_add=True)

    def clean(self):

        if self.veiculo.estado == 'vendido' and not self.pk:
            raise ValidationError('Este veículo já não está disponível para venda.')

    def save(self, *args, **kwargs):
        self.full_clean()
        self.veiculo.estado = 'vendido'
        self.veiculo.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.utilizador.username} comprou {self.veiculo}"

    class Meta:
        ordering = ['-data_compra']


class Review(models.Model):

    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reviews')
    classificacao = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comentario = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def clean(self):

        tem_testdrive = TestDrive.objects.filter(
            utilizador=self.utilizador,
            veiculo=self.veiculo,
            estado='concluido'
        ).exists()

        tem_compra = Purchase.objects.filter(
            utilizador=self.utilizador,
            veiculo=self.veiculo
        ).exists()

        if not tem_testdrive and not tem_compra:
            raise ValidationError(
                'Só pode avaliar um veículo após ter realizado um test-drive ou comprado o veículo.'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Review de {self.utilizador.username} - {self.veiculo} ({self.classificacao}★)"

    class Meta:
        ordering = ['-criado_em']
        unique_together = ['utilizador', 'veiculo']


class Favorite(models.Model):

    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favoritos')
    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='favoritos')
    adicionado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utilizador.username} ♥ {self.veiculo}"

    class Meta:
        ordering = ['-adicionado_em']
        unique_together = ['utilizador', 'veiculo']
