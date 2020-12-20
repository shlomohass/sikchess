/******************************************************************************/
// Created by: SIKTEC / SIKDEV.
// Release Version : 1.0 (initial)
// Creation Date: 2020-12-20
// Copyright 2020, SIKTEC / SIKDEV.
/******************************************************************************/

/******************************  MASONRY INIT  *****************************/
var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    percentPosition: true,
    columnWidth: '.grid-sizer'
});
// layout Masonry after each image loads
$grid.imagesLoaded().progress(function() {
    $grid.masonry();
});

/******************************  SIKCHESS INIT  *****************************/
$("#chessboard").sikchess();