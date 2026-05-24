from django.urls import path
from . import views

app_name = 'stand'

urlpatterns = [


    path('api/signup/', views.signup),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),
    path('api/user/', views.user_view),
    path('api/vehicles/', views.vehicles),
    path('api/vehicles/<int:pk>/', views.vehicle_detail),
    path('api/vehicles/<int:pk>/photos/', views.upload_photo),
    path('api/testdrives/', views.testdrives),
    path('api/testdrives/<int:pk>/', views.testdrive_detail),
    path('api/purchases/', views.purchases),
    path('api/reviews/', views.reviews),
    path('api/reviews/<int:pk>/', views.review_detail),
    path('api/favorites/', views.favorites),
    path('api/favorites/<int:pk>/', views.favorite_detail),
]