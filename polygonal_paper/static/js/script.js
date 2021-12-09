function initYandexMap() {

	ymaps.ready(function () {
		var location = $('.js-location');
		var mainLocationLat = 56.837046;
		var mainLocationLong = 60.607428;
		var balloon = 'img/icons/icon-balloon.svg';
		var balloonHover = 'img/icons/icon-balloon--hover.svg';

		if (location.attr('data-lat') !== '') {
			mainLocationLat = JSON.parse(location.attr('data-lat'));
			mainLocationLong = JSON.parse(location.attr('data-long'));
		}

		var myMap = new ymaps.Map('map', {
				center: [mainLocationLat, mainLocationLong],
				zoom: 10,
				controls: ['zoomControl']
			}, {
				searchControlProvider: 'yandex#search'
			}),
			clusterer = new ymaps.Clusterer({
				preset: 'islands#invertedVioletClusterIcons',
/*				gridSize: 80,*/
				groupByCoordinates: false,
				clusterCursor: 'pointer',
				clusterOpenBalloonOnClick: false,
				clusterDisableClickZoom: false,
				clusterHideIconOnBalloonOpen: false,
				geoObjectHideIconOnBalloonOpen: false,
				clusterIconLayout: ymaps.templateLayoutFactory.createClass('<div class="custom-cluster-icon">{{ properties.geoObjects.length }}</div>')
			}),
			geoObjects = [];

		//myMap.behaviors.disable('scrollZoom');

		var balloonOptions = {
			iconLayout: 'default#image',
			iconImageHref: balloon,
			iconImageSize: [25, 32],
		}

		var balloonOptionsHover = {
			iconLayout: 'default#image',
			iconImageHref: balloonHover,
			iconImageSize: [25, 32],
		}

		$('.location-list__item').each(function (index) {
			var $this = $(this);
			var $id = $(this).attr('data-marker-id');
			var $lat = $this.attr('data-lat');
			var $long = $this.attr('data-long');

			var placemark = new ymaps.Placemark(JSON.parse('[' + $lat + ',' + $long + ']'), {
				id: $id
			}, balloonOptions);
			placemark.events.add('click', clickOnPlacemark);
			placemark.events.add('mouseenter', placemarkSetHover);
			placemark.events.add('mouseleave', placemarkSetDefault);
			geoObjects[index] = placemark;
		});

		function placemarkSetHover(e) {
			e.get('target').options.set(balloonOptionsHover);
		}

		function placemarkSetDefault(e) {
			e.get('target').options.set(balloonOptions);
		}

		clusterer.add(geoObjects);
		myMap.geoObjects.add(clusterer);

		myMap.setBounds(clusterer.getBounds(), {
			checkZoomRange: true
		});

		function clickOnPlacemark(e) {
			var tabletWidth = window.matchMedia("(min-width: 768px)");
			var placemark = e.get('target');
			var locationID = placemark.properties.get('id');
			var locationItem = $('.location__item');
			var locationListItem = $('.location-list__item');
			var locationListItemActive = $('[data-marker-id=' + locationID + ']');
			var locationListItemTopPosition = locationListItemActive.position().top;

			locationItem.removeClass('location__item--active');
			locationListItem.removeClass('location-list__item--active');
			locationListItemActive
				.addClass('location-list__item--active')
				.closest('.location__item').addClass('location__item--active');

			if (tabletWidth.matches) {
				$('.simplebar-content-wrapper').animate({scrollTop: locationListItemTopPosition});
			}
		}

		$('.js-location-toggle').on('click', function () {
			var tabletWidth = window.matchMedia("(min-width: 768px)");
			var $this = $(this);
			var location = $(this).closest('.location-list__item');
			var locationLat = JSON.parse(location.attr('data-lat'));
			var locationLong = JSON.parse(location.attr('data-long'));
			var locationItem = $('.location__item');
			var locationListItem = $('.location-list__item');
			var locationListItemActive = $this.closest('.location-list__item');

			locationItem.removeClass('location__item--active');
			locationListItem.removeClass('location-list__item--active');
			locationListItemActive
				.addClass('location-list__item--active')
				.closest('.location__item').addClass('location__item--active');

			myMap.panTo([locationLat, locationLong], {
				delay: 0,
			}).then(function () {
				myMap.setZoom(15);
			});
		});
	});
}

$(document).ready(function () {
	var widthSM = window.matchMedia("(min-width: 768px)");
	var widthMD = window.matchMedia("(min-width: 1024px)");
	var widthLG = window.matchMedia("(min-width: 1280px)");
	var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	
	if (iOS) {
		document.addEventListener('gesturestart', function (e) {
			e.preventDefault();
		});
	}
	
	function setDocHeight() {
		var vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
	};
	
	setDocHeight();
	
	addEventListener('resize', setDocHeight)
	addEventListener('orientationchange', setDocHeight)
	
	$('.js-currency-toggle').on('click', function () {
		var $this = $(this);
		$this.toggleClass('btn-currency--active')
	});
	
	$('.js-currency-change').on('click', function (e) {
		e.stopPropagation();
		var $this = $(this);
		var $btn = $this.closest('.btn-currency');
		$this.addClass('btn-currency__item--active');
		$btn.find('.btn-currency__symbol').text($(e.currentTarget).text());
		$this.siblings().removeClass('btn-currency__item--active');
		$btn.removeClass('btn-currency--active');
	});
	var pageHeader = $('.page-header');
	var pageHeaderTopHeight = $('.page-header__top').outerHeight();
	var menuToggle = $('.js-menu-toggle');
	var targetMenu = document.querySelector('.page-header__bottom');
	var prevScrollPosition = 0;
	
	function openMenu() {
		bodyScrollLock.disableBodyScroll(targetMenu);
		menuToggle.addClass('is-active');
		pageHeader.addClass('page-header--opened');
	}
	
	function closeMenu() {
		menuToggle.removeClass('is-active');
		pageHeader.removeClass('page-header--opened');
		bodyScrollLock.enableBodyScroll(targetMenu);
	}
	
	menuToggle.on('click', function () {
		var $this = $(this);
	
		$this.toggleClass('is-active');
	
		if ($this.hasClass('is-active')) {
			openMenu();
		} else {
			closeMenu();
		}
	});
	
	$(window).scroll(function () {
		if (widthMD.matches) {
			var currentScrollPosition = $(window).scrollTop();
	
			if (prevScrollPosition >= currentScrollPosition) {
				pageHeader.css('top', '0');
			} else {
				pageHeader.css('top', -pageHeaderTopHeight + 'px');
			}
	
			if (currentScrollPosition >= 0) {
				prevScrollPosition = currentScrollPosition;
			}
		}
	
		if (widthMD.matches && $('.order__body').length) {
			stickySectionCorrection(currentScrollPosition);
		}
	});
	
	function stickySectionCorrection(scrollPosition) {
		var $mainSection = $('.order__steps');
		var $stickySection = $('.order__aside');
		var $mainSectionPointOffset = $mainSection.offset().top;
		var $pageHeaderHeight =  $('.page-header__bottom').outerHeight(true);
	
		if (scrollPosition >= $mainSectionPointOffset) {
			$stickySection.css({'padding-top': $pageHeaderHeight + 24 + 'px'});
		} else {
			$stickySection.removeAttr('style');
		}
	}
	// POLYFILLS
	// Object fit IE
	$(function () { objectFitImages() });
	// SELECT 2
	
	$('.js-form-select').each(function () {
		var $this = $(this);
		var $placeholder = $(this).data('placeholder');
		var $customSelectOptions = {
			placeholder: $placeholder,
			containerCssClass: 'custom-select',
			dropdownCssClass: 'custom-dropdown',
			minimumResultsForSearch: Infinity,
			width: '100%'
		};
	
		if ($this.hasClass('form-select--size_small')) {
			$customSelectOptions = {
				placeholder: $placeholder,
				containerCssClass: 'custom-select custom-select--size_small',
				dropdownCssClass: 'custom-dropdown custom-dropdown--size_small',
				minimumResultsForSearch: Infinity,
				width: '100%'
			}
		}
	
		$this.select2($customSelectOptions);
	});
	
	// Hide select2 title
	
	$(document).on('mouseenter', '.select2-selection__rendered', function () {
		$(this).removeAttr('title');
	});
	// CATALOG SLIDER
	var catalogSliderInstances = [];
	
	
	function catalogSliderInit() {
	
		if ($('.js-catalog-slider').length) {
	
			$(".js-catalog-slider").each(function (index, element) {
				var $this = $(this);
				var catalogSliderParams = {
					direction: 'horizontal',
					slidesPerView: 1,
					spaceBetween: 24,
					watchOverflow: true,
					breakpoints: {
						768: {
							slidesPerView: 2,
						},
						1024: {
							slidesPerView: 3,
						},
						1280: {
							slidesPerView: 4,
						}
					},
					navigation: {
						prevEl: $this.parent().find(".swiper-button-prev")[0],
						nextEl: $this.parent().find(".swiper-button-next")[0]
					},
					pagination: {
						el: $this.find(".swiper-pagination")[0],
						type: 'bullets',
						clickable: true,
						hideOnClick: false
					}
				};
	
				if ($this.hasClass('catalog-slider--model')) {
					catalogSliderParams = {
						direction: 'horizontal',
						slidesPerView: 1,
						spaceBetween: 24,
						watchOverflow: true,
						breakpoints: {
							768: {
								slidesPerView: 2,
							},
							1024: {
								slidesPerView: 3,
							}
						},
						navigation: {
							prevEl: $this.parent().find(".swiper-button-prev")[0],
							nextEl: $this.parent().find(".swiper-button-next")[0]
						},
						pagination: {
							el: $this.find(".swiper-pagination")[0],
							type: 'bullets',
							clickable: true,
							hideOnClick: false
						}
					};
				}
	
				catalogSliderInstances[index] = new Swiper($this, catalogSliderParams);
			});
		}
	}
	
	catalogSliderInit();
	// Mobile slider
	var mobileSliderInstances = [];
	
	function mobileSliderInit() {
	
		if ($('.js-mobile-slider').length) {
	
			$(".js-mobile-slider").each(function (index, element) {
				var $this = $(this);
				var $swiper = this.swiper;
	
				if (widthSM.matches) {
					if ($swiper !== undefined && $swiper !== null) {
						$swiper.destroy(true, true);
					}
					$swiper = undefined;
				}
	
				if (!widthSM.matches) {
	
					if ($swiper === undefined || $swiper === null) {
						var $mobileSliderParams = {
							direction: 'horizontal',
							spaceBetween: 10,
							slidesPerView: 1,
							watchOverflow: true,
							pagination: {
								el: $this.find(".swiper-pagination")[0],
								type: 'bullets',
								clickable: true,
								hideOnClick: false
							}
						};
						mobileSliderInstances[index] = new Swiper($this, $mobileSliderParams);
					}
				}
			});
		}
	}
	
	mobileSliderInit();
	// Gallery slider
	
	var gallerySliderInstances = [];
	var galleryThumbsSliderInstances = [];
	
	function gallerySliderInit() {
	
		if ($('.js-g-slider').length) {
	
			$('.js-g-slider').each(function (index, element) {
				var $this = $(this);
	
				gallerySliderInstances[index] = new Swiper($this, {
					direction: 'horizontal',
					slidesPerView: 1,
					spaceBetween: 0,
					speed: 750,
					watchOverflow: true,
					navigation: {
						prevEl: $this.parent().find(".swiper-button-prev")[0],
						nextEl: $this.parent().find(".swiper-button-next")[0]
					},
					pagination: {
						el: $this.find(".swiper-pagination")[0],
						type: 'bullets',
						clickable: true,
						hideOnClick: false
					},
					thumbs: {
						slideThumbActiveClass: 'g-slider-thumbs__item--active',
						autoScrollOffset: 2,
						swiper: {
							el: $this.parent().find('.g-slider-thumbs')[0],
							slidesPerView: 6,
							spaceBetween: 24,
							watchOverflow: true,
							breakpoints: {
								768: {
									slidesPerView: 3,
									spaceBetween: 24,
								},
								1024: {
									slidesPerView: 6,
									spaceBetween: 24,
								}
							}
						}
					}
				});
			});
		}
	}
	
	gallerySliderInit();
	if ($('.d-slider').length > 0) {
	
		var dSliderImgInstances = [];
		var dSliderTextInstances = [];
	
		$(".js-d-slider-img").each(function (index) {
			var $this = $(this);
			var dSliderImgParams = {
				direction: 'horizontal',
				slidesPerView: 1,
				spaceBetween: 0,
				speed: 1250,
				watchSlidesProgress: true,
				watchOverflow: true,
				effect: 'fade',
				fadeEffect: {
					crossFade: true
				},
				controller: {
					by: 'slide',
				}
			};
	
			dSliderImgInstances[index] = new Swiper($this, dSliderImgParams);
		});
	
		$(".js-d-slider-text").each(function (index, element) {
			var $this = $(this);
			var dSliderTextParams = {
				direction: 'horizontal',
				slidesPerView: 1,
				spaceBetween: 0,
				speed: 1250,
				watchSlidesProgress: true,
				watchOverflow: true,
				controller: {
					by: 'slide',
				},
				navigation: {
					prevEl: $this.parent().find(".swiper-button-prev")[0],
					nextEl: $this.parent().find(".swiper-button-next")[0]
				},
				pagination: {
					el: $this.parent().find(".swiper-pagination")[0],
					type: 'bullets',
					clickable: true,
					hideOnClick: false
				}
			};
	
			dSliderTextInstances[index] = new Swiper($this, dSliderTextParams);
		});
	
	
		$(".js-d-slider-img").each(function (index, element) {
			var $swiper = this.swiper;
			$swiper.controller.control = dSliderTextInstances[index];
		});
	
		$(".js-d-slider-text").each(function (index, element) {
			var $swiper = this.swiper;
			$swiper.controller.control = dSliderImgInstances[index];
		});
	}
	var photoSliderInstances = [];
	
	function photoSliderInit() {
	
		if ($('.js-photo-slider').length) {
	
			$(".js-photo-slider").each(function (index, element) {
				var $this = $(this);
				var photoSliderParams = {
					direction: 'horizontal',
					spaceBetween: 0,
					slidesPerView: 1,
					watchOverflow: true,
					navigation: {
						prevEl: $this.parent().find(".swiper-button-prev")[0],
						nextEl: $this.parent().find(".swiper-button-next")[0]
					},
					pagination: {
						el: $this.find(".swiper-pagination")[0],
						type: 'bullets',
						clickable: true,
						hideOnClick: false
					}
				};
	
				if ($this.find('.swiper-slide').length > 1) {
					$this.addClass('photo-slider--pagination')
				}
				photoSliderInstances[index] = new Swiper($this, photoSliderParams);
			});
		}
	}
	
	photoSliderInit();
	$('.js-tabs-trigger').on('click', function () {
		var $this = $(this);
		var $tabID = $this.attr('data-tab');
		var $tabContent = $('[data-tab-content='+ $tabID +']');
		$this.addClass('tabs-list__item--active').siblings().removeClass('tabs-list__item--active');
		$tabContent.addClass('tabs-content--active').siblings().removeClass('tabs-content--active');
		$this.closest('.js-tabs').find('.js-tabs-select-trigger').val($tabID).trigger('change');
	})
	
	$('.js-tabs-select-trigger').on('change', function () {
		var $this = $(this);
		var $tabID = $this.val();
		var $tabContent = $('[data-tab-content='+ $tabID +']');
		$tabContent.addClass('tabs-content--active').siblings().removeClass('tabs-content--active');
		$this.closest('.js-tabs').find('[data-tab='+ $tabID +']').addClass('tabs-list__item--active').siblings().removeClass('tabs-list__item--active');
	});
	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}
	
	var $scrollBarWidth = getScrollbarWidth();
	
	if ($('[data-fancybox]').length) {
		$('[data-fancybox]').fancybox({
			baseClass: "photo-gallery",
			smallBtn: true,
			animationEffect: false,
			backFocus: false,
			idleTime: false,
			infobar: false,
	
			beforeShow: function () {
				$('.page-header').css('padding-right', $scrollBarWidth + 'px');
			},
	
			afterClose: function (instance, current) {
				$('.page-header').removeAttr('style');
			}
		});
	}
	// SIMPLEBAR
	var scrollBarInstances = [];
	$('.js-scrollbar').each(function(index, element){
		scrollBarInstances = new SimpleBar(element, {
			autoHide: false,
		});
	});
	// MAP INIT
	
	if ($("#map").length > 0) {
		initYandexMap();
	}
	var resizeTimer;
	
	$(window).on('resize', function (e) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			pageHeaderTopHeight = $('.page-header__top').outerHeight();
			mobileSliderInit();
		}, 250);
	});
	
	
	function locationIndentCorrection() {
		var containerWidth = $('.section__container').width();
		var windowWidth = $(window).width();
		var result = (windowWidth - containerWidth) / 2;
	
		if (widthLG.matches) {
			$('.location__info').css('padding-left', result + 'px');
		} else {
			$('.location__info').removeAttr('style');
		}
	}
	
	locationIndentCorrection();
	
	$(window).resize(function () {
		locationIndentCorrection();
	});
});