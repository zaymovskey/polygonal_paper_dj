from django.urls import path

from . import views

urlpatterns = [
    path('', views.index_view, name='index_view'),
    path('shop/cart/', views.cart_view, name='cart_view'),
    path('shop/add-to-cart/<slug:item_slug>/', views.add_to_cart_view, name='add_to_cart_view'),
    path('shop/', views.items_list_view, name='items_list_view'),
    path('shop/<slug:category_slug>/', views.category_items_view, name='category_items_view'),
    path('shop/<slug:category_slug>/<slug:subcategory_slug>/', views.category_subcategory_items_view,
         name='category_subcategory_items_view'),
    path('order/', views.order_view, name='order_view'),
    path('shop/<slug:category_slug>/<slug:subcategory_slug>/<slug:item_slug>/', views.item_view, name='item_view')
]
