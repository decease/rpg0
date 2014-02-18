(function() {
    var pressedKeys = {},
        mouse = {
            isDown: false,
            btn: 0,
            pos: [0, 0],
            oldPos: [0, 0]
        };

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
            case 32:
                key = 'SPACE'; break;
            case 37:
                key = 'LEFT'; break;
            case 38:
                key = 'UP'; break;
            case 39:
                key = 'RIGHT'; break;
            case 40:
                key = 'DOWN'; break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;
    }

    function AddMouseListenersFor(el) {
        el.onmousedown = function (e) {
            mouse.isDown = true;
            mouse.btn = e.button;
            mouse.oldPos = mouse.pos;
            mouse.pos = [e.clientX, e.clientY];

            return false;
        };

        el.onmouseup = function (e) {
            mouse.isDown = false;

            return false;
        };

        el.onmousemove = function (e) {
            mouse.oldPos = mouse.pos;
            mouse.pos = [e.clientX, e.clientY]
        };

        el.oncontextmenu = function () { return false; };
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        mouse: mouse,
        AddMouseListenersFor: AddMouseListenersFor,
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();