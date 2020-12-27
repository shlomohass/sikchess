/******************************************************************************/
// Created by: SIKDEV.
// Release Version : 1.0.0
// Creation Date: 2020-12-25
// Copyright 2020, SIKDEV.
/******************************************************************************/
/*****************************      Changelog       ****************************
1.0.0:
    ->initial
*******************************************************************************/
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
    $.sikgraph = function(element, options) {

        let _myname = "sikgraph";

        //Settings:
        let _defaults = {
            debug: true,
            height: '100%', // 0 - 1 percentage
            width: '100%',
            //UI Events:
            uiEvents: {
                onInit: function() {
                    console.log("init done", this);
                },
                onNodeClick: [
                    function(graph) { console.log(this, graph); },
                ]
            },
            //Chess Events:
            chessEvents: {
                onBranch: function() {
                    console.log("place event", this);
                },
            }
        };
        //Structure:
        let _struct = {
            canvas: {
                ele: null,
                rows: []
            },
            parsed: {
                branches: {
                    //"name" : { el : SVG.G , col : 0, color: "#fff" }
                }
            }
        };
        let _pointer = {
            branch: null,
            node: null,
            row: 0
        };
        //Theme:
        let _theme = {
            color_picker: 0,
            colors: [
                "#555555", //Metro grey
                "#1b6eae", //Metro dark cyan
                "#f0a30a", //Metro amber
                "#a20025", //Metro crimson
                "#a4c400", //Metro lime
                "#647687", //Metro steel
                "#00aba9", //Metro teal
                "#fa6800", //Metro orange
                "#004050", //Metro dark teal
                "#4390df", //Metro lightblue
                "#00356a", //Metro cobalt
            ],
            text: {
                tags: {
                    color: "#fff",
                    size: 9
                }
            },
            node: {
                radius: 20,
                class: "branch-node"
            },
            grid: {
                start: { row: 20, col: 20 },
                steps: { row: 30, col: 50 }
            }
        };
        //Properties:
        let plugin = this,
            draw = null;
        plugin.settings = {};
        plugin.branches = _struct.parsed.branches;
        plugin.pointer = _pointer;

        //Dom elements:
        let $element = $(element),
            $parent = $(element).parent(),
            _element = element;

        /******************************  PRIVATE METHODS - UI *****************************/
        let _generateNode = function(txt, col, row, colorNode, colorText) {
            let joint = new SVG.G().addClass(_theme.node.class);
            joint.attr("graph-node", txt);
            joint.attr("node-to-branch", '');
            joint.circle(_theme.node.radius).fill(colorNode);
            joint.plain(txt).font('size', _theme.text.tags.size).fill(colorText).center(
                joint.first().cx(),
                joint.first().cy()
            );
            joint.each(function(i, e) {
                this.center(
                    col * _theme.grid.steps.col + _theme.grid.start.col,
                    row * _theme.grid.steps.row + _theme.grid.start.row
                );
            });
            let path = 'M' + joint.first().cx() + ',' + joint.first().cy() +
                ' l-' + (_theme.grid.steps.col - _theme.node.radius / 2 + 2) + ',0';
            if (col === 0) {
                path = 'M' + joint.first().cx() + ',' + joint.first().cy() + ' l-0,0';
            }
            joint.path(path).stroke({ width: 8, color: colorNode }).back();
            joint.find("circle, text").on("click", function(e) {
                for (let e = 0; e < plugin.settings.uiEvents.onNodeClick.length; e++) {
                    plugin.settings.uiEvents.onNodeClick[e].call(this, plugin);
                }
            });
            return joint;
        };

        /******************************  PRIVATE METHODS - CORE *****************************/
        let _shiftRows = function(assign, row) {
            if (_struct.canvas.rows[row]) {
                for (let r = row; r < _struct.canvas.rows.length; r++) {
                    _struct.canvas.rows[r].dy(_theme.grid.steps.row);
                }
                _struct.canvas.rows.splice(row, 0, assign);
            } else {
                _struct.canvas.rows[row] = assign;
            }
            assign.dy(row * _theme.grid.steps.row);
        }
        plugin.updateLinks = function() {
            let centers = {}
            for (let r = 0; r < _struct.canvas.rows.length; r++) {
                let row = _struct.canvas.rows[r];
                //get branches of this line:
                row.find("g").each(function(ele) {
                    if (ele.attr("node-to-branch").length) {
                        let startOf = _convertArray(ele.attr("node-to-branch"));
                        let startPoint = {
                            x: ele.findOne("circle").cx() + row.cx() - _theme.grid.steps.col,
                            y: ele.findOne("circle").cy() + row.cy()
                        };
                        for (let rec = 0; rec < startOf.length; rec++) {
                            centers[startOf[rec]] = startPoint;
                        }
                    }
                });
                //branch if needed
                let name = row.attr("graph-branch");
                if (r > 0 && centers[name]) {
                    let nodeCircle = row.findOne("circle");
                    let endX = nodeCircle.cx() + row.cx();
                    let endY = nodeCircle.cy() + row.cy();
                    //let newPath = _linkPath(centers[name].x, centers[name].y, endX, endY);
                    let newPath = _linkPath2(
                        lambdaStart = 0,
                        lambdaEnd = 1,
                        xAnchorStart = centers[name].x,
                        yAnchorStart = centers[name].y,
                        xHandleStart = Math.floor((endX - centers[name].x) / 2) + centers[name].x,
                        yHandleStart = centers[name].y,
                        xHandleEnd = Math.floor((endX - centers[name].x) / 2) + centers[name].x,
                        yHandleEnd = endY,
                        xAnchorEnd = endX,
                        yAnchorEnd = endY
                    );
                    _struct.draw.path(newPath).fill("transparent").stroke({
                        color: nodeCircle.fill(),
                        width: 7
                    }).back();
                    console.log(name, newPath);
                }
            }
        };
        /******************************  PRIVATE METHODS - HELPERS *****************************/
        let _getColor = function(c = -1) {
            if (c >= 0 && typeof _theme.colors[c] === 'string') {
                return _theme.colors[c];
            } else {
                if (typeof _theme.colors[_theme.color_picker] !== 'string')
                    _theme.color_picker = 0;
                return _theme.colors[_theme.color_picker++];
            }
        };
        let _linkPath = function(startX, startY, endX, endY) {
            // example of a path: M318,345 L330,345 C450,345 380,124 504,124 L519,124
            //M0 0 A60 230 0 0 1 32 32 A60 230 0 0 0 64 64
            // M
            let MX = startX;
            let MY = startY;

            let EX = endX;
            let EY = endY;
            let MidX = Math.floor((MX + EX) / 2);
            let MidY = Math.floor((MY + EY) / 2);

            //A
            let A = '30 40 0 0 ';

            // setting up the path string
            let path = 'M' + MX + ' ' + MY;
            path += ' A' + A + '1';
            path += ' ' + MidX + ' ' + MidY;
            path += ' A' + A + '0';
            path += ' ' + EX + ' ' + EY;
            return path;
        };

        let _linkPath2 = function(
            lambdaStart,
            lambdaEnd,
            xAnchorStart,
            yAnchorStart,
            xHandleStart,
            yHandleStart,
            xHandleEnd,
            yHandleEnd,
            xAnchorEnd,
            yAnchorEnd
        ) {
            var x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, path, txt;

            if (lambdaStart > 0.0) {
                x0 = xAnchorStart + lambdaStart * (xHandleStart - xAnchorStart);
                y0 = yAnchorStart + lambdaStart * (yHandleStart - yAnchorStart);
                x1 = xHandleStart + lambdaStart * (xHandleEnd - xHandleStart);
                y1 = yHandleStart + lambdaStart * (yHandleEnd - yHandleStart);
                x2 = xHandleEnd + lambdaStart * (xAnchorEnd - xHandleEnd);
                y2 = yHandleEnd + lambdaStart * (yAnchorEnd - yHandleEnd);

                x3 = x0 + lambdaStart * (x1 - x0);
                y3 = y0 + lambdaStart * (y1 - y0);
                x4 = x1 + lambdaStart * (x2 - x1);
                y4 = y1 + lambdaStart * (y2 - y1);

                xAnchorStart = x3 + lambdaStart * (x4 - x3);
                yAnchorStart = y3 + lambdaStart * (y4 - y3);
                xHandleStart = x4;
                yHandleStart = y4;
                xHandleEnd = x2;
                yHandleEnd = y2;
            }

            if (lambdaEnd < 1.0) {
                x0 = xAnchorStart + lambdaEnd * (xHandleStart - xAnchorStart);
                y0 = yAnchorStart + lambdaEnd * (yHandleStart - yAnchorStart);
                x1 = xHandleStart + lambdaEnd * (xHandleEnd - xHandleStart);
                y1 = yHandleStart + lambdaEnd * (yHandleEnd - yHandleStart);
                x2 = xHandleEnd + lambdaEnd * (xAnchorEnd - xHandleEnd);
                y2 = yHandleEnd + lambdaEnd * (yAnchorEnd - yHandleEnd);

                x3 = x0 + lambdaEnd * (x1 - x0);
                y3 = y0 + lambdaEnd * (y1 - y0);
                x4 = x1 + lambdaEnd * (x2 - x1);
                y4 = y1 + lambdaEnd * (y2 - y1);

                xHandleStart = x0;
                yHandleStart = y0;
                xHandleEnd = x3;
                yHandleEnd = y3;
                xAnchorEnd = x3 + lambdaEnd * (x4 - x3);
                yAnchorEnd = y3 + lambdaEnd * (y4 - y3);
            }

            //path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            console.log(xAnchorStart, yAnchorStart);
            console.log(xHandleStart, yHandleStart);
            console.log(xAnchorEnd, yAnchorEnd);
            txt = 'M' + xAnchorStart + ' ' + yAnchorStart;
            txt += 'C' + xHandleStart + ' ' + yHandleStart;
            txt += ' ' + xHandleEnd + ' ' + yHandleEnd;
            txt += ' ' + xAnchorEnd + ' ' + yAnchorEnd;

            // path.setAttribute('d', txt);
            // path.setAttribute('stroke', '#0000FF');
            // path.setAttribute('stroke-width', 2.0);
            // path.setAttribute('fill', 'none');

            return txt;
        };
        let _convertArray = function(arr) {
            if (typeof arr === 'string')
                return arr.trim().length ? arr.trim().split(' ') : [];
            return arr.join(' ');
        };
        /******************************  PRIVATE METHODS - GENERAL *****************************/
        let _debug = function(message) {
            if (plugin.settings.debug) {
                if (typeof message === 'string')
                    console.log("Debug (" + _myname + ") message: " + message);
                else
                    console.log("Debug (" + _myname + ") message: " + message.data.m);
            }
        };
        /******************************  PUBLIC METHODS - INTERACTIVE *****************************/
        plugin.branch = function(name) {
            //Set branch:
            _struct.parsed.branches[name] = {
                el: _struct.draw.symbol().attr("graph-branch", name),
                col: 0,
                color: _getColor(),
            };
            //set source node:
            if (_pointer.node) {
                let ref = _convertArray(_pointer.node.attr("node-to-branch"));
                ref.push(name);
                _pointer.node.attr("node-to-branch", _convertArray(ref));
            }
            //debug
            _debug("branch " + name);
        };
        plugin.checkout = function(name = false) {
            _debug("checkout " + name);
            if (name && _struct.parsed.branches[name]) {
                _pointer.branch = _struct.parsed.branches[name];
                _pointer.node = _pointer.branch.el.last();
            } else if (name) {
                return null;
            }
            return _pointer.branch;
        };
        plugin.commit = function(tag, mes, branch = false) {
            if (!branch && _pointer.branch) {
                let newNode = _generateNode(tag,
                    _pointer.branch.col++,
                    _pointer.row,
                    _pointer.branch.color,
                    _theme.text.tags.color
                );
                _pointer.branch.el.add(newNode);
                _pointer.node = _pointer.branch.el.last();
            } else {
                _debug("cant commit, not working on any branch");
                return false;
            }
            _debug("commit " + tag);
            return true;
        };
        plugin.renderBranch = function(name = false, col = 0, row = 0, expand = true) {
            let n = name && _struct.parsed.branches[name] ? name : _pointer.branch.el.attr("graph-branch");
            if (_struct.parsed.branches[n]) {
                let toRender = _struct.parsed.branches[n].el;
                let rendered = _struct.draw.use(_struct.parsed.branches[n].el);
                toRender.dx(col * _theme.grid.steps.col);
                _shiftRows(toRender, row);
                if (expand) {
                    let scan = 0;
                    toRender.find('g').each(function(node) {
                        if (node.attr("node-to-branch")) {
                            let toBranch = _convertArray(node.attr("node-to-branch"));
                            console.log(toBranch);
                            _pointer.row++;
                            for (let to = 0; to < toBranch.length; to++)
                                plugin.renderBranch(toBranch[to], col + scan, row + 1);
                        }
                        scan++;
                    });
                }
            } else {
                _debug("cant render branch, no such branch");
                return false;
            }
            _debug("renderBranch " + n);
            return true;
        };
        /******************************  PUBLIC METHODS - HELPERS *****************************/
        //Ui related:

        // Constructor method:
        plugin.init = function() {
                //Extend settings:
                plugin.settings = $.extend({}, _defaults, options);
                _struct.draw = SVG().addTo(_element).size(
                    plugin.settings.width,
                    plugin.settings.height
                );
                _struct.draw.element('style').words("@import './lib/sikgraphmetro/svg-graphmetro.css';");
                //Call callback:
                plugin.settings.uiEvents.onInit.call(this);
            }
            //Initiate:
        plugin.init();
    }

    /******************************  ATTACH SIKCHESS  *****************************/
    $.fn.sikgraph = function(options) {
        return this.each(function() {
            // If plugin has not already been attached to the element
            if (undefined == $(this).data('sikgraph')) {
                // create a new instance of the plugin
                var plugin = new $.sikgraph(this, options);
                // Store ref of the object:
                $(this).data('sikgraph', plugin);
            } else {
                console.log("Get the requested method and return")
            }
        });
    }

})(jQuery);

// initialize SVG.js
//var draw = SVG('drawing').size(700, 400)
//Data:
let tree = {
    "master": ["e4", "e5", ["_m2", "Nc5"], "bc3", "bc3", ["_m3", "_m4", "Nc5"], "bc3", "bc3", "bc3"],
    "_m2": ["e3", "e6", "g4", "Nc6"],
    "_m3": ["e3", ["_m5", "Nc5"], "g4", "Nc6", "e6", "g4", "Nc6", "Nc6"],
    "_m4": ["e3", "e6", "g4", "Nc6", "e6", "g4", "Nc6"],
    "_m5": ["e3", "e6", "g4", "Nc6", "e6"],
};
let SikGraph = null;


$(function() {

    SikGraph = $('#graph-container').sikgraph().data('sikgraph');
    SikGraph.branch("main", null);
    SikGraph.checkout("main", null);
    SikGraph.commit("e4");
    SikGraph.commit("e5");
    SikGraph.commit("e2");
    SikGraph.branch("f1", null);
    SikGraph.checkout("f1", null);
    SikGraph.commit("f2");
    SikGraph.commit("f3");
    SikGraph.commit("f4");
    SikGraph.commit("f5");
    SikGraph.commit("f6");
    SikGraph.checkout("main", null);
    SikGraph.branch("s1", null);
    SikGraph.checkout("s1", null);
    SikGraph.commit("s2");
    SikGraph.commit("s3");
    SikGraph.commit("s4");
    SikGraph.commit("s5");
    SikGraph.checkout("main", null);
    SikGraph.branch("x1", null);
    SikGraph.checkout("x1", null);
    SikGraph.commit("x2");
    SikGraph.commit("x3");
    SikGraph.commit("x4");
    SikGraph.commit("x5");
    SikGraph.commit("x6");
    SikGraph.commit("x7");
    SikGraph.commit("x8");
    SikGraph.checkout("main", null);
    SikGraph.commit("e3");
    SikGraph.commit("e7");
    SikGraph.commit("e8");
    SikGraph.branch("g1", null);
    SikGraph.checkout("g1", null);
    SikGraph.commit("g9");
    SikGraph.commit("g10");
    SikGraph.branch("d1", null);
    SikGraph.checkout("d1", null);
    SikGraph.commit("d9");
    SikGraph.commit("d10");
    SikGraph.commit("d9");
    SikGraph.commit("d10");
    SikGraph.checkout("main", null);
    SikGraph.commit("e9");
    SikGraph.commit("10");
    SikGraph.renderBranch("main");
    SikGraph.updateLinks();

});












function paint_branches() {
    for (let b in _branches) {
        _branches[b].find("circle").fill(get_color(_color_picker++));
        _branches[b].find("text").fill('#000');
    }
}

function render_branch(branch, nodes, row, col) {
    _branches[branch] = draw.group();
    _rows[row] = branch;
    update_links();
    for (let m = 0; m < nodes.length; m++) {
        if (typeof nodes[m] === 'string') {
            _branches[branch].add(node(nodes[m], row, col));
        } else {
            for (let b = 0; b < nodes[m].length; b++)
                if (nodes[m][b][0] === '_') {
                    shift_rows(row + 1);
                    render_branch(nodes[m][b], tree[nodes[m][b]], row + 1, col);
                } else {
                    _branches[branch].add(node(nodes[m][b], row, col));
                }
        }
        col++;
    }
}

function update_links() {
    for (let r = _rows.length - 1; r >= 0; r--) {
        for (let node in _branches) {
            console.log(node);
        }
    }
}