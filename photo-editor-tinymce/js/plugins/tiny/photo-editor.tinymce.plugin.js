tinymce.PluginManager.add('ximage', function(editor) {

    // make editor html in string form & return
    function makeEditorHtml(uniq) {
        var result = '';

        // open main wrapper
        result += '<div class="editor-wrap" style="width: 820px;" id="editor-wrap-' + uniq + '">';

        // input file for selecting images
        result += '\
            <div class="f-row" style="clear: both; margin-bottom: 20px;">\
                <label for="file-' + uniq + '">Select file</label>\
                <input type="file" id="file-' + uniq + '"/>\
            </div>';

        // =open controls wrapper
        result += '<form action="#link" class="tools" style="float: left; margin-right: 20px;" id="tools-' + uniq + '">';
        // Brightness
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="brightness-' + uniq + '"/>\
                <label for="brightness-' + uniq + '">Brightness</label>\
                <div class="sub">\
                    <input data-id="brightness-' + uniq + '" type="range" min="-255" max="255" value="60"/>\
                </div>\
            </div>';
        // Contrast
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="contrast-' + uniq + '"/>\
                <label for="contrast-' + uniq + '">Contrast</label>\
                <div class="sub">\
                    <input data-id="contrast-' + uniq + '" type="range" min="-100" max="100" value="50"/>\
                </div>\
            </div>';
        // Desaturate
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="desaturate-' + uniq + '"/>\
                <label for="desaturate-' + uniq + '">Desaturate</label>\
            </div>';
        // Sepia
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="sepia-' + uniq + '"/>\
                <label for="sepia-' + uniq + '">Sepia</label>\
                <div class="sub">\
                    <input data-id="sepia-' + uniq + '" type="range" min="0" max="255" value="60"/>\
                </div>\
            </div>';
        // Sharpen
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="sharpen-' + uniq + '"/>\
                <label for="sharpen-' + uniq + '">Sharpen</label>\
                <div class="sub">\
                    <input data-id="sharpen-' + uniq + '" type="range" min="0" max="250" value="30"/>\
                </div>\
            </div>';
        // Blur
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="blur-' + uniq + '"/>\
                <label for="blur-' + uniq + '">Blur</label>\
                <div class="sub">\
                    <input data-id="blur-' + uniq + '" type="range" min="0" max="60" value="10"/>\
                </div>\
            </div>';
        // Opacity
        result += '\
            <div class="f-row">\
                <div class="label">Opacity</div>\
                <div class="sub">\
                    <input class="filter" id="opacity-' + uniq + '" type="range" value="1" min="0" max="1" step="0.1"/>\
                </div>\
            </div>';
        // Greyscale
        result += '\
            <div class="f-row">\
                <input type="checkbox" class="filter" id="greyscale-' + uniq + '"/>\
                <label for="greyscale-' + uniq + '">Greyscale</label>\
            </div>';
        // rotates
        result += '\
            <div class="f-row">\
                <button class="rotate btn" value="90">rotate 90 degrees</button>\
            </div>\
            <div class="f-row">\
                <button class="rotate btn" value="180">rotate 180 degrees</button>\
            </div>\
            <div class="f-row">\
                <button class="rotate btn" value="270">rotate 270 degrees</button>\
            </div>';
        // close controls wrapper
        result += '</form>';

        // canvas for image
        result += '<div class="editor-wrap" style="overflow: hidden; background: #ccc;"><canvas id="editor-' + uniq + '" class="editor" width="600" height="500"></canvas></div>';

        // close main wrapper
        result += '</div>';

        return result;
    }

    // build editor functionality
    function buildEditor(uniq) {
        var f          = fabric.Image.filters,
            editor_wr  = document.getElementById('editor-wrap-' + uniq),
            editor_img = editor.selection.getNode() ? editor.selection.getNode().src : false,
            result, obj;

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
        function handleFileSelect(e) {
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
                    return;
                }

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        obj.img_url = e.target.result;
                        obj.imageToCanvas();
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            } else {
                alert("Sorry! Your browser don't support this function! Please, update your browser");
            }
        }

        obj = {
            active: false,
            canvas: new fabric.Canvas('editor-' + uniq),
            img_url: false,
            img: false,
            btn_filters: editor_wr.querySelectorAll('.filter'),
            btn_rotate: editor_wr.querySelectorAll('.rotate'),
            init: function() {
                if (editor_img) {
                    this.img_url = editor_img;
                }
                this.selectFile();
                if (this.img_url) {
                    this.imageToCanvas();
                }
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
                    if (that.img) {
                        that.img.remove();
                    } else {
                        that.addEvents();
                    }
                    result.img = that.img = img;
                    result.canvas = that.canvas;
                    that.canvas.add(img);
                    that.canvas.renderAll();
                    that.canvas.setActiveObject(img);
                });
            },
            selectFile: function() {
                var my_input = editor_wr.querySelector('#file-' + uniq);

                if (my_input) {
                    my_input.addEventListener('change', handleFileSelect, false);
                    return true;
                } else {
                    return false;
                }
            },
            addEvents: function() {
                // filter buttons
                this.filters.events();
                // transform buttons
                this.transform.events();
            },
            // work with filters
            filters: {
                events: function() {
                    var that = obj;

                    fabric.util.toArray(that.btn_filters).forEach(function(el, id) {
                        var filter_name = el.id.replace('-' + uniq, ''),
                            my_level    = editor_wr.querySelector('[data-id="' + filter_name +'-' + uniq + '"]');

                        if (!that.filters[filter_name]) {
                            return;
                        }
                        el.addEventListener('change', function() {
                            if (that.filters[filter_name].init) {
                                that.filters[filter_name].init(id, this.checked);
                            } else {
                                that.filters[filter_name](id, this.checked);
                            }
                        }, false);


                        if (my_level) {
                            my_level.addEventListener('change', function() {
                                if (that.filters[filter_name].level && el.checked) {
                                    that.filters[filter_name].level(id);
                                }
                            }, false);
                        }
                    });
                },
                brightness: {
                    init: function(id, checked) {
                        applyFilter(id, checked && new f.Brightness({
                            brightness: parseInt(this.level_el.value, 10)
                        }));
                    },
                    level_el: editor_wr.querySelector('[data-id="brightness-' + uniq + '"]'),
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
                    level_el: editor_wr.querySelector('[data-id="contrast-' + uniq + '"]'),
                    level: function(id) {
                        applyFilterValue(id, 'saturation', parseInt(this.level_el.value, 10));
                    }
                },
                opacity: {
                    init: function() {
                        obj.img.setOpacity(parseFloat(this.level_el.value));
                        obj.canvas.renderAll();
                    },
                    level_el: editor_wr.querySelector('#opacity-' + uniq)
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
                    level_el: editor_wr.querySelector('[data-id="sepia-' + uniq + '"]'),
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
                    level_el: editor_wr.querySelector('[data-id="sharpen-' + uniq + '"]'),
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
                    level_el: editor_wr.querySelector('[data-id="blur-' + uniq + '"]'),
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

        obj.init();
        return result = {
            img: false
        };
    }

    // Add a button that opens a window
    editor.addButton('ximage', {
        text: 'X-image',
        icon: 'newdocument',
        onclick: function(e) {
            var uniq_id = new Date().getTime(),
                image;

            // Open window
            editor.windowManager.open({
                title: 'X-image plugin',
                body: {
                    type: 'container',
                    name: 'photo-editor',
                    html: makeEditorHtml(uniq_id)
                },
                onsubmit: function() {
                    // Insert content when the window form is submitted
                    editor.insertContent(editor.dom.createHTML('img', {
                        src: image.img.toDataURL()
                    }));
                }
            });

            image = buildEditor(uniq_id);
        }
    });

    // Adds a menu item to the tools menu
    /*editor.addMenuItem('ximage', {
        text: 'Photo editor plugin',
        context: 'tools',
        onclick: function() {
            // Open window with a specific url
            editor.windowManager.open({
                title: 'TinyMCE site',
                url: 'http://www.tinymce.com',
                width: 800,
                height: 600,
                buttons: [{
                    text: 'Close',
                    onclick: 'close'
                }]
            });
        }
    });*/
});