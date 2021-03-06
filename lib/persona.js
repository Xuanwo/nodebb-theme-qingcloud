"use strict";

/*globals config, utils, NProgress*/

$(document).ready(function () {
    setupSlideMenu();

    function setupSlideMenu() {
        $('[data-toggle="slide-in"]').on('click', function (ev) {
            $('body').toggleClass('slide-in');

            if ($('body').hasClass('slide-in')) {
                var top = ($('html').scrollTop() || $('body').scrollTop()) + $('header-menu').height(),
                    transform = 'translate3d(0, ' + top + 'px, 0)';

                $('#header-menu').css({
                    '-webkit-transform': transform,
                    '-moz-transform': transform,
                    '-ms-transform': transform,
                    '-o-transform': transform,
                    'transform': transform
                });

                $('html').css('overflow-y', 'hidden');
            } else {
                $('body').one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function () {
                    $('#header-menu').css({
                        '-webkit-transform': 'none',
                        '-moz-transform': 'none',
                        '-ms-transform': 'none',
                        '-o-transform': 'none',
                        'transform': 'none'
                    });

                    $('html').css('overflow-y', '');
                });
            }
        });

        $(window).on('action:ajaxify.start', function () {
            if ($('body').hasClass('slide-in')) {
                $('.navbar-header button').click();
            }
            NProgress.set(0.7);
        });

        $(window).on('action:ajaxify.end', function () {
            NProgress.done();
            if (location.pathname === '/') {
                $('body').addClass('homepage');
            } else {
                $('body').removeClass('homepage');
            }
        });

        $(window).on('filter:taskbar.push', function (ev, data) {
            data.options.className = 'taskbar-' + data.module;

            if (data.module === 'composer') {
                data.options.icon = 'fa-plus';
            } else if (data.module === 'chat') {
                if (!data.element.length) {
                    createChatIcon(data);
                    $(window).one('action:taskbar.pushed', function (ev, data) {
                        updateChatCount(data.element);
                    });

                } else if (!data.element.hasClass('active')) {
                    updateChatCount(data.element);
                }
            }
        });


        function createChatIcon(data) {
            data.options.icon = 'fa-spinner fa-spin';

            $.getJSON(config.relative_path + '/api/user/' + utils.slugify(data.options.title), function (user) {
                var el = $('#taskbar [data-uuid="' + data.uuid + '"] a');
                el.find('i').remove();
                el.css('background-image', 'url(' + user.picture + ')');
            });
        }

        function updateChatCount(el) {
            var count = (parseInt($(el).attr('data-content'), 10) || 0) + 1;
            $(el).attr('data-content', count);
        }
    }

    function generateQrcode() {
        $('#js_pc_qr_code_img').html('');
        var host = window.location.origin;
        var path = window.location.pathname.replace(/(\/(category|topic)\/\w+\/)(.*)/, function ($0, $1) {
            return $1;
        });
        var url = host + path;
        $('#js_pc_qr_code_img').qrcode(url).attr('data-qrcode', url);
        // console.log(url);
    };

    $(window).on('action:ajaxify.end', function () {
        // HACK: popstate event seems not trigger
        generateQrcode();
    });
    generateQrcode();

    // Page pushing
    // refs: https://github.com/julianlam/nodebb-plugin-google-analytics/blob/master/lib/client.js
    $(window).on('action:ajaxify.end', function (ev, data) {
        if (window.ga) {
            window.ga('send', 'pageview', RELATIVE_PATH + '/' + data.url);
        }
    });

});
