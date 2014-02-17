(function() {
    var readyCallbacks = [],
        resourceCache = [],
        spriteesheets = [];

    /**
     *
     * @param jsonUrl = "data/spritesheet.json"
     */
    function load(jsonUrl) {
        $.getJSON(jsonUrl, function (data) {
            var images = data.images;

            for (var key in images) {
                var image = images[key];

                _loadImage(key);

                for (var sprite in image) {
                    spriteesheets[sprite] = {
                        properties: image[sprite],
                        url: key
                    };
                }
            }
        });
    }

    function get(url) {
        return resourceCache[url];
    }

    function getKeys() {
        return Object.keys(spriteesheets);
    }

    function onReady(callback) {
        readyCallbacks.push(callback);
    }

    function getSpritesheet(name) {
        return spriteesheets[name];
    }

    function _loadImage(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(_isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function _isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
                !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    window.resources = {
        load: load,
        get: get,
        getKeys: getKeys,
        getSpritesheet: getSpritesheet,
        onReady: onReady
    };
})();