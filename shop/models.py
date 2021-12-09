from django.db import models
import uuid
import os
from django.core.validators import FileExtensionValidator
from ckeditor.fields import RichTextField
from pytils.translit import slugify
from django.utils.html import format_html
from django.utils.functional import cached_property
from django_resized import ResizedImageField
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from io import BytesIO
import sys
import string
import random


def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    if ext == 'png' or ext == 'jpg' or ext == 'jpeg' or ext == 'svg':
        dir = 'images/'
    else:
        dir = 'files/'
    filename = "%s.%s" % (uuid.uuid4(), ext)
    return os.path.join(dir, filename)


def resize_img(f1, f2, fs):
    f1 = f2
    image1 = f1
    img1 = Image.open(image1)
    new_img1 = img1.convert('RGB')
    img_width = new_img1.size[0]
    img_height = new_img1.size[1]
    img_ratio = img_width / img_height
    size_ratio = fs[0] / fs[1]
    if img_ratio < size_ratio:
        resized_new_img1 = new_img1.resize((fs[0], int(fs[0] * img_height / img_width)), Image.ANTIALIAS)
        box = (
        0, (resized_new_img1.size[1] - fs[1]) / 2, resized_new_img1.size[0], (resized_new_img1.size[1] + fs[1]) / 2)
        resized_new_img1 = resized_new_img1.crop(box)
    elif img_ratio > size_ratio:
        resized_new_img1 = new_img1.resize((int(fs[1] * img_width / img_height), img_height), Image.ANTIALIAS)
        box = (
        (resized_new_img1.size[0] - fs[0]) / 2, 0, (resized_new_img1.size[0] + fs[0]) / 2, resized_new_img1.size[1])
        resized_new_img1 = resized_new_img1.crop(box)
    else:
        resized_new_img1 = new_img1.resize((fs[0], fs[1]), Image.ANTIALIAS)
    filestream1 = BytesIO()
    resized_new_img1.save(filestream1, 'JPEG', quality=80)
    filestream1.seek(0)
    name1 = f"{f1.name}"
    return InMemoryUploadedFile(
        filestream1, 'ImageField', name1, 'jpeg/image',
        sys.getsizeof(filestream1), None
    )


class category(models.Model):
    order = models.IntegerField('Порядок показа')
    is_active = models.BooleanField('Показывать на сайте', default=True)
    keywords = models.CharField('Ключевые слова', max_length=1000, blank=True)
    description = models.CharField('Описание', max_length=1000, blank=True)
    title = models.CharField('Заголовок', max_length=500)
    name = models.CharField('Название', max_length=300)
    slug = models.SlugField('URL', max_length=50, allow_unicode=True, blank=True,
                            help_text='URL генерируется автоматически из названия раздела, но может быть задан вручную',
                            unique=True)
    figure_size_heading = models.CharField('Заголовок размера фигуры', default='Размер фигуры', max_length=300)
    paper_size_heading = models.CharField('Заголовок размера бумаги', default='Размер бумаги', max_length=300)
    color_heading = models.CharField('Заголовок цвета', default='Цвет', max_length=300)
    difficulty_heading = models.CharField('Заголовок сложности', default='Сложность', max_length=300)
    time_heading = models.CharField('Заголовок времени сбора', default='Время сбора', max_length=300)
    paper_amount_heading = models.CharField('Заголовок количество листов', default='Количество листов', max_length=300)
    connected_items_heading = models.CharField('Заголовок товара в других категориях',
                                               default='Товар в других категориях', max_length=300)
    bottom_heading = models.CharField('Заголовок нижнего блока', default='Что с этим делать', max_length=300)
    delivery_heading = models.CharField('Заголовок доставки и оплаты', default='Доставка и оплата', max_length=300)
    other_models_heading = models.CharField('Заголовок других моделей', default='Другие модели', max_length=300)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Категории'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:50]
        else:
            self.slug = slugify(self.slug)[:50]
        super().save(*args, **kwargs)


class subcategory(models.Model):
    order = models.IntegerField('Порядок показа')
    is_active = models.BooleanField('Показывать на сайте', default=True)
    category = models.ForeignKey(category, on_delete=models.CASCADE, verbose_name='Категория')
    keywords = models.CharField('Ключевые слова', max_length=1000, blank=True)
    description = models.CharField('Описание', max_length=1000, blank=True)
    title = models.CharField('Заголовок', max_length=500)
    name = models.CharField('Название', max_length=300)
    slug = models.SlugField('URL', max_length=50, allow_unicode=True, blank=True,
                            help_text='URL генерируется автоматически из названия раздела, но может быть задан вручную',
                            unique=True)

    def __str__(self):
        return str(self.category) + ' — ' + self.name

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Подкатегории'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:50]
        else:
            self.slug = slugify(self.slug)[:50]
        super().save(*args, **kwargs)


class item(models.Model):
    order = models.IntegerField('Порядок показа')
    views = models.FloatField('Количество просмотров товара', null=True, blank=True)
    is_active = models.BooleanField('Показывать на сайте', default=True)
    keywords = models.CharField('Ключевые слова', max_length=1000, blank=True)
    description = models.CharField('Описание', max_length=1000, blank=True)
    title = models.CharField('Заголовок', max_length=500)
    slug = models.SlugField('URL', max_length=50, allow_unicode=True, blank=True,
                            help_text='URL генерируется автоматически из названия раздела, но может быть задан вручную',
                            unique=True)
    name = models.CharField('Название', max_length=500)
    category = models.ForeignKey(subcategory, on_delete=models.CASCADE, verbose_name='Категория')
    main_photo_xxl2 = ResizedImageField('Основное изображение', size=[2400, 1800], crop=['middle', 'center'],
                                        upload_to=get_file_path, quality=80,
                                        help_text='Формат файла: jpg, jpeg или png. Ограничение размера: 3 Мбайт.')
    main_photo_popup = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xs2 = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xxl = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xs = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    video_title = models.CharField('Заголовок видео-ссылки под слайдером', max_length=500, blank=True)
    video_link = models.CharField('Ссылка на видео под слайдером', max_length=500, blank=True)
    figure_size = models.CharField('Размеры фигуры', max_length=100, blank=True)
    paper_size = models.CharField('Размеры листа', max_length=100, blank=True)
    color = models.CharField('Цвет', max_length=500, blank=True)
    difficulty = models.CharField('Сложность', choices=[('1', 'Низкая'), ('2', 'Средняя'), ('3', 'Высокая')],
                                  max_length=100, blank=True)
    time = models.CharField('Время сборки', max_length=500, blank=True)
    paper_amount = models.CharField('Количество листов', max_length=500, blank=True)
    about = RichTextField('Текст справа', blank=True)
    connected_items = models.ManyToManyField('self', blank=True, verbose_name='Связанные товары')
    bottom_photo_xxl2 = ResizedImageField('Картинка для нижнего блока', size=[2400, 1800], crop=['middle', 'center'],
                                          upload_to=get_file_path, quality=80,
                                          help_text='Формат файла: jpg, jpeg или png. Ограничение размера: 3 Мбайт.',
                                          blank=True)
    bottom_photo_xs2 = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    bottom_photo_xxl = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    bottom_photo_xs = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    bottom_list = RichTextField('Список для нижнего блока', blank=True)
    bottom_link_title = models.CharField('Заголовок файла для нижнего блока', max_length=500, blank=True)
    bottom_link = models.FileField('Файл для нижнего блока', upload_to=get_file_path,
                                   validators=[FileExtensionValidator(['pdf'])],
                                   help_text='Формат файла: pdf. Ограничени размера: 1 Мбайт.', blank=True)
    bottom_text = RichTextField('Текст под нижним блоком', blank=True)
    price_rub = models.FloatField('Цена в рублях', null=True, blank=True)
    price_eur = models.FloatField('Цена в евро', null=True, blank=True)
    price_usd = models.FloatField('Цена в долларах', null=True, blank=True)
    weight = models.FloatField('Вес товара, кг', null=True, blank=True)
    length = models.FloatField('Длина, мм', null=True, blank=True)
    width = models.FloatField('Ширина, мм', null=True, blank=True)
    height = models.FloatField('Высота, мм', null=True, blank=True)
    __original_main_photo_xxl2 = None
    __original_bottom_photo_xxl2 = None

    def __init__(self, *args, **kwargs):
        super(item, self).__init__(*args, **kwargs)
        self.__original_main_photo_xxl2 = self.main_photo_xxl2
        self.__original_bottom_photo_xxl2 = self.bottom_photo_xxl2

    def __str__(self):
        return str(self.category) + ': ' + str(self.name)

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Товары'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.main_photo_xxl2 != self.__original_main_photo_xxl2:
            self.main_photo_popup = resize_img(self.main_photo_popup, self.main_photo_xxl2, [1600, 1200])
            self.main_photo_xs2 = resize_img(self.main_photo_xs2, self.main_photo_xxl2, [1536, 1152])
            self.main_photo_xxl = resize_img(self.main_photo_xxl, self.main_photo_xxl2, [1200, 900])
            self.main_photo_xs = resize_img(self.main_photo_xs, self.main_photo_xxl2, [768, 576])
        if self.bottom_photo_xxl2 != self.__original_bottom_photo_xxl2:
            self.bottom_photo_xs2 = resize_img(self.bottom_photo_xs2, self.bottom_photo_xxl2, [1536, 1152])
            self.bottom_photo_xxl = resize_img(self.bottom_photo_xxl, self.bottom_photo_xxl2, [1200, 900])
            self.bottom_photo_xs = resize_img(self.bottom_photo_xs, self.bottom_photo_xxl2, [768, 576])
        if not self.slug:
            self.slug = slugify(self.name)[:50]
        else:
            self.slug = slugify(self.slug)[:50]
        super().save(*args, **kwargs)

    @cached_property
    def display_main_image(self):
        return format_html('<img src="{img}" width="300">', img=self.main_photo_xxl2.url)

    display_main_image.short_description = 'Предпросмотр основного изображения'

    def display_bottom_image(self):
        return format_html('<img src="{img}" width="300">', img=self.bottom_photo_xxl2.url)

    display_bottom_image.short_description = 'Предпросмотр изображения нижнего блока'


class item_photos(models.Model):
    item = models.ForeignKey(item, on_delete=models.CASCADE)
    order = models.IntegerField('Порядок показа')
    main_photo_xxl2 = ResizedImageField('Картинка', size=[2400, 1800], crop=['middle', 'center'],
                                        upload_to=get_file_path, quality=80,
                                        help_text='Формат файла: jpg, jpeg или png. Ограничение размера: 3 Мбайт.')
    main_photo_popup = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xs2 = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xxl = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    main_photo_xs = models.ImageField(upload_to=get_file_path, blank=True, null=True)
    __original_main_photo_xxl2 = None

    def __init__(self, *args, **kwargs):
        super(item_photos, self).__init__(*args, **kwargs)
        self.__original_main_photo_xxl2 = self.main_photo_xxl2

    def __str__(self):
        return str(self.id)

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Изображения для слайдера'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.main_photo_xxl2 != self.__original_main_photo_xxl2:
            self.main_photo_popup = resize_img(self.main_photo_popup, self.main_photo_xxl2, [1600, 1200])
            self.main_photo_xs2 = resize_img(self.main_photo_xs2, self.main_photo_xxl2, [1536, 1152])
            self.main_photo_xxl = resize_img(self.main_photo_xxl, self.main_photo_xxl2, [1200, 900])
            self.main_photo_xs = resize_img(self.main_photo_xs, self.main_photo_xxl2, [768, 576])
        super().save(*args, **kwargs)

    @cached_property
    def display_image(self):
        return format_html('<img src="{img}" width="300">', img=self.main_photo_xxl2.url)

    display_image.short_description = 'Предпросмотр'


class item_terms(models.Model):
    item = models.ForeignKey(item, on_delete=models.CASCADE)
    order = models.IntegerField('Порядок показа')
    text = models.TextField('Текст пункта')

    def __str__(self):
        return str(self.id)

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Доставка и оплата'


class item_files(models.Model):
    item = models.ForeignKey(item, on_delete=models.CASCADE)
    order = models.IntegerField('Порядок показа')
    file = models.FileField('Файл', upload_to=get_file_path, validators=[FileExtensionValidator(['jpg', 'zip', 'pdf'])],
                            help_text='Формат файла: jpg, zip или pdf. Ограничени размера: 3 Мбайт.')

    def __str__(self):
        return str(self.id)

    class Meta:
        ordering = ['order']
        verbose_name = 'материал'
        verbose_name_plural = 'Схемы для отправки на почту'


class discount(models.Model):
    subcategory = models.ManyToManyField(subcategory, blank=True, verbose_name="Категории")
    item = models.ManyToManyField(item, blank=True, verbose_name="Товары")
    is_active = models.BooleanField('Активная', default=True)
    name = models.CharField('Название скидки', max_length=500)
    type = models.CharField('Тип', choices=[('1', 'Процент'), ('2', 'Валюта')], max_length=100, blank=True)
    amount = models.FloatField('Величина скидки', blank=True, null=True)
    starts = models.DateTimeField('Начало действия', blank=True, null=True)
    ends = models.DateTimeField('Окончание действия', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'материал'
        verbose_name_plural = 'Скидки'


class coupon(models.Model):
    subcategory = models.ManyToManyField(subcategory, blank=True, verbose_name="Категории")
    item = models.ManyToManyField(item, blank=True, verbose_name="Товары")
    is_active = models.BooleanField('Активная', default=True)
    name = models.CharField('Название купона', max_length=500)
    number = models.CharField('Номер купона (генерируется автоматически)', max_length=500, blank=True)
    usage = models.CharField('Возможность использования', choices=[('1', 'Одноразовый'), ('2', 'Многоразовый')],
                             max_length=100, blank=True)
    type = models.CharField('Тип', choices=[('1', 'Процент'), ('2', 'Валюта')], max_length=100, blank=True)
    amount = models.FloatField('Величина купона', blank=True, null=True)
    starts = models.DateTimeField('Начало действия', blank=True, null=True)
    ends = models.DateTimeField('Окончание действия', blank=True, null=True)
    used = models.BooleanField('Использован', default=False, blank=True)

    def save(self, *args, **kwargs):
        if self.number == '':
            self.number = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'материал'
        verbose_name_plural = 'Купоны'


class item_basket(models.Model):
    session_key = models.CharField('Ключ сессии', max_length=500, blank=True)
    item = models.ForeignKey(item, on_delete=models.CASCADE)
    amount = models.IntegerField('Количество', null=True)

    def __str__(self):
        return self.session_key

    class Meta:
        verbose_name = 'материал'
        verbose_name_plural = 'Список заказов'
