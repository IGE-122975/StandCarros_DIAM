from django.contrib import admin
from .models import Vehicle, VehiclePhoto, TestDrive, Purchase, Review, Favorite, Lead


class VehiclePhotoInline(admin.TabularInline):
    model = VehiclePhoto
    extra = 1


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('marca', 'modelo', 'ano', 'preco', 'estado', 'criado_em')
    list_filter = ('estado', 'marca', 'ano')
    search_fields = ('marca', 'modelo')
    inlines = [VehiclePhotoInline]


@admin.register(TestDrive)
class TestDriveAdmin(admin.ModelAdmin):
    list_display = ('utilizador', 'veiculo', 'data_hora', 'estado', 'criado_em')
    list_filter = ('estado',)
    search_fields = ('utilizador__username', 'veiculo__marca', 'veiculo__modelo')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'veiculo', 'estado', 'criado_em')
    list_filter = ('estado',)
    search_fields = ('nome', 'email', 'veiculo__marca', 'veiculo__modelo')


admin.site.register(VehiclePhoto)
admin.site.register(Purchase)
admin.site.register(Review)
admin.site.register(Favorite)

