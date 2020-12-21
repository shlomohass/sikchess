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

        let myname = "sikchess";

        //Settings:
        let defaults = {
            debug: true,
            height: 1, // 0 - 1 percentege

            //Events:
            onInit: function() {
                console.log("init done", this);
            }

        };
        //Structure:
        let struct = {
            board: null,
            controls: {
                top: {

                },
                left: {

                },
                right: {
                    "refresh-board": {
                        element: $("<div><i class='mdi mdi-refresh'></i></div>"),
                        events: [{
                            trigger: "click",
                            handler: function(e) {
                                console.log("trigger refresh-", this, e.data);
                            }
                        }]
                    },
                    "toggle-arrows": {
                        element: $("<div><i class='mdi mdi-call-split'></i></div>"),
                        events: [{
                            trigger: "click",
                            handler: function(e) {
                                $(this).toggleClass("on");
                            }
                        }]
                    },
                    "flip-board": {
                        element: $("<div><i class='mdi mdi-rotate-90-degrees-ccw'></i></div>"),
                        events: [
                            { trigger: "click", handler: function(e) { console.log("trigger flip board -", this, e.data); } }
                        ]
                    },
                },
                bottom: {

                }
            },
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
        plugin.state = {
            toggleArrows: true
        };
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

            //Add Controls and events:
            plugin.rebuildControls('all');

            setDimension();
            //Call callback:
            plugin.settings.onInit.call(this);

        }

        /******************************  PRIVATE METHODS - GENERAL *****************************/

        let debug = function(mes) {
            if (plugin.settings.debug)
                console.log("Debug (" + myname + ") message: " + mes);
        }

        /******************************  PRIVATE METHODS - UI *****************************/
        let setDimension = function() {
            let width = $parent.height() * plugin.settings.height;
            $element.css({ height: (plugin.settings.height * 100) + "%", width: width });
        }
        let removeFromGutter = function(gutter, control_names = 'all', del = false) {
            if (struct.controls.hasOwnProperty(gutter)) {
                let names = control_names === 'all' ? Object.keys(struct.controls[gutter]) : control_names;
                names = typeof names === 'string' ? [control_names] : names;
                //Remove gutter controls:
                for (const control in struct.controls[gutter]) {
                    if (names.includes(control)) {
                        struct.controls[gutter][control].element.remove();
                        if (del) delete struct.controls[gutter][control];
                    }
                }
            } else {
                debug(" Error `resetGutter`: unknown gutter name.");
                return false;
            }
            return true;
        };
        let resetGutter = function(gutter) {
            return removeFromGutter(gutter, 'all', false);
        };
        let addToGutter = function(gutter, control_names = 'all') {
            if (struct.controls.hasOwnProperty(gutter)) {
                let names = control_names === 'all' ? Object.keys(struct.controls[gutter]) : control_names;
                names = typeof names === 'string' ? [control_names] : names;
                //Remove gutter controls:
                for (const control in struct.controls[gutter]) {
                    if (names.includes(control)) {
                        struct.gutter[gutter].append(
                            struct.controls[gutter][control].element.addClass('sikchess-control')
                        );
                        attachControlEvents(gutter, control);
                    }
                }
            } else {
                debug(" Error `addToGutter`: unknown gutter name.");
                return false;
            }
            return true;
        };
        let attachControlEvents = function(gutter, control_names = 'all') {
            if (struct.controls.hasOwnProperty(gutter)) {
                let names = control_names === 'all' ? Object.keys(struct.controls[gutter]) : control_names;
                names = typeof names === 'string' ? [control_names] : names;
                //Remove gutter controls:
                for (const control in struct.controls[gutter]) {
                    if (names.includes(control)) {
                        $.each(struct.controls[gutter][control].events, function(i, ev) {
                            struct.controls[gutter][control].element.bind(
                                ev.trigger, {
                                    [myname]: plugin
                                },
                                ev.handler
                            );
                            if (plugin.settings.debug) {
                                struct.controls[gutter][control].element.bind(
                                    debug("Event `" + ev.trigger + "`: fired on control `" + gutter + "/" + control + "`.")
                                );
                            }
                        });
                    }
                }
            } else {
                debug(" Error `attachControlEvents`: unknown gutter name.");
                return false;
            }
            return true;
        }


        /******************************  PUBLIC METHODS  *****************************/

        //Ui related:
        plugin.regControlElement = function(ele, name, gutter = "top") {
            let append = $(ele);
            if (struct.controls.hasOwnProperty(gutter)) {
                if (!struct.controls[gutter].hasOwnProperty(name)) {
                    struct.controls[gutter][name] = append;
                    return struct.controls[gutter][name];
                } else {
                    debug(" Error `addControl`: gutter control already set.");
                }
            } else {
                debug(" Error `addControl`: unknown gutter.");
            }
            return false;
        };
        plugin.regControlEvent = function(name, gutter, event, handler) {
            let append = $(ele);
        };
        plugin.rebuildControls = function(which = 'all') {
                gutters = which === 'all' ? Object.keys(struct.controls) : which;
                gutters = typeof gutters === 'string' ? [gutters] : gutters;
                $.each(gutters, function(i, g) {
                    if (resetGutter(g)) {
                        addToGutter(g, 'all')
                    }
                });
            }
            //Chess related:
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