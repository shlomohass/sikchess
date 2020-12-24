/******************************************************************************/
// Created by: SIKTEC / SIKDEV.
// Release Version : 1.0 (initial)
// Creation Date: 2020-12-20
// Copyright 2020, SIKTEC / SIKDEV.
/******************************************************************************/

//const { pgnParser } = require("../pgn-parser/pgn-parser");

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

game = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2020.12.21"]
[Round "?"]
[White "norbert78"]
[Black "sik_chess"]
[Result "0-1"]
[ECO "C57"]
[WhiteElo "1145"]
[BlackElo "1160"]
[TimeControl "300+5"]
[EndTime "14:45:05 PST"]
[Termination "sik_chess won on time"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. Bd3 Nxe4 6. Nxe4 dxe4 7. Bxe4 Bc5 8.
Bxc6+ bxc6 9. O-O O-O 10. Qe2 Bd6 11. Nc3 Qg5 12. d3 Qg6 13. g3 Bh3 14. Re1 Bg4
15. Qe4 Qxe4 16. Rxe4 Be6 17. Re2 Rab8 18. b3 Bb4 19. Na4 f6 20. Be3 a6 21. Bc5
Bxc5 22. Nxc5 Bc8 23. a4 Kf7 24. c3 Rd8 25. Re4 Rd5 26. b4 f5 27. Re3 a5 28. Rb1
Kf6 29. Rf3 g6 30. g4 Kg5 31. gxf5 axb4 32. cxb4 Bxf5 33. Ne4+ Kg4 34. Rg3+ Kf4
35. Nf6 Rxd3 36. Rxd3 Bxd3 37. Rb3 Rd8 38. Nxh7 Be4 0-1
`;
let moves = pgnParser.parse(game);
console.log(moves);

/******************************  SIKCHESS INIT  *****************************/
$("#chessboard").sikchess();