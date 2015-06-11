(function(global) {
    'use strict';

    var fabric = global.fabric || (global.fabric = {});

    /**
     * Saturation filter class
     * @class fabric.Image.filters.SepiaLevel
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.SepiaLevel#initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters/|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.SepiaLevel({
     *   sepialevel: 100
     * });
     * object.filters.push(filter);
     * object.applyFilters(canvas.renderAll.bind(canvas));
     */
    fabric.Image.filters.SepiaLevel = fabric.util.createClass(fabric.Image.filters.BaseFilter,
        {
            /**
             * Filter type
             * @param {String} type
             * @default
             */
            type: 'SepiaLevel',

            /**
             * Constructor
             * @memberOf fabric.Image.filters.SepiaLevel.prototype
             * @param {Object} [options] Options object
             * @param {Number} [options.sepialevel=0] Value to sepia the image up (0..100)
             */
            initialize: function(options) {
                options = options || {};
                this.sepialevel = options.sepialevel || 0;
            },

            /**
             * Applies filter to canvas element
             * @param {Object} canvasEl Canvas element to apply filter to
             */
            applyTo: function(canvasEl) {
                var context = canvasEl.getContext('2d'),
                    image_data = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                    data = image_data.data,
                    adjust = this.sepialevel / 100,
                    i_max = data.length, r, g, b;

                for(; i_max-=4;) {
                    r = data[i_max];
                    g = data[i_max + 1];
                    b = data[i_max + 2];

                    data[i_max] = Math.min(255, (r * (1 - (0.607 * adjust))) + (g * (0.769 * adjust)) + (b * (0.189 * adjust)));
                    data[i_max + 1] = Math.min(255, (r * (0.349 * adjust)) + (g * (1 - (0.314 * adjust))) + (b * (0.168 * adjust)));
                    data[i_max + 2] = Math.min(255, (r * (0.272 * adjust)) + (g * (0.534 * adjust)) + (b * (1 - (0.869 * adjust))));
                }

                context.putImageData(image_data, 0, 0);
            },

            /**
             * Returns object representation of an instance
             * @return {Object} Object representation of an instance
             */
            toObject: function() {
                return extend(this.callSuper('toObject'), {
                    sepialevel: this.sepialevel
                });
            }
        }
    );

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @return {fabric.Image.filters.SepiaLevel} Instance of fabric.Image.filters.SepiaLevel
     */
    fabric.Image.filters.SepiaLevel.fromObject = function() {
        return new fabric.Image.filters.SepiaLevel();
    };

})(typeof exports !== 'undefined' || this);