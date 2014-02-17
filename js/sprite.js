(function() {
    /**
     *
     * @param url - url of image with current sprite
     * @param properties - object like bellow:
     * {
            "frame": {
                "x": 0,
                "y": 0,
                "width": 128,
                "height": 128
            },
            "rotated": true,
            "directions": [
                "left", "up-left", "up", "up-right", "right", "down-right", "down", "down-left"
            ],
            "animated": true,
            "frames": [
                0, 1, 2, 3, 4, 5, 6, 7
            ]
        }
     * @param speed - speed of animation, if animated sprite
     * @param once - flag - is repeat once
     * @constructor
     */
    function Sprite (url, properties, direction, speed, once) {
        this.url = url;
        $.extend(true, this, properties);
        this.speed = typeof speed === 'number' ? speed : 0;
        this.direction = direction;
        this.once = once || false;
        this._index = 0;
    }

    Sprite.prototype = {
        update: function (dt) {
            this._index += this.speed*dt;
        },

        //@ TODO: add direction logic
        render: function (ctx) {
            var frame;

            if (this.animated && this.speed > 0) {
                var max = this.frames.length;
                var idx = Math.floor(this._index);
                frame = this.frames[idx % max];

                if (this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            }
            else {
                frame = 0;
            }

            var x = this.frame.x;
            var y = this.frame.y;

            x += frame * this.frame.width;

            var dir = this.directions !== undefined ? this.directions.indexOf(this.direction) : 0;
            y += dir > 0 ? this.directions.indexOf(this.direction) * this.frame.height : 0;

            ctx.drawImage(resources.get(this.url),
                x, y,
                this.frame.width, this.frame.height,
                0, 0,
                this.frame.width, this.frame.height);
        }
    };

    window.Sprite = Sprite;
})();