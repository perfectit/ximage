(function() {
    function editor() {
        var f = fabric.Image.filters,
            obj = {
                active: false,
                canvas: new fabric.Canvas('editor'),
                img_url: 'images/koala-512x384.jpg',
                img: false,
                tools_form: document.getElementById('tools'),
                btn_filters: document.querySelectorAll('.filter'),
                btn_rotate: document.querySelectorAll('.rotate'),
                init: function() {
                    var that = this;

                    this.tools_form.reset();
                    fabric.Image.fromURL(this.img_url, function(img) {
                        if (this.active) {
                            return;
                        }
                        that.active = true;
                        img.set({
                            originX: 'center',
                            originY: 'center',
                            top: 44 + (img.height / 2),
                            left: 44 + (img.width / 2)
                        });
                        that.img = img;
                        that.canvas.add(img);
                        that.canvas.renderAll();
                        that.addEvents();
                        that.canvas.setActiveObject(img);
                    });

                    this.fromSelectFile();
                },
                deleteImg: function() {
                    this.img.remove();
                },
                fromSelectFile: function() {
                    var that = this,
                        my_input = document.getElementById('file'),
                        fail_input = document.getElementById('file-fail');

                    my_input.addEventListener('change', function(e) {
                        var files = e.target.files, // FileList object
                            f;

                        if (files) {
                            f = files[0];

                            if (!f) {
                                alert("Sorry! You don't select file! Please, try again");
                                return;
                            }

                            // Only process image files.
                            if (!f.type.match('image.*')) {
                                alert("Sorry! You don't select IMAGE! Please, try again");
                                return;
                            }

                            that.tools_form.reset();
                            that.deleteImg();
                            var reader = new FileReader();

                            // Closure to capture the file information.
                            reader.onload = (function(theFile) {
                                return function(e) {
                                    obj.img_url = e.target.result;
                                    obj.imageToCanvas();
                                };
                            })(f);

                            fail_input.innerHTML = this.value;
                            // Read in the image file as a data URL.
                            reader.readAsDataURL(f);
                        } else {
                            alert("Sorry! Your browser don't support this function! Please, update your browser");
                        }
                    }, false);
                },
                imageToCanvas: function() {
                    var that = this;

                    fabric.Image.fromURL(this.img_url, function(img) {
                        if (this.active) {
                            return;
                        }
                        that.active = true;
                        img.set({
                            originX: 'center',
                            originY: 'center',
                            top: ((that.canvas.getHeight() - img.height) / 2) + (img.height / 2),
                            left: ((that.canvas.getWidth() - img.width) / 2) + (img.width / 2)
                        });
                        that.img = img;
                        that.canvas.add(img);
                        that.canvas.renderAll();
                        that.canvas.setActiveObject(img);
                    });
                },
                addEvents: function() {
                    // filter buttons
                    this.filters.events();
                    // transform buttons
                    this.transform.events();
                },
                filters: {
                    events: function() {
                        var that = obj;

                        function initRangeStyle(obj, callback) {
                            var obj_min  = obj.getAttribute('data-min') ?
                                    parseFloat(obj.getAttribute('data-min')) : 0,
                                obj_max  = obj.getAttribute('data-max') ?
                                    parseFloat(obj.getAttribute('data-max')) : 100,
                                obj_step = obj.getAttribute('data-step') ?
                                    parseFloat(obj.getAttribute('data-step')) : null,
                                slider_wrap = obj.parentNode,
                                walls_count = slider_wrap.querySelectorAll('.wall'),
                                obj_init,
                                level_strip;

                            slider_wrap.className = 'slider-wrapper';

                            obj_init = new Powerange(obj, {
                                callback    : callback || function() {},
                                start       : obj.value,
                                hideRange   : true,
                                decimal     : true,
                                min         : obj_min,
                                max         : obj_max,
                                step        : obj_step
                            });

                            obj_init.handle.innerHTML = '<>';

                            fabric.util.toArray(walls_count).forEach(function(el) {
                                el.style.width =
                                    (((obj_max - obj_min) - (obj_max - obj.value)) /
                                        (obj_max - obj_min) * 100) + '%';
                            });

                            obj.addEventListener('change', function() {
                                fabric.util.toArray(walls_count).forEach(function(el) {
                                    el.style.width =
                                        (((obj_max - obj_min) - (obj_max - obj.value)) /
                                            (obj_max - obj_min) * 100) + '%';
                                });
                            }, false);

                            level_strip = obj_init.slider.querySelector('.range-quantity');
                            obj_init.slider.addEventListener('click', function(e) {
                                if (e.target === obj_init.slider ||
                                    e.target === level_strip) {
                                    var click_left = e.clientX - obj_init.slider.getBoundingClientRect().left,
                                        slider_w   = obj_init.slider.offsetWidth;

                                    obj_init.setValue((click_left > slider_w) ?
                                        slider_w : click_left, slider_w);
                                    if (click_left <= 0) {
                                        obj_init.setPosition(0);
                                    } else if (click_left >= obj_init.restrictHandleX) {
                                        obj_init.setPosition(obj_init.restrictHandleX);
                                    } else {
                                        obj_init.setPosition(click_left -
                                            (obj_init.handle.offsetWidth * (click_left/slider_w)));
                                    }
                                }
                            }, false);
                        }

                        fabric.util.toArray(that.btn_filters).forEach(function(el, id) {
                            var filter_name = el.id,
                                my_level    = document.querySelector('[data-id="' + filter_name +'"]');

                            if (!that.filters[filter_name]) {
                                return;
                            }

                            function applyFilter() {
                                if (that.filters[filter_name].init) {
                                    that.filters[filter_name].init(id, this.checked);
                                } else {
                                    that.filters[filter_name](id, this.checked);
                                }
                            }
                            if (el.getAttribute('data-min')) {
                                initRangeStyle(el, applyFilter);
                            } else {
                                el.addEventListener('change', applyFilter, false);
                            }


                            if (my_level) {
                                function applyLevel() {
                                    if (that.filters[filter_name].level && el.checked) {
                                        that.filters[filter_name].level(id);
                                    }
                                }

                                initRangeStyle(my_level, applyLevel);
                            }
                        });
                    },
                    brightness: {
                        init: function(id, checked) {
                            applyFilter(id, checked && new f.Brightness({
                                brightness: parseInt(this.level_el.value, 10)
                            }));
                        },
                        level_el: document.querySelector('[data-id="brightness"]'),
                        level: function(id) {
                            applyFilterValue(id, 'brightness', parseInt(this.level_el.value, 10));
                        }
                    },
                    contrast: {
                        init: function(id, checked) {
                            applyFilter(id, checked && new f.Saturation({
                                saturation: parseInt(this.level_el.value, 10)
                            }));
                        },
                        level_el: document.querySelector('[data-id="contrast"]'),
                        level: function(id) {
                            applyFilterValue(id, 'saturation', parseInt(this.level_el.value, 10));
                        }
                    },
                    opacity: {
                        init: function() {
                            obj.img.setOpacity(parseFloat(this.level_el.value));
                            obj.canvas.renderAll();
                        },
                        level_el: document.getElementById('opacity')
                    },
                    desaturate: function(id, checked) {
                        applyFilter(id, checked && new f.Saturation({
                            saturation: -100
                        }));
                    },
                    sepia: {
                        init: function(id, checked) {
                            applyFilter(id, checked && new f.SepiaLevel({
                                sepialevel: parseFloat(this.level_el.value, 10)
                            }));
                        },
                        level_el: document.querySelector('[data-id="sepia"]'),
                        level: function(id) {
                            applyFilterValue(id, 'sepialevel', parseFloat(this.level_el.value, 10));
                        }
                    },
                    sharpen: {
                        init: function(id, checked) {
                            var adjust = parseInt(this.level_el.value, 10) / 100;

                            applyFilter(id, checked && new f.Convolute({
                                matrix:
                                    [   0, -adjust, 0,
                                        -adjust, 4 * adjust + 1, -adjust,
                                        0, -adjust, 0
                                    ]
                            }));
                        },
                        level_el: document.querySelector('[data-id="sharpen"]'),
                        level: function(id) {
                            this.init(id, true);
                        }
                    },
                    blur: {
                        init: function(id, checked) {
                            var adjust = parseInt(this.level_el.value, 10);

                            applyFilter(id, checked && new f.GassianBlur({
                                radius: adjust
                            }));
                        },
                        level_el: document.querySelector('[data-id="blur"]'),
                        level: function(id) {
                            this.init(id, true);
                        }
                    },
                    greyscale: function(id, checked) {
                        applyFilter(id, checked && new f.Grayscale());
                    }
                },
                transform: {
                    events: function() {
                        var that = obj,
                            my_img;

                        fabric.util.toArray(that.btn_rotate).forEach(function(el) {
                            el.addEventListener('click', function(e) {
                                e.preventDefault();

                                my_img = that.canvas.getActiveObject();
                                my_img.set({
                                    angle: my_img.get('angle') + parseFloat(this.value)
                                });
                                that.canvas.renderAll();
                            }, false);
                        });
                    }
                }
            };

        function applyFilter(index, filter) {
            var my_img = obj.canvas.getActiveObject();
            if (!my_img) {
                return;
            }
            my_img.filters[index] = filter;
            my_img.applyFilters(obj.canvas.renderAll.bind(obj.canvas));
        }
        function applyFilterValue(index, prop, value) {
            var my_img = obj.canvas.getActiveObject();
            if (!my_img) {
                return;
            }
            if (my_img.filters[index]) {
                my_img.filters[index][prop] = value;
                my_img.applyFilters(obj.canvas.renderAll.bind(obj.canvas));
            }
        }

        obj.init();
    }

    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            editor();
        }
    }
})();