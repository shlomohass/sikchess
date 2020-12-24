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
            height: 1, // 0 - 1 percentage

            //UI Events:
            uiEvents: {
                onInit: function() {
                    console.log("init done", this);
                }
            },
            //Chess Events:
            chessEvents: {
                onPlace: function() {
                    console.log("place event", this);
                },
                onMove: function() {
                    console.log("move event", this);
                },
                onCapture: function() {
                    console.log("capture event", this);
                }
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
            // name : {
            //     ele     : $(tile),
            //     placed  : null,
            //     piece   : null,
            //     highlighted : false
            // }
        }
        let pieces = [
            'wk', 'wq', 'wn', 'wb', 'wr', 'wp',
            'bk', 'bq', 'bn', 'bb', 'br', 'bp'
        ];
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
                                    ev.trigger, { m: "Event `" + ev.trigger + "`: fired on control `" + gutter + "/" + control + "`." },
                                    debug
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
        };
        /******************************  PRIVATE METHODS - CHESS *****************************/
        let placePiece = function(piece, tile, capture = true) {
            let pieceName = typeof piece !== 'string' ? $(piece).data("name") : piece;
            if (tiles.hasOwnProperty(tile)) {
                if (pieces.includes(pieceName)) {
                    if (!capture && tiles[tile].placed) {
                        debug(" Notice `placePiece`: can't place tile is occupied.");
                    } else if (capture && tiles[tile].placed) {
                        console.log("do capture");
                    } else {
                        if (typeof piece === 'string') {
                            //Create new:
                            tiles[tile].piece = $("<div class='chess-piece'></div>").addClass("piece-" + pieceName).data("name", pieceName);
                            tiles[tile].placed = pieceName;
                            tiles[tile].ele.append(tiles[tile].piece);
                        } else {
                            //Detach and place:
                            tiles[tile].placed = pieceName;
                            tiles[tile].ele.append($(piece).detach());
                        }
                        return true;
                    }
                } else {
                    debug(" Error `placePiece`: unknown piece name.");
                }
            } else {
                debug(" Error `placePiece`: unknown tile name.");
            }
            return false;
        };

        /******************************  PRIVATE METHODS - HELPERS *****************************/
        let _tileName = function(c, r) {
            if (typeof c === 'string')
                return {
                    c: c.charCodeAt(0) - 96,
                    r: parseInt(c[1])
                };
            return String.fromCharCode(96 + c) + r;
        };

        /******************************  PRIVATE METHODS - GENERAL *****************************/
        let debug = function(message) {
            if (plugin.settings.debug) {
                if (typeof message === 'string')
                    console.log("Debug (" + myname + ") message: " + message);
                else
                    console.log("Debug (" + myname + ") message: " + message.data.m);
            }
        }

        /******************************  PUBLIC METHODS - HELPERS *****************************/
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
        };
        //Chess related:
        plugin.getPosition = function() {
            let fen = [];
            for (let r = 8; r > 0; r--) {
                let empty = 0;
                let row = ""
                for (let c = 1; c <= 8; c++) {
                    let tileName = _tileName(c, r);
                    if (tiles[tileName].placed) {
                        let fpiece = tiles[tileName].placed[0] === 'w' ? tiles[tileName].placed.toUpperCase()[1] : tiles[tileName].placed[1];
                        row += (empty ? empty : "") + fpiece;
                        empty = 0;
                    } else {
                        empty++;
                    }
                }
                row += (empty ? empty : "");
                fen.push(row);
            }
            return fen.join("/");
        }
        plugin.setPosition = function(fen) {
            console.log("setPosition", this);
        }

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
                    let tileName = _tileName(c, r);
                    tiles[tileName] = {
                        ele: $("<div class='board-tile bg-" + (bg ? "w" : "b") + "' data-name='" + tileName + "'></div>"),
                        placed: null,
                        piece: null,
                        highlighted: false
                    };
                    struct.tilesWrap.append(tiles[tileName].ele);
                    bg = !bg;
                }
                bg = !bg;
            }
            //Add structure:
            $element.append(struct.board);

            //Add Controls and events:
            plugin.rebuildControls('all');

            //Place pieces:
            placePiece("wr", "a1");
            placePiece("wn", "b1");
            placePiece("wb", "c1");
            placePiece("wq", "d1");
            placePiece("wk", "e1");
            placePiece("wb", "f1");
            placePiece("wn", "g1");
            placePiece("wr", "h1");

            placePiece("wp", "a2");
            placePiece("wp", "b2");
            placePiece("wp", "c2");
            placePiece("wp", "d2");
            placePiece("wp", "e2");
            placePiece("wp", "f2");
            placePiece("wp", "g2");
            placePiece("wp", "h2");

            placePiece("br", "a8");
            placePiece("bn", "b8");
            placePiece("bb", "c8");
            placePiece("bq", "d8");
            placePiece("bk", "e8");
            placePiece("bb", "f8");
            placePiece("bn", "g8");
            placePiece("br", "h8");

            placePiece("bp", "a7");
            placePiece("bp", "b7");
            placePiece("bp", "c7");
            placePiece("bp", "d7");
            placePiece("bp", "e7");
            placePiece("bp", "f7");
            placePiece("bp", "g7");
            placePiece("bp", "h7");

            setDimension();
            //Call callback:
            plugin.settings.uiEvents.onInit.call(this);

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