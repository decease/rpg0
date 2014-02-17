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

var map = [
    [ 0, -2,  1,  2,  1,  2,  3, -2, -1, -1, -1, -1, 10],
    [-2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1,  6],
    [-2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1,  6],
    [10, -1, -1, -1, -1, -1, -1,  7, -1, -1, -1, -1,  6],
    [10, -1, -1, -1, -1, -1, -1,  7, -1, -1, -1, -1, 10],
    [ 6, -1, -1, -1, -1, -1, -1,  5,  1,  1,  1,  1,  4],
    [10, -1, -1, -1, -1, -1, -1, -2, -2, -2, -2, -2, -2],
    [ 6, -1, -1, -1, -1, -1, -1, -2, -2, -2, -2, -2, -2],
    [10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ 6, -1, -1, -1, -1, -1, -1,  9, 13, 13, 14, 14,  8],
    [ 6, -1, -1, -1, -1, -1, -1,  7, -1, -1, -1, -1, 10],
    [12, -1, -1, -1, -1, -1, 15, -2, -1, -1, -1, -1, 10],
    [-2, -2, 14, 13, 14, 14, -2, -2, -1, -1, -1, -1,  6]
];

// Create the canvas
var canvas = null,
    ctx = null,
    debugMode = false,
    lastTime,
    gameTime = 0,
    fps = 0,
    playerSpeed = 200,
    tile_size = [40, 40],
    map_size = [0, 0],
    heroSpriteName = "hero_0";

// Game state
var player = {},
    balls = [];

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

    canvas.width = window.innerWidth - 25;
    canvas.height = window.innerHeight - 25;
    document.body.appendChild(canvas);

    document.body.onresize = function () {
        canvas.width = window.innerWidth - 25;
        canvas.height = window.innerHeight - 25;
    };

    $.ajax({
        async: false,
        dataType: "json",
        url: "/data/map.json",
        success: function (data) {
            map = data.map;
            map_size = data.size;
        }
    });

    player = {
        pos: [300, 300],
        direction: 'none',
        sprite: new Sprite(resources.getSpritesheet(heroSpriteName).url, resources.getSpritesheet(heroSpriteName).properties, 'right', 13)
    };

    lastTime = Date.now();
    main();
}

$(function () {
    resources.load("data/spritesheet.json");
    resources.onReady(init);
});

// Update game objects
function update(dt) {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt);
}

function handleInput(dt) {
    var oldPos = [player.pos[0], player.pos[1]];

    if(input.isDown('DOWN') || input.isDown('s')) {
        player.sprite.animated = true;
        player.sprite.direction = 'down';
        player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.sprite.animated = true;
        player.sprite.direction = 'up';
        player.pos[1] -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.sprite.direction = 'left';
        player.sprite.animated = true;
        player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.sprite.direction = 'right';
        player.sprite.animated = true;
        player.pos[0] += playerSpeed * dt;
    }

    if (input.isDown('SPACE')) {
        var ball =  {
            pos: [player.pos[0], player.pos[1]],
            sprite: new Sprite(resources.getSpritesheet(heroSpriteName).url, resources.getSpritesheet(heroSpriteName).properties)
        };

        balls.push(ball);
    }

    if (isImpassable(player.pos)) {
        player.pos = oldPos;
    }
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

function updateEntities(dt) {
    // Update the player sprite animation
    for (var k in balls) {
        balls[k].sprite.update(dt);
    }

    player.sprite.update(dt);
}

// Draw everything
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var k in map) {
        terrain.renderMapLayout(ctx, map[k], tile_size);
    }

    for (var k in balls) {
        renderEntity(balls[k]);
    }

    renderEntity(player);
    player.sprite.animated = false;

    if (debugMode) {
        renderUnavailible();
        renderCells();
        printInformation();
    }
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

function printInformation() {
    ctx.fillStyle = "#FF00FF";
    ctx.font = "bold 16px Arial";

    var x = Math.ceil(player.pos[0] / 40) - 1;
    var y = Math.ceil(player.pos[1] / 40) - 1;

    ctx.fillText("Player cell: " + x + ', ' + y, 50, 50);
    ctx.fillText("Player position: " + player.pos[0] + ', ' + player.pos[1], 50, 70);
    ctx.fillText("FPS: " + Math.ceil(fps), 50, 90);
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}