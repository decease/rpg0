(function () {
    function renderMapLayout(ctx, map, tile_size, map_pos) {
        var w = 0, h = 0, resource = null;
        var name;

        var offsetY = Math.ceil(map_pos[1] / tile_size[1]);
        var offsetX = Math.ceil(map_pos[0] / tile_size[0]);

        for (var j = offsetY < 0 ? 0 : offsetY; j < map.length; j++) {
            for (var i = offsetX < 0 ? 0 : offsetX; i < map[j].length; i++) {
                if (map[j][i] <= 0) continue;

                name = map[j][i].toString();
                resource = resources.getSpritesheet(name);

                w = resource.properties.frame.width;
                h = resource.properties.frame.height;

                var x = tile_size[0] * i - Math.ceil(map_pos[0]);
                var y = tile_size[1] * j - Math.ceil(map_pos[1]);

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