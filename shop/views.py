from django.shortcuts import render, get_object_or_404, redirect
from .models import category, subcategory, item, discount, item_photos, item_basket


def index_view(request):
    return render(request, 'index.html', {})


def items_list_view(request):
    first_category = category.objects.first()
    if first_category:
        return redirect('category_items_view', first_category.slug)
    items = item.objects.all()
    content = {
        'items': items
    }
    return render(request, 'catalog.html', content)


def category_items_view(request, category_slug):
    categories = category.objects.all()
    items = item.objects.filter(category__category__slug=category_slug)
    subcategories = subcategory.objects.filter(category__slug=category_slug)
    content = {
        'category_slug': category_slug,
        'subcategories': subcategories,
        'categories': categories,
        'items': items
    }
    return render(request, 'catalog.html', content)


def category_subcategory_items_view(request, category_slug, subcategory_slug):
    categories = category.objects.all()
    items = item.objects.filter(category__slug=subcategory_slug)
    subcategories = subcategory.objects.filter(category__slug=category_slug)
    content = {
        'category_slug': category_slug,
        'subcategories': subcategories,
        'categories': categories,
        'items': items
    }
    return render(request, 'catalog.html', content)


def cart_view(request):
    items = item_basket.objects.filter(session_key=request.session.session_key)
    content = {
        'items': items
    }
    return render(request, 'cart.html', content)


def add_to_cart_view(request, item_slug, amount=1):
    current_item = item.objects.get(slug=item_slug)
    cart_item = item_basket.objects.filter(item__slug=item_slug)
    if not cart_item:
        cart_item = item_basket(session_key=request.session.session_key, item=current_item, amount=amount)
        cart_item.save()
    return redirect('cart_view')


def item_view(request, category_slug, subcategory_slug, item_slug):
    subcategory_item = subcategory.objects.filter(slug=subcategory_slug).first()
    current_item = get_object_or_404(item, slug=item_slug, category=subcategory_item)
    item_images = item_photos.objects.filter(item=current_item)
    content = {
        'category_slug': category_slug,
        'subcategory_slug': subcategory_slug,
        'item_slug': item_slug,
        'item': current_item,
        'item_photos': item_images
    }
    return render(request, 'catalog-item.html', content)


def order_view(request):
    pass
