from django.urls import path
from . import views

app_name = 'stand'

urlpatterns = [

    # ── Auth — igual ao padrão dos slides ─────
    path('api/csrf/', views.csrf_view),
    path('api/signup/', views.signup),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),
    path('api/user/', views.user_view),

    # ── Vehicles ──────────────────────────────
    path('api/vehicles/', views.vehicles),
    path('api/vehicles/<int:pk>/', views.vehicle_detail),
    path('api/vehicles/<int:pk>/photos/', views.upload_photo),

    # ── Test Drives ───────────────────────────
    path('api/testdrives/', views.testdrives),
    path('api/testdrives/<int:pk>/', views.testdrive_detail),

    # ── Purchases ─────────────────────────────
    path('api/purchases/', views.purchases),

    # ── Reviews ───────────────────────────────
    path('api/reviews/', views.reviews),
    path('api/reviews/<int:pk>/', views.review_detail),

    # ── Favorites ─────────────────────────────
    path('api/favorites/', views.favorites),
    path('api/favorites/<int:pk>/', views.favorite_detail),

    # ── Leads (Pedido de informação) ──────────
    path('api/leads/', views.leads),
    path('api/leads/<int:pk>/', views.lead_detail),

    # ── PDF — ficha técnica ───────────────────
    path('api/vehicles/<int:pk>/pdf/', views.vehicle_pdf),
]