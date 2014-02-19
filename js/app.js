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
    debugMode = false,
    lastTime,
    lastFire = new Date(),
    lastAdd = new Date(),
    gameTime = 0,
    fps = 0,
    playerSpeed = 200,
    enemySpeed = 70,
    bulletSpeed = 500,
    attackDistance = 100,
    tile_size = [40, 40],
    map_size = [80, 30],
    map_pos = [0, 0],
    map = [],

    directions = ["up", "down", "left", "right"],
    fireSprites = {up: 31, down: 32, left: 33, right: 34},
    heroSpriteName = "hero_0",
    enemySpriteName = "hero_1";

// Game state
var player = {},
    bullets = [],
    explosions = [],
    enemies = [],
    score = 0;

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

    input.AddMouseListenersFor(canvas);

    $.ajax({
        async: false,
        dataType: "json",
        url: "data/map.json",
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

    checkCollisions();
}

function checkCollisions() {
    var pos, size;

    for(var j = 0; j < bullets.length; j++) {
        var pos2 = bullets[j].pos;
        var size2 = [bullets[j].sprite.frame.width, bullets[j].sprite.frame.height];

        if (bullets[j].source == 'player') {
            for(var i = 0; i < enemies.length; i++) {
                pos = enemies[i].pos;
                size = [enemies[i].sprite.frame.width, enemies[i].sprite.frame.height];

                if (help2d.boxCollides(pos, size, pos2, size2)) {
                    // Remove the enemy
                    enemies.splice(i, 1);
                    i--;

                    // Add score
                    score += 100;

                    // Add an explosion
                    explosions.push({
                        pos: pos,
                        sprite: new Sprite(resources.getSpritesheet('30').url, resources.getSpritesheet('30').properties, '', 15, true)
                    });

                    // Remove the bullet and stop this iteration
                    bullets.splice(j, 1);
                    j--;
                    break;
                }

                if (isImpassable(pos2)) {
                    explosions.push({
                        pos: pos2,
                        sprite: new Sprite(resources.getSpritesheet('30').url, resources.getSpritesheet('30').properties, '', 15, true)
                    });

                    // Remove the bullet and stop this iteration
                    bullets.splice(j, 1);
                    j--;
                    break;
                }
            }
        } else {
            pos = player.pos;
            size = [player.sprite.frame.width, player.sprite.frame.height];

            if (help2d.boxCollides(pos, size, pos2, size2)) {
                alert('Game over :(');
            }
        }
    }
}

function handleInput(dt) {
    var oldPos = [player.pos[0], player.pos[1]];

    if(input.isDown('DOWN') || input.isDown('s')) {
        player.sprite.animated = true;
        player.sprite.direction = 'down';
        player.pos[1] += playerSpeed * dt;

        if (player.pos[1] - map_pos[1] > canvas.height - 150) {
            map_pos[1] += playerSpeed * dt;
        }
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.sprite.animated = true;
        player.sprite.direction = 'up';
        player.pos[1] -= playerSpeed * dt;

        if (player.pos[1] - map_pos[1] < 150) {
            map_pos[1] -= playerSpeed * dt;
        }
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.sprite.direction = 'left';
        player.sprite.animated = true;
        player.pos[0] -= playerSpeed * dt;

        if (player.pos[0] - map_pos[0] < 150) {
            map_pos[0] -= playerSpeed * dt;
        }
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.sprite.direction = 'right';
        player.sprite.animated = true;
        player.pos[0] += playerSpeed * dt;

        if (player.pos[0] - map_pos[0] > canvas.width - 150) {
            map_pos[0] += playerSpeed * dt;
        }
    }

    if (input.isDown('SPACE') && (Date.now() - lastFire > 100)) {
        var x = player.pos[0] + player.sprite.frame.width / 2;
        var y = player.pos[1] + player.sprite.frame.height / 2;

        var spriteName =  fireSprites[player.sprite.direction];
        bullets.push({
            source: 'player',
            pos: [x, y],
            dir: player.sprite.direction,
            sprite: new Sprite(resources.getSpritesheet(spriteName).url, resources.getSpritesheet(spriteName).properties) });

        lastFire = Date.now();
    }

    if (input.mouse.isDown && (Date.now() - lastAdd > 100)) {
        var x = input.mouse.pos[0] + map_pos[0];
        var y = input.mouse.pos[1] + map_pos[1];

        switch (input.mouse.btn) {
            case 0:
                enemies.push({
                        pos: [x, y],
                        dir: player.sprite.direction,
                        lastFire: new Date(),
                        sprite: new Sprite(resources.getSpritesheet(enemySpriteName).url, resources.getSpritesheet(enemySpriteName).properties, player.sprite.direction, 7)
                    });
                break;
        }

        lastAdd = Date.now();
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
    var i = 0;

    player.sprite.update(dt);

    // Update all the bullets
    for(i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];

        switch (bullet.dir) {
            case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
            case 'down': bullet.pos[1] += bulletSpeed * dt; break;
            case 'left': bullet.pos[0] -= bulletSpeed * dt; break;
            case 'right': bullet.pos[0] += bulletSpeed * dt; break;
        }
    }

    // Update all the explosions
    for(i = 0; i < explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
            explosions.splice(i, 1);
            i--;
        }
    }

    for(i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        var oldPos = [enemy.pos[0], enemy.pos[1]];

        var diffX = player.pos[0] - enemy.pos[0];
        var diffY = player.pos[1] - enemy.pos[1];
        var distance = Math.sqrt(diffX*diffX + diffY*diffY);

        if (distance < attackDistance && (Date.now() - enemy.lastFire > 100)) {
            // Attack

            var x = enemy.pos[0] + enemy.sprite.frame.width / 2;
            var y = enemy.pos[1] + enemy.sprite.frame.height / 2;

            var spriteName =  fireSprites[enemy.sprite.direction];
            bullets.push({
                source: 'enemy',
                pos: [x, y],
                dir: enemy.sprite.direction,
                sprite: new Sprite(resources.getSpritesheet(spriteName).url, resources.getSpritesheet(spriteName).properties) });

            enemy.lastFire = Date.now();
        } else {
            // Move to player

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX <= 0) {
                    enemy.sprite.direction = 'left';
                    enemy.pos[0] -= enemySpeed * dt;
                } else {
                    enemy.sprite.direction = 'right';
                    enemy.pos[0] += enemySpeed * dt;
                }
            } else {
                if (diffY <= 0) {
                    enemy.sprite.direction = 'up';
                    enemy.pos[1] -= enemySpeed * dt;
                } else {
                    enemy.sprite.direction = 'down';
                    enemy.pos[1] += enemySpeed * dt;
                }
            }

            if(isImpassable(enemy.pos)) {
                enemy.pos = oldPos;
                enemy.sprite.direction = directions[Math.floor(Math.random() * 4)];
            }
        }

        enemy.sprite.update(dt);
    }
}

// Draw everything
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var k in map) {
        terrain.renderMapLayout(ctx, map[k], tile_size, map_pos);
    }

    for (var k in bullets) {
        renderEntity(bullets[k]);
    }

    for (var k in enemies) {
        renderEntity(enemies[k]);
    }

    for (var k in explosions) {
        renderEntity(explosions[k]);
    }

    renderEntity(player);
    player.sprite.animated = false;

    if (debugMode) {
        renderUnavailible();
        renderCells();
    }
    printInformation();
}

function renderUnavailible() {
    for (var i = 0; i < map_size[0]; i ++) {
        for (var j = 0; j < map_size[1]; j++) {
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

    ctx.fillText("Scores: " + Math.ceil(score), 50, 50);

    if (debugMode) {
        ctx.fillText("Player cell: " + x + ', ' + y, 50, 70);
        ctx.fillText("Player position: " + player.pos[0] + ', ' + player.pos[1], 50, 90);
        ctx.fillText("FPS: " + Math.ceil(fps), 50, 110);
    }
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0] - map_pos[0], entity.pos[1] - map_pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}
