// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = null,
    ctx = null,
    lastTime,
    fps = 0,
    map_size = [40, 18],
    tile_size = [40, 40],
    map = [],
    selectedLayer = 0,
    gameTime = 0,
    mouse = {
        isDown: false,
        btn: 0,
        pos: [0, 0],
        oldPos: [0, 0]
    };

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    fps = 1 / dt;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
}

function init() {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tile_size[0] * map_size[0];
    canvas.height = tile_size[1] * map_size[1];
    document.body.appendChild(canvas);

    initSettingDialog();

    canvas.onmousedown = function (e) {
        mouse.isDown = true;
        mouse.btn = e.button;
        mouse.oldPos = mouse.pos;
        mouse.pos = [e.clientX, e.clientY];

        return false;
    };
    canvas.onmouseup = function (e) {
        mouse.isDown = false;

        return false;
    };
    canvas.onmousemove = function (e) {
        mouse.oldPos = mouse.pos;
        mouse.pos = [e.clientX, e.clientY]
    };

    canvas.oncontextmenu = function () { return false; };

    var layer = [];
    for (var i = 0; i < map_size[1]; i++) {
        var line = [];
        for (var j = 0; j < map_size[0]; j++) {
            line.push(0);
        }
        layer.push(line);
    }
    map.push(layer);
    lastTime = Date.now();
    main();
}

function initSettingDialog() {
    var tiles = resources.getKeys();

    for (var i = 0; i < tiles.length; i++) {
        var k = tiles[i];
        var li = document.createElement("div");
        li.innerText = k;

        var spritesheet = resources.getSpritesheet(k);

        var img = document.createElement("div");
        img.setAttribute("style",
            "background: url(" + spritesheet.url + ") no-repeat -" + spritesheet.properties.frame.x + "px -" + spritesheet.properties.frame.y + "px; "
            + "width: " + spritesheet.properties.frame.width + "px; " + "height: " + spritesheet.properties.frame.height + "px");
        img.setAttribute("data-id", k);
        img.onclick = function () {
            document.getElementById('tileId').value = this.attributes["data-id"].value;

            $("#tiles > div").removeClass('selected');
            $(this).parent().addClass('selected');
        };

        li.appendChild(img);
        document.getElementById("tiles").appendChild(li);
    }

    document.getElementById("btn_addLayer").onclick = function () {
        var select = document.getElementById("layers");
        var opt = document.createElement("option");
        opt.value = map.length;
        opt.innerHTML = map.length;

        var layer = [];
        for (var i = 0; i < map_size[1]; i++) {
            var line = [];
            for (var j = 0; j < map_size[0]; j++) {
                line.push(0);
            }
            layer.push(line);
        }
        map.push(layer);

        select.appendChild(opt);
        select.selectedIndex = map.length - 1;
    };

    document.getElementById("layers").onchange = function () {
        selectedLayer = this.selectedOptions[0].value;
    };

    document.getElementById("btn_stringify").onclick = function () {
        alert(JSON.stringify(map));
    };

    $("#dialog").dialog({ title: "Map configuration", autoOpen: true, width: 500 });
}

$(function () {
    resources.load("../data/spritesheet.json");
    resources.onReady(init);
});

// Update game objects
function update(dt) {
    gameTime += dt;

    canvas.width = tile_size[0] * map_size[0];
    canvas.height = tile_size[1] * map_size[1];

    handleInput(dt);
}

function handleInput(dt) {
    if (mouse.isDown) {
        var x = Math.ceil(mouse.pos[0] / tile_size[0]) - 1;
        var y = Math.ceil(mouse.pos[1] / tile_size[1]) - 1;
        var tileId = parseInt(document.getElementById('tileId').value);

        switch (mouse.btn) {
            case 0:
                var w = Math.ceil(resources.getSpritesheet(tileId).properties.frame.width / tile_size[0]);
                var h = Math.ceil(resources.getSpritesheet(tileId).properties.frame.height / tile_size[1]);

                for (var i = 0; i < w; i++) {
                    for (var j = 0; j < h; j++) {
                        map[selectedLayer][y + j][x + i] = -1;
                    }
                }

                map[selectedLayer][y][x] = tileId;
                break;

            case 1:
            case 2:
                map[selectedLayer][y][x] = 0;
                break
        }
    }
}

// Draw everything
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (document.getElementById('onlySelected').checked) {
        terrain.renderMapLayout(ctx, map[selectedLayer], tile_size);
    } else {
        for (var k in map) {
            terrain.renderMapLayout(ctx, map[k], tile_size);
        }
    }

    if (document.getElementById('showGrid').checked) {
        renderCells(ctx);
        renderUnavailible()
    }

    printInformation();
}

function isImpassable(pos) {
    var x = Math.ceil((pos[0] + 10) / 40) - 1;
    var y = Math.ceil((pos[1] + 32) / 40) - 1;

    var flag = true;
    for (var k in map) {
        if (map[k][y][x] >= 17 && map[k][y][x] <= 22 && map[k][y][x] != 0) {
            flag = false;
        }
    }

    return flag;
}

function renderUnavailible() {
    for (var i = 0; i < map_size[0]; i ++) {
        for (var j = 0; j < map_size[1]; j++) {
            //console.log(isImpassable([i, j]));
            if (isImpassable([i * tile_size[0] + 2, j * tile_size[1] + 2])) {
                ctx.fillStyle = "rgba(255,0,0,0.3)";
                ctx.fillRect(i * tile_size[0], j * tile_size[1], tile_size[0], tile_size[1]);
            }
        }
    }
}

function printInformation() {
    ctx.fillStyle = "#FF00FF";
    ctx.font = "bold 16px Arial";

    ctx.fillText("FPS: " + Math.ceil(fps), 10, 20);
}

function renderCells() {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(128,128,128,.5)";

    for (var i = 0; i < tile_size[0] * map_size[0]; i += tile_size[0]) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for (var j = 0; j < tile_size[1] * map_size[1]; j += tile_size[1]) {
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
    }

    ctx.stroke();
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}
