from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404

from .models import Vehicle, VehiclePhoto, TestDrive, Purchase, Review, Favorite
from .serializers import (
    VehicleSerializer, TestDriveSerializer, PurchaseSerializer,
    ReviewSerializer, FavoriteSerializer, UserSerializer
)


# ─────────────────────────────────────────────
# AUTH — igual ao padrão dos slides
# ─────────────────────────────────────────────

@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not username or not password:
        return Response({'msg': 'Username e password são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'msg': 'Username já existe.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username, password=password,
        email=email, first_name=first_name, last_name=last_name
    )
    return Response({'msg': 'Utilizador ' + user.username + ' criado com sucesso.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)  # cria a sessão
        return Response({
            'msg': 'Login efetuado com sucesso.',
            'username': user.username,
            'is_staff': user.is_staff
        })
    else:
        return Response({'msg': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def logout_view(request):
    logout(request)
    return Response({'msg': 'Logout efetuado com sucesso.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ─────────────────────────────────────────────
# VEHICLES
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
def vehicles(request):
    if request.method == 'GET':
        qs = Vehicle.objects.all()

        marca = request.query_params.get('marca')
        modelo = request.query_params.get('modelo')
        ano = request.query_params.get('ano')
        preco_min = request.query_params.get('preco_min')
        preco_max = request.query_params.get('preco_max')
        estado = request.query_params.get('estado')

        if marca:
            qs = qs.filter(marca__icontains=marca)
        if modelo:
            qs = qs.filter(modelo__icontains=modelo)
        if ano:
            qs = qs.filter(ano=ano)
        if preco_min:
            qs = qs.filter(preco__gte=preco_min)
        if preco_max:
            qs = qs.filter(preco__lte=preco_max)
        if estado:
            qs = qs.filter(estado=estado)

        serializer = VehicleSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_staff:
            return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def vehicle_detail(request, pk):
    veiculo = get_object_or_404(Vehicle, pk=pk)

    if request.method == 'GET':
        serializer = VehicleSerializer(veiculo)
        return Response(serializer.data)

    if not request.user.is_staff:
        return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = VehicleSerializer(veiculo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        veiculo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_photo(request, pk):
    if not request.user.is_staff:
        return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
    veiculo = get_object_or_404(Vehicle, pk=pk)
    foto = request.FILES.get('foto')
    if not foto:
        return Response({'msg': 'Nenhuma foto enviada.'}, status=status.HTTP_400_BAD_REQUEST)
    VehiclePhoto.objects.create(veiculo=veiculo, foto=foto)
    return Response({'msg': 'Foto adicionada.'}, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────
# TEST DRIVES
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testdrives(request):
    if request.method == 'GET':
        if request.user.is_staff:
            qs = TestDrive.objects.all()
        else:
            qs = TestDrive.objects.filter(utilizador=request.user)
        serializer = TestDriveSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = TestDriveSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def testdrive_detail(request, pk):
    testdrive = get_object_or_404(TestDrive, pk=pk)

    if request.method == 'GET':
        serializer = TestDriveSerializer(testdrive)
        return Response(serializer.data)

    if request.method == 'PUT':
        if not request.user.is_staff:
            return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)

        estado_anterior = testdrive.estado
        serializer = TestDriveSerializer(testdrive, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            novo_estado = serializer.data['estado']

            if novo_estado != estado_anterior:
                mensagens = {
                    'confirmado': 'O seu test-drive foi confirmado!',
                    'rejeitado': 'O seu test-drive foi rejeitado.',
                    'reagendado': 'O seu test-drive foi reagendado. Verifique a nova data.',
                    'concluido': 'O seu test-drive foi concluído. Pode agora deixar uma avaliação.',
                }
                mensagem = mensagens.get(novo_estado)
                if mensagem:
                    send_mail(
                        subject='Atualização do seu Test-Drive — AutoStand',
                        message=mensagem,
                        from_email='noreply@autostand.pt',
                        recipient_list=[testdrive.utilizador.email],
                        fail_silently=True,
                    )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# PURCHASES
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def purchases(request):
    if request.method == 'GET':
        if request.user.is_staff:
            qs = Purchase.objects.all()
        else:
            qs = Purchase.objects.filter(utilizador=request.user)
        serializer = PurchaseSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_staff:
            return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PurchaseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# REVIEWS
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
def reviews(request):
    if request.method == 'GET':
        veiculo_id = request.query_params.get('veiculo')
        qs = Review.objects.all()
        if veiculo_id:
            qs = qs.filter(veiculo_id=veiculo_id)
        serializer = ReviewSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'msg': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, pk):
    review = get_object_or_404(Review, pk=pk)
    if not request.user.is_staff and review.utilizador != request.user:
        return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# FAVORITES
# ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorites(request):
    if request.method == 'GET':
        qs = Favorite.objects.filter(utilizador=request.user)
        serializer = FavoriteSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = FavoriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def favorite_detail(request, pk):
    favorite = get_object_or_404(Favorite, pk=pk, utilizador=request.user)
    favorite.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
