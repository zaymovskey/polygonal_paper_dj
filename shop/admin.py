from django.contrib import admin
from .models import category, subcategory, item, item_photos, item_terms, item_files, discount, coupon
from adminsortable2.admin import SortableAdminMixin, SortableInlineAdminMixin
from django.contrib.auth.models import User, Group
import string
import random
from modeltranslation.admin import TranslationAdmin, TranslationStackedInline


@admin.action(description='Скопировать выбранные Купоны')
def dublicate(modeladmin, request, queryset):
    for object in queryset:
        object.id = None
        object.number = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        object.save()


class discount_admin(TranslationAdmin):
    save_as = True
    save_on_top = True


class coupon_admin(TranslationAdmin):
    readonly_fields = ('number', 'used')
    save_as = True
    save_on_top = True
    actions = [dublicate]


class item_files_admin(SortableInlineAdminMixin, TranslationStackedInline):
    model = item_files
    extra = 1


class item_terms_admin(SortableInlineAdminMixin, TranslationStackedInline):
    model = item_terms
    extra = 1


class item_photos_admin(SortableInlineAdminMixin, admin.StackedInline):
    model = item_photos
    extra = 1
    exclude = ('image_800',)
    readonly_fields = ('display_image',)
    exclude = ('main_photo_popup', 'main_photo_xs2', 'main_photo_xxl', 'main_photo_xs')


class subcategory_admin(SortableAdminMixin, TranslationAdmin):
    save_as = True
    save_on_top = True


class category_admin(SortableAdminMixin, TranslationAdmin):
    save_as = True
    save_on_top = True


class item_admin(SortableAdminMixin, TranslationAdmin):
    search_fields = ['name']
    list_display = ('name', 'category', 'is_active')
    inlines = [item_photos_admin, item_terms_admin, item_files_admin]
    readonly_fields = ('display_main_image', 'display_bottom_image', 'views')
    exclude = (
    'main_photo_popup', 'main_photo_xs2', 'main_photo_xxl', 'main_photo_xs', 'bottom_photo_xs2', 'bottom_photo_xxl',
    'bottom_photo_xs')
    save_on_top = True
    save_as = True
    ordering = ('order',)

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields = fields[-1:] + fields[:-1]
        return fields


admin.site.register(item, item_admin)
admin.site.register(category, category_admin)
admin.site.register(subcategory, subcategory_admin)
admin.site.register(discount, discount_admin)
admin.site.register(coupon, coupon_admin)
admin.site.unregister([User, Group])
