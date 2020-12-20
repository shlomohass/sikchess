/******************************************************************************/
// Created by: SIKTEC / SIKDEV.
// Release Version : 1.0 (initial)
// Creation Date: 2020-12-20
// Copyright 2020, SIKTEC / SIKDEV.
/******************************************************************************/

/*****************************      Changelog       ****************************
version:
    -> 1.0:
        * initial, development
*******************************************************************************/
(function($) {

    //The sikchess
    $.sikchess = function(element, options) {

        //Settings:
        let defaults = {

                foo: 'bar',

                //Events:
                onInit: function() {
                    console.log("init done", this);
                }

            }
            //Properties:
        let plugin = this;
        plugin.settings = {};
        let $element = $(element),
            _element = element;

        // Constructor method:
        plugin.init = function() {
            //Extend settings:
            plugin.settings = $.extend({}, defaults, options);

            //Initialize chess board:

            //Call callback:
            plugin.settings.onInit.call(this);

        }

        /******************************  PRIVATE METHODS  *****************************/
        plugin.getDimension = function() {
            console.log("getDimension", this);
        }

        /******************************  PUBLIC METHODS  *****************************/

        plugin.getPosition = function() {
            console.log("getPosition", this);
        }

        //Initiate:
        plugin.init();
    }

    /******************************  ATTACH SIKCHESS  *****************************/
    $.fn.sikchess = function(options) {
        return this.each(function() {
            // If plugin has not already been attached to the element
            if (undefined == $(this).data('sikchess')) {
                // create a new instance of the plugin
                var plugin = new $.sikchess(this, options);
                // Store ref of the object:
                $(this).data('sikchess', plugin);
            } else {
                console.log("Get the requested method and return")
            }
        });
    }

})(jQuery);