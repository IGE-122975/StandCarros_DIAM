from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Vehicle, VehiclePhoto, TestDrive, Purchase, Review, Favorite, Lead


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class VehiclePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ['id', 'foto', 'ordem']


class VehicleSerializer(serializers.ModelSerializer):
    fotos = VehiclePhotoSerializer(many=True, read_only=True)
    media_classificacao = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    total_favoritos = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'marca', 'modelo', 'ano', 'preco', 'quilometragem',
            'descricao', 'estado', 'criado_em',
            'fotos', 'media_classificacao', 'total_reviews', 'total_favoritos'
        ]

    def get_media_classificacao(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.classificacao for r in reviews) / len(reviews), 1)

    def get_total_reviews(self, obj):
        return obj.reviews.count()

    def get_total_favoritos(self, obj):
        return obj.favoritos.count()


class TestDriveSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    veiculo_detalhe = VehicleSerializer(source='veiculo', read_only=True)
    veiculo = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), write_only=True
    )

    class Meta:
        model = TestDrive
        fields = [
            'id', 'utilizador', 'veiculo', 'veiculo_detalhe',
            'data_hora', 'estado', 'criado_em'
        ]
        # 'estado' é editável para o admin (via PUT) — controlado na view.
        # No create() ignoramos o estado vindo do cliente para evitar bypass.
        read_only_fields = ['criado_em']

    def create(self, validated_data):
        utilizador = self.context['request'].user
        # Cliente não pode definir o estado inicial — fica sempre 'pendente'
        validated_data.pop('estado', None)
        return TestDrive.objects.create(utilizador=utilizador, **validated_data)


class PurchaseSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    veiculo_detalhe = VehicleSerializer(source='veiculo', read_only=True)
    veiculo = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), write_only=True
    )

    class Meta:
        model = Purchase
        fields = ['id', 'utilizador', 'veiculo', 'veiculo_detalhe', 'data_compra']
        read_only_fields = ['data_compra']

    def create(self, validated_data):
        utilizador = self.context['request'].user
        return Purchase.objects.create(utilizador=utilizador, **validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    veiculo = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())

    class Meta:
        model = Review
        fields = ['id', 'utilizador', 'veiculo', 'classificacao', 'comentario', 'criado_em']
        read_only_fields = ['criado_em']

    def create(self, validated_data):
        utilizador = self.context['request'].user
        return Review.objects.create(utilizador=utilizador, **validated_data)


class FavoriteSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    veiculo_detalhe = VehicleSerializer(source='veiculo', read_only=True)
    veiculo = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'utilizador', 'veiculo', 'veiculo_detalhe', 'adicionado_em']
        read_only_fields = ['adicionado_em']

    def create(self, validated_data):
        utilizador = self.context['request'].user
        return Favorite.objects.create(utilizador=utilizador, **validated_data)


class LeadSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    veiculo_detalhe = VehicleSerializer(source='veiculo', read_only=True)
    veiculo = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), write_only=True
    )

    class Meta:
        model = Lead
        fields = [
            'id', 'utilizador', 'veiculo', 'veiculo_detalhe',
            'nome', 'email', 'telefone', 'mensagem',
            'estado', 'criado_em'
        ]
        # 'estado' é editável (só staff faz PUT — controlado na view).
        # Por defeito é 'novo' (do modelo), por isso POST anónimo continua a funcionar.
        read_only_fields = ['criado_em']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        # Estado inicial é sempre 'novo' — não permitir que o cliente o defina
        validated_data.pop('estado', None)
        return Lead.objects.create(utilizador=user, **validated_data)