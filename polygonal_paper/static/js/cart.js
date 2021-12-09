$(document).ready(function () {
	var cart = $('.cart');
	var cartTitle = $('.js-cart-title');

	// Форматирование валюты
	var formatNumber = function (x) {
		return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ' ');
	}

	// Считаем сумму элемента корзины
	function getItemSubTotalPrice(input) {
		return Number(input.val()) * Number(input.attr('data-price'));
	}

	function recalculateCart() {
		var cartItems = $('.cart__item');
		var totalCartSum = 0;

		if ($('.cart__item').length === 0) {
			cartTitle.html('Корзина пуста');
			cart.hide();
		}

		cartItems.each(function (index, element) {
			var $this = $(this);
			var counter = $this.find('.counter__input');
			totalCartSum += getItemSubTotalPrice(counter);
		});

		$('#cart-total-price').html(formatNumber(totalCartSum));
	}

	recalculateCart();

	// Counter

	$('.counter__input').keypress(function (e) {
		e.preventDefault();
	});

	$('.js-counter-plus').on('click', function(e) {
		e.preventDefault();
		var $this = $(this).closest('.counter');
		var $input = $this.find('input');
		var i = $input.val();
		var subTotalPrice = $this.closest('.cart__item').find('.js-sub-total'); // вынести в функцию getItemSubTotalPrice ???

		i++;

		if (i > 1) {
			$this.find('.js-counter-minus').prop('disabled', false);
		}

		$input.val(i);

		subTotalPrice.html(formatNumber(getItemSubTotalPrice($input))); // вынести в функцию getItemSubTotalPrice ???
		recalculateCart();
	});

	$('.js-counter-minus').on('click', function(e) {
		e.preventDefault();
		var $this = $(this).closest('.counter');
		var	$input = $this.find('input');
		var d = $input.val();
		var subTotalPrice = $this.closest('.cart__item').find('.js-sub-total'); // вынести в функцию getItemSubTotalPrice ???

		if (d > 1) {
			d--;
			$input.val(d);
			subTotalPrice.html(formatNumber(getItemSubTotalPrice($input))); // вынести в функцию getItemSubTotalPrice ???
			recalculateCart();
		} else {
			$this.find('.js-counter-minus').prop('disabled', true);
		}
	});

	$('.js-cart-item-remove').on('click', function () {
		var	$this = $(this);

		$this.closest('.cart__item').remove();
		recalculateCart();
	});

	/// ------ ЗАКАЗ ------ ///

	// Начальны шаг
	var currentStep = 0;

	function makeStepOpen(step) {
		step.find('.order-step__edit').slideDown(300);
		//step.find('.order-step__footer').slideDown(300);
	}

	function makeStepEdited(step) {
		step.find('.order-step__edit').slideUp(300);
		step.find('.order-step__info').slideDown(300);
	}

	// Показываем следующий/предыдущий шаг
	function showStep(n) {
		var step = $('.order-step');
		makeStepOpen(step.eq(n));
		step.eq(n).addClass('order-step--opened').removeClass('order-step--edited');
	}

	function checkStepParams(id) {
		switch(id) {
			case '1':
				makeStepEdited($('[data-order-step-id=' + id + ']'));
				$('[data-order-step-id=' + id + ']').addClass('order-step--edited');
				break;
			case '2':
				makeStepEdited($('[data-order-step-id=' + id + ']'));
				$('[data-order-step-id=' + id + ']').addClass('order-step--edited');
				// проверить валидацию
				break;
			case '3':
				makeStepEdited($('[data-order-step-id=' + id + ']'));
				$('[data-order-step-id=' + id + ']').addClass('order-step--edited');
				// проверить валидацию
				break;
			case '4':
				makeStepEdited($('[data-order-step-id=' + id + ']'));
				$('[data-order-step-id=' + id + ']').addClass('order-step--edited');
				// проверить валидацию

				// Показываем кнопку
				$('.order__footer').slideDown(300);
				break;
			case '5':
				makeStepEdited($('[data-order-step-id=' + id + ']'));
				$('[data-order-step-id=' + id + ']').addClass('order-step--edited');

				// проверить валидацию
				break;
		}
	}

	// Сделать шаг
	function makeStep(n) {
		var step = $('.order-step');
		var stepID = step.eq(currentStep).attr('data-order-step-id');

		checkStepParams(stepID);
		currentStep = currentStep + n;

		// Функция показывающая текущий шаг
		showStep(currentStep);
	}

	// Проверка заполнения адреса в шаге 2

	$('.js-input-location').on('input', function () {
		var $this = $(this);
		var nextBtn = $this.closest('.order-step').find('.js-cart-next');

		if(!$(this).val()) {
			nextBtn.prop('disabled', true);
		} else {
			nextBtn.prop('disabled', false);
		}
	});

	// Переход на след. шаг

	$('.js-cart-next').on('click', function () {
		makeStep(1);
	});

	// Переход на пред. шаг

	$('.js-cart-prev').on('click', function () {
		makeStep(-1);
	});

	// Изменить шаг

	$('.js-cart-edit').on('click', function () {
		var $this = $(this);
		var step = $this.closest('.order-step');
		var stepID = step.attr('data-order-step-id');

		makeStepEdited($('[data-order-step-id=' + (currentStep + 1) + ']'));
		$('[data-order-step-id=' + (currentStep + 1) + ']').addClass('order-step--edited');

		currentStep = stepID - 1;
		makeStepOpen(step);
		step.removeClass('order-step--edited');
	});

	// Валидация / отправка формы

	$(".js-order-form").each(function () {

		$(this).validate({
			errorClass: 'invalid',
			validClass: 'success',
			ignore: ':hidden:not(:checkbox)',
			errorPlacement: function(error, element){},
			highlight: function( element, errorClass, validClass ) {
				$(element).addClass(errorClass).removeClass(validClass);
				$(element).closest(".js-form-select").parent().find('.form-select').addClass(errorClass).removeClass(validClass);
			},
			unhighlight: function( element, errorClass, validClass ) {
				$(element).removeClass(errorClass).addClass(validClass);
				$(element).closest(".js-form-select").parent().find('.form-select').removeClass(errorClass).addClass(validClass);
			},

			submitHandler: function (form) {
				$.ajax({
					url: form.action,
					type: form.method,
					data: $(form).serializeArray(),
					success: function() {
						console.log('SUCCESS!')
					},
					error: function () {
						console.log('ERROR!')
					}
				});
			}
		});
	});
});