(function () {
    function renderMapLayout(ctx, map, tile_size) {
        var w = 0, h = 0, resource = null;
        var name;

        // Render the player if the game isn't over
        for (var j = 0; j < map.length; j++) {
            for (var i = 0; i < map[j].length; i++) {
                if (map[j][i] <= 0) continue;

                name = map[j][i].toString();
                resource = resources.getSpritesheet(name);

                w = resource.properties.frame.width;
                h = resource.properties.frame.height;

                var x = tile_size[0] * i;
                var y = tile_size[1] * j;

                ctx.save();
                ctx.translate(x, y);
                ctx.drawImage(resources.get(resource.url),
                    resource.properties.frame.x,
                    resource.properties.frame.y,
                    w, h,
                    0, 0,
                    w, h);
                ctx.restore();
            }
        }
    }

    window.terrain = {
        renderMapLayout: renderMapLayout
    };
})();