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

            height: 1, // 0 - 1 percentege

            //Events:
            onInit: function() {
                console.log("init done", this);
            }

        };
        //Structure:
        let struct = {
            board: null,
            tilesWrap: null,
            gutter: {
                top: null,
                bottom: null,
                left: null,
                right: null
            }
        };
        let tiles = {

        }

        //Properties:
        let plugin = this;
        plugin.settings = {};

        //Dom elements:
        let $element = $(element),
            $parent = $(element).parent(),
            _element = element;

        // Constructor method:
        plugin.init = function() {
            //Extend settings:
            plugin.settings = $.extend({}, defaults, options);

            //Initialize chess board:
            $element.addClass("chess-board");
            struct.board = $("<div class='board-wrap'></div>");
            struct.tilesWrap = $("<div class='tiles-wrap'></div>");
            struct.gutter.top = $("<div class='gutter-top'></div>");
            struct.gutter.right = $("<div class='gutter-right'></div>");
            struct.gutter.bottom = $("<div class='gutter-bottom'></div>");
            struct.gutter.left = $("<div class='gutter-left'></div>");
            struct.board.append(
                struct.gutter.left,
                struct.gutter.right,
                struct.gutter.top,
                struct.tilesWrap,
                struct.gutter.bottom
            );
            //Build tiles:
            let bg = true;
            for (let r = 8; r > 0; r--) {
                for (let c = 1; c <= 8; c++) {
                    let tileName = String.fromCharCode(96 + c) + r;
                    tiles[tileName] = $("<div class='board-tile bg-" + (bg ? "w" : "b") + "' data-name='" + tileName + "'></div>");
                    struct.tilesWrap.append(tiles[tileName]);
                    bg = !bg;
                }
                bg = !bg;
            }

            $element.append(struct.board);
            setDimension();
            //Call callback:
            plugin.settings.onInit.call(this);

        }

        /******************************  PRIVATE METHODS  *****************************/

        let setDimension = function() {
            let width = $parent.height() * plugin.settings.height;
            $element.css({ height: (plugin.settings.height * 100) + "%", width: width });
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