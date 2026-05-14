from django.contrib import admin
from .models import Vehicle, VehiclePhoto, TestDrive, Purchase, Review, Favorite

admin.site.register(Vehicle)
admin.site.register(VehiclePhoto)
admin.site.register(TestDrive)
admin.site.register(Purchase)
admin.site.register(Review)
admin.site.register(Favorite)

