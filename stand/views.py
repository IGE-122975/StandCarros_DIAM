from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Vehicle, VehiclePhoto, TestDrive, Purchase, Review, Favorite, Lead
from .serializers import (
    VehicleSerializer, TestDriveSerializer, PurchaseSerializer,
    ReviewSerializer, FavoriteSerializer, UserSerializer, LeadSerializer
)

@ensure_csrf_cookie
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def csrf_view(request):
    """Garante que o cookie csrftoken existe no browser.
    O frontend chama este endpoint no arranque para poder fazer POSTs autenticados."""
    return Response({'msg': 'CSRF cookie definido.'})


@api_view(['POST'])
@authentication_classes([])
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
@authentication_classes([])
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

# VEHICLES

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

# TEST DRIVES

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
        from django.core.exceptions import ValidationError as DjangoValidationError
        serializer = TestDriveSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
            except DjangoValidationError as e:
                # Converte ValidationError do model.clean() para resposta REST
                return Response({'detail': '; '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
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
                # Atualiza o estado do veículo conforme o test-drive
                veiculo = testdrive.veiculo
                if novo_estado == 'confirmado' and veiculo.estado == 'disponivel':
                    veiculo.estado = 'reservado'
                    veiculo.save()
                elif novo_estado in ('rejeitado', 'concluido') and veiculo.estado == 'reservado':
                    # Liberta o carro se já não há outro test-drive confirmado
                    outros = TestDrive.objects.filter(
                        veiculo=veiculo, estado='confirmado'
                    ).exclude(pk=testdrive.pk).exists()
                    if not outros:
                        veiculo.estado = 'disponivel'
                        veiculo.save()

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

# PURCHASES

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

# REVIEWS

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

# FAVORITES

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

# LEADS (Pedidos de informação)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def leads(request):
    if request.method == 'GET':
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        qs = Lead.objects.all()
        veiculo_id = request.query_params.get('veiculo')
        estado = request.query_params.get('estado')
        if veiculo_id:
            qs = qs.filter(veiculo_id=veiculo_id)
        if estado:
            qs = qs.filter(estado=estado)
        serializer = LeadSerializer(qs, many=True)
        return Response(serializer.data)

    # POST — qualquer pessoa pode pedir informação
    # Anti-spam mínimo: bloquear leads duplicados do mesmo email/veículo nos últimos 5 minutos
    from datetime import timedelta
    from django.utils import timezone
    email = request.data.get('email', '').strip().lower()
    veiculo = request.data.get('veiculo')
    if email and veiculo:
        recente = Lead.objects.filter(
            email__iexact=email,
            veiculo_id=veiculo,
            criado_em__gte=timezone.now() - timedelta(minutes=5)
        ).exists()
        if recente:
            return Response(
                {'detail': 'Já enviaste um pedido para este veículo recentemente. Aguarda alguns minutos.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

    serializer = LeadSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def lead_detail(request, pk):
    if not request.user.is_staff:
        return Response({'msg': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
    lead = get_object_or_404(Lead, pk=pk)

    if request.method == 'PUT':
        serializer = LeadSerializer(lead, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    lead.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# PDF — Ficha técnica do veículo (xhtml2pdf — pura Python, sem dependências de sistema)

@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_pdf(request, pk):
    import io
    import os
    from django.conf import settings

    try:
        from xhtml2pdf import pisa
    except ImportError:
        return Response(
            {'msg': 'Geração de PDF indisponível: dependência opcional "xhtml2pdf" não instalada.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    veiculo = get_object_or_404(Vehicle, pk=pk)
    media = None
    reviews = veiculo.reviews.all()
    if reviews:
        media = round(sum(r.classificacao for r in reviews) / len(reviews), 1)

    html = render_to_string('stand/vehicle_pdf.html', {
        'veiculo': veiculo,
        'media': media,
        'total_reviews': reviews.count(),
    })

    # link_callback: traduz /media/... para o caminho absoluto no disco,
    # para o xhtml2pdf conseguir incluir a foto do carro no PDF
    def link_callback(uri, rel):
        if uri.startswith(settings.MEDIA_URL):
            path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, ''))
            if os.path.exists(path):
                return path
        return uri

    buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=buffer, link_callback=link_callback)
    if pisa_status.err:
        return Response({'msg': 'Erro ao gerar PDF.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = (
        f'inline; filename="ficha_{veiculo.marca}_{veiculo.modelo}_{veiculo.id}.pdf"'
    )
    return response
