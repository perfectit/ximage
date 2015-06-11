(function(global) {
    'use strict';

    var fabric = global.fabric || (global.fabric = {});

    /**
     * Saturation filter class
     * @class fabric.Image.filters.Saturation
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.Saturation#initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters/|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.Saturation({
     *   saturation: 100
     * });
     * object.filters.push(filter);
     * object.applyFilters(canvas.renderAll.bind(canvas));
     */
    fabric.Image.filters.Saturation = fabric.util.createClass(fabric.Image.filters.BaseFilter,
        {
            /**
             * Filter type
             * @param {String} type
             * @default
             */
            type: 'Saturation',

            /**
             * Constructor
             * @memberOf fabric.Image.filters.Saturation.prototype
             * @param {Object} [options] Options object
             * @param {Number} [options.saturation=0] Value to saturate the image up (-100..100)
             */
            initialize: function(options) {
                options = options || {};
                this.saturation = options.saturation || 0;
            },

            /**
             * Applies filter to canvas element
             * @param {Object} canvasEl Canvas element to apply filter to
             */
            applyTo: function(canvasEl) {
                var context = canvasEl.getContext('2d'),
                    image_data = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                    data = image_data.data,
                    adjust = this.saturation * -0.01,
                    i_max = data.length, r, g, b, max;

                for(; i_max-=4;) {
                    r = data[i_max];
                    g = data[i_max + 1];
                    b = data[i_max + 2];

                    max = Math.max(r, g, b);

                    if (r !== max) {
                        data[i_max] += (max - r) * adjust;
                    }
                    if (g !== max) {
                        data[i_max + 1] += (max - g) * adjust;
                    }
                    if (b !== max) {
                        data[i_max + 2] += (max - b) * adjust;
                    }
                }

                context.putImageData(image_data, 0, 0);
            },

            /**
             * Returns object representation of an instance
             * @return {Object} Object representation of an instance
             */
            toObject: function() {
                return extend(this.callSuper('toObject'), {
                    saturation: this.saturation
                });
            }
        }
    );

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @return {fabric.Image.filters.Saturation} Instance of fabric.Image.filters.Saturation
     */
    fabric.Image.filters.Saturation.fromObject = function() {
        return new fabric.Image.filters.Saturation();
    };

})(typeof exports !== 'undefined' || this);