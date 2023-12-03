var mindSweeper;
var numBrains = 0;

$(document).ready(function() {
    var ctrl = false;
    $(".h1 > i, #instructions > .close").click(function() {
        $("#instructions").toggle();    
    });
    
    
    $("#tips").click(function() {
        $("body").buttonPopup({
            message: "<h3>Tips</h3><ul><li>If you see only a white number on a square, you know all other squares it touchs are safe, otherwise there "+
            "would be a red number on that square as well.</li>"+
            "<li>If you see a red 1 on a square, you know that it touches only one shotgun. If that red 1 only touches one other unknown square, you know that unknown square is a shotgun.</li>"+
            "<li>If that red 1 has a known shotgun next to it, all other unknown squares cannot be shotguns.</li>"+
            "</ul>",
            buttons: [{
                label: "Close",
                action: function() {
                    $("body").buttonPopup("close");
                }
            }]
        });
    });
    
    mindSweeper = MindSweeper();
    newGame();

    function newGame() {
        var select = "<span>Board size</span> <select name='boardType'>";
        select += "<option selected>6x6</option>";
        select += "<option>8x8</option>";
        select += "<option>10x10</option>";
        select += "<option>20x20</option>";
        select += "</select><br/>";
        select += "<span>Difficulty</span> <select name='level'>";
        select += "<option value='10' selected>Easy</option>";
        select += "<option value='15'>Medium</option>";
        select += "<option value='20'>Hard</option>";
        select += "<option value='25'>Appocolypse</option>";
        select += "</select><br/>";
        $("body").buttonPopup({
            message: "Game Options<p>"+select+"</p>",
            buttons: [{
                label: "Play",
                action: function() {
                    $("body").buttonPopup("close");
                    var bt = $("select[name='boardType']").val();
                    var bts = bt.split("x");
                    var w = parseInt(bts[0]);
                    var h = parseInt(bts[1]);
                    var sqs = w*h;
                    var level = parseInt($("select[name='level']").val());
                    var ns = Math.round(sqs*level/100);
                    var nb = Math.round(ns/4);
                    if (window.innerHeight > window.innerWidth) {
                        mindSweeper.newGame("Kent",w, h,nb,ns);
                    } else {
                        mindSweeper.newGame("Kent",h, w,nb,ns);
                    }
                    sameGame();
                }
            }]
        });
    }

    function sameGame() {
        numBrains = 0;
        $("#board").empty();
        $("#brains-score").empty();
        if (mindSweeper.getBoardHeight() == mindSweeper.getBoardWidth()) {
            $("#board-cover").css({
                width: "auto", height: "100%"
            });
        }
        for (var i = 0; i < mindSweeper.getNumBrains(); i++) {
            $("#brains-score").append("<img src='brain.png'/>");
        }
        if (mindSweeper.getBoardHeight() >= 20 || mindSweeper.getBoardWidth() >= 20) {
            $("#brains-score img").css("height", "2vh");
        }
        for (var row = 0; row < mindSweeper.getBoardHeight(); row++) {
            var rowdiv = $("<div>");
            for (var col = 0; col < mindSweeper.getBoardWidth(); col++) {
                var span = $("<span>");
                span.attr("id", "cell-"+row+"-"+col);
                rowdiv.append(span);
            }
            $("#board").append(rowdiv);
        }
        $("#board").unbind("click");
        $("#board").unbind("dblclick");
        $("#board").on("click", "div > span", clicked);
        $("#board").on("dblclick", "div > span", dblclicked);

        var mouseTimer = null;

        function clicked(evt) {
            var $this = this;
            mouseTimer = setTimeout(function() {
                ctrl = true;
                squareClick.call($this,evt);
            },300);
            evt.preventDefault();
            evt.stopPropagation();
        }
        
        function dblclicked(evt) {
            clearTimeout(mouseTimer);
            ctrl = false;
            squareClick.call(this,evt);
            evt.preventDefault();
            evt.stopPropagation();
            if (window.getSelection)
                window.getSelection().removeAllRanges();
            else if (document.selection)
                document.selection.empty();
        }
        
        function squareClick(evt) {
            var id = $(this).attr("id");
            var parts = id.split("-");
            var row = parseInt(parts[1]);
            var col = parseInt(parts[2]);
            if (mindSweeper.alreadyShown(row, col)) {
                return;
            }
            if (ctrl) {
                ctrl = false;
                $("#"+id).toggleClass("flagged");
//                evt.preventDefault();
            } else {
                $("#"+id).removeClass("flagged");
                var r = mindSweeper.makePlay(row, col);
                if (Array.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        id = "#cell-"+r[i].row+"-"+r[i].col;
                        $(id).addClass("revealed");
                        if (r[i].value.hasBrain) {
                            $(id).addClass("brains");
                            explodeBrain();
                        }
                        if (r[i].value.shotgun > 0) {
                            $(id).append(r[i].value.shotgun);
                            if (r[i].value.brain > 0) {
                                $(id).append("<span class='brain'>"+r[i].value.brain+"</span>");
                            }
                        } else if (r[i].value.brain > 0) {
                            $(id).append("<span class='brain'>"+r[i].value.brain+"</span>");
                        }
                    }
                } else {
                    id = "#cell-"+row+"-"+col
                    $(id).addClass("revealed").addClass("flagged");
                    explodeShotgun();
                }
            }
        }
        
        if (mindSweeper.getBoardHeight() > 10) {
            var scale = 10/mindSweeper.getBoardHeight();
            if (window.innerHeight > window.innerWidth) {
                if (mindSweeper.getBoardWidth() !== 15) {
                    scale = scale*1.5;
                }
            }
            $("#board").css("transform", "scale("+scale+","+scale+")");
        } else {
            $("#board").removeAttr("transform");
        }
        var empty = mindSweeper.getEmpty();
        var c = Math.floor(Math.random() * empty.length);
        ctrl = false;
        squareClick.call($("#cell-"+empty[c].row+"-"+empty[c].col)[0], {ctrlKey: false});
    }

    function explodeBrain() {
        $("#brains-score img:first").remove();
        $("#zombie-brains")[0].play();
        $("#exploding-brain").show();
        setTimeout(function() {
            $("#exploding-brain").css({
                width: "100vw", opacity: 0
            });
            setTimeout(function() {
                $("#exploding-brain").hide().css({
                    width: "100px", opacity: 1
                });
                numBrains += 1;
                if (numBrains == mindSweeper.getNumBrains()) {
                    playAgain("The zombies have feasted!");
                }
            }, 1100);
        }, 10);
    }

    function explodeShotgun() {
        $("#shotgun-blast")[0].play();
        $("#exploding-shotgun").show();
        setTimeout(function() {
            $("#exploding-shotgun").css({
                width: "100vw", opacity: 0
            });
            setTimeout(function() {
                $("#exploding-shotgun").hide().css({
                    width: "100px", opacity: 1
                });
            }, 1100);
        }, 10);
        playAgain("The zombie hunters have won!");
    };

    function playAgain(msg) {
        var text = "";
        if (arguments.length == 0) {
            text = "Play again?";
        } else {
            text = msg+"<br/></br/>Play again?";
        }
        $("body").buttonPopup({
            message: text,
            buttons: [{
                label: "Yes",
                action: function() {
                    $("body").buttonPopup("close");
                    mindSweeper.newGame();
                    sameGame();
                }
            },
                {
                    label: "Change options",
                    action: function() {
                        $("body").buttonPopup("close");
                        newGame();
                    }
                }]
        });
    }

});