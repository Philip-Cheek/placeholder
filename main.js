var Mouse = /** @class */ (function () {
    function Mouse() {
        this.coord = [null, null];
    }
    Mouse.prototype.updateMovement = function (e) {
        this.coord[0] = e.pageX ? e.pageX : null;
        this.coord[1] = e.pageY ? e.pageY : null;
    };
    return Mouse;
}());
var Bullet = /** @class */ (function () {
    function Bullet(pCoord, angle, revX, size) {
        this.speed = 4;
        this.life = 400;
        this.coord = [pCoord[0] - size / 2, pCoord[1] - size / 2];
        this.velocity = [this.speed * Math.cos(angle), this.speed * Math.sin(angle)];
        if (revX)
            this.velocity[0] *= -1;
        this.size = size;
    }
    ;
    Bullet.prototype.update = function () {
        for (var i = 0; i < 2; i++) {
            this.coord[i] += this.velocity[i];
        }
        this.life--;
    };
    return Bullet;
}());
var Cannon = /** @class */ (function () {
    function Cannon(canvasWidth) {
        this.bulletSize = canvasWidth * .02;
        this.bulletQueue = [];
        this.coolDown = 0;
        this.n = 10;
    }
    Cannon.prototype.fire = function (coord, angle, revX) {
        if (this.coolDown > 0)
            return;
        this.coolDown = 10;
        this.bulletQueue.push(new Bullet(coord, angle, revX, this.bulletSize));
    };
    Cannon.prototype.drawBullets = function (ctx) {
        for (var i = 0; i < this.bulletQueue.length; i++) {
            var bCoord = this.bulletQueue[i].coord;
            var bSize = this.bulletQueue[i].size;
            ctx.rect(bCoord[0], bCoord[1], bSize, bSize);
            ctx.stroke();
        }
    };
    Cannon.prototype.emptyChamber = function () {
        if (this.coolDown > 0) {
            this.coolDown--;
        }
        for (var i = this.bulletQueue.length - 1; i >= 0; i--) {
            this.bulletQueue[i].update();
            if (this.bulletQueue[i].life < 0) {
                this.bulletQueue.splice(i, 1);
            }
        }
    };
    return Cannon;
}());
var Platform = /** @class */ (function () {
    function Platform(x, y, width, height) {
        this.coord = [x, y];
        this.width = width;
        this.height = height;
    }
    Platform.prototype.checkBCollision = function (bullet, offset) {
        var aCoord = [this.coord[0], this.coord[1] - offset];
        var inBottom = bullet.coord[1] < aCoord[1] + this.height;
        if (!inBottom)
            return;
        var inTop = bullet.coord[1] + bullet.size > aCoord[1];
        if (!inTop)
            return;
        var inRight = bullet.coord[0] + bullet.size > aCoord[0];
        if (!inRight)
            return;
        var inLeft = bullet.coord[0] < aCoord[0] + this.width;
        if (!inLeft)
            return;
        this.coord[0] += 4;
        this.width -= 8;
        bullet.life = -1;
    };
    Platform.prototype.isPCollision = function (oPlat) {
        var inBottom = oPlat.coord[1] < this.coord[1] + this.height;
        if (!inBottom)
            return false;
        var inTop = oPlat.coord[1] + oPlat.width > this.coord[1];
        if (!inTop)
            return false;
        var inRight = oPlat.coord[0] + oPlat.width > this.coord[0];
        if (!inRight)
            return false;
        var inLeft = oPlat.coord[0] < this.coord[0] + this.width;
        if (!inLeft)
            return false;
        return true;
    };
    return Platform;
}());
var Platformer = /** @class */ (function () {
    function Platformer(canvasWidth, canvasHeight) {
        this.baseWidth = canvasWidth;
        this.baseHeight = canvasHeight;
        this.speed = 1;
        this.offset = 0;
        this.platforms = [];
        this.maxY = 0 - this.baseHeight * .5;
        this.minS = .1;
        this.maxS = .3;
        this.generatePlatforms();
    }
    Platformer.prototype.generatePlatforms = function () {
        for (var z = 0; z < 200; z++) {
            var minY = this.maxY + this.baseHeight;
            var y = Math.floor(Math.random() * (this.maxY - minY + 1)) + minY;
            var minSize = this.baseWidth * this.minS;
            var maxSize = this.baseWidth * this.maxS;
            var width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            var maxX = this.baseWidth - width;
            var x = Math.floor(Math.random() * maxX);
            var platform = new Platform(x, y, width, this.baseHeight * .05);
            var p = 0;
            while (p < this.platforms.length) {
                if (platform.isPCollision(this.platforms[p]))
                    break;
                p++;
            }
            if (p == this.platforms.length) {
                this.platforms.push(platform);
                this.maxY -= this.baseHeight * .3;
                this.minS += .01;
                this.maxS += .01;
            }
            else {
                z--;
            }
        }
    };
    Platformer.prototype.update = function (bullets) {
        this.offset -= 1;
        var max = null;
        console.log(this.platforms.length);
        for (var i = this.platforms.length - 1; i >= 0; i--) {
            if (this.platforms[i].coord[1] - this.offset > this.baseHeight * 1.2 ||
                this.platforms[i].width < 4) {
                this.platforms.splice(i, 1);
                console.log("why");
            }
            else {
                if (!max || this.platforms[i].coord[1] < max) {
                    max = this.platforms[i].coord[1];
                }
                for (var b = 0; b < bullets.length; b++)
                    this.platforms[i].checkBCollision(bullets[b], this.offset);
            }
        }
        if (max - this.offset > this.baseHeight * -.5) {
            this.generatePlatforms();
        }
    };
    Platformer.prototype.drawPlatforms = function (ctx) {
        for (var i = 0; i < this.platforms.length; i++) {
            var x = this.platforms[i].coord[0];
            var y = this.platforms[i].coord[1] - this.offset;
            var w = this.platforms[i].width;
            var h = this.platforms[i].height;
            ctx.rect(x, y, w, h);
            ctx.stroke();
        }
    };
    return Platformer;
}());
var Player = /** @class */ (function () {
    function Player(canvasWidth, canvasHeight) {
        this.height = canvasWidth * .1;
        this.width = canvasWidth * .1;
        this.coord = [0, 0];
        this.maxSpeed = 3;
        this.maxThreshold = 30;
        this.cannon = new Cannon(canvasWidth);
    }
    Player.prototype.setSpawn = function (canvasWidth, canvasHeight) {
        this.coord[0] = canvasWidth / 2 - this.width / 2;
        this.coord[1] = canvasHeight * .8;
    };
    Player.prototype.draw = function (ctx) {
        this.cannon.drawBullets(ctx);
        ctx.rect(this.coord[0], this.coord[1], this.width, this.height);
        ctx.stroke();
    };
    Player.prototype.update = function (mouse, mouseDown) {
        this.cannon.emptyChamber();
        if (!mouse[0] || !mouse[1])
            return;
        var centerCoord = [
            this.coord[0] + this.width / 2,
            this.coord[1] + this.height / 2
        ];
        var xDist = mouse[0] - centerCoord[0], yDist = mouse[1] - centerCoord[1], dist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)), speedMultiplier = dist / this.maxThreshold, speed = speedMultiplier < 1 ? this.maxSpeed * speedMultiplier : this.maxSpeed, angle = dist > 0 ? Math.asin(yDist / dist) : 0;
        if (mouseDown) {
            this.cannon.fire(centerCoord, angle, mouse[0] < centerCoord[0]);
        }
        ;
        var xVelocity = speed * Math.cos(angle), yVelocity = speed * Math.sin(angle);
        if (mouse[0] < centerCoord[0]) {
            xVelocity *= -1;
        }
        ;
        this.coord[0] += xVelocity;
        this.coord[1] += yVelocity;
    };
    return Player;
}());
var ControlBoard = /** @class */ (function () {
    function ControlBoard() {
        var _this = this;
        this.mouse = new Mouse();
        document.addEventListener("mousemove", this.mouse.updateMovement.bind(this.mouse));
        document.addEventListener("mousedown", function () {
            _this.mouseDown = true;
        });
        document.addEventListener("mouseup", function () {
            _this.mouseDown = false;
        });
    }
    ControlBoard.prototype.getRelMouseCoord = function (scale) {
        var relCoord = this.mouse.coord;
        for (var i = 0; i < relCoord.length; i++)
            relCoord[i] / scale;
        return relCoord;
    };
    return ControlBoard;
}());
var Main = /** @class */ (function () {
    function Main() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext('2d');
        this.canvas.id = "game_canvas";
        this.canvas.width = document.body.offsetWidth;
        this.canvas.height = document.body.offsetHeight;
        this.controlBoard = new ControlBoard();
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.scaleRef = document.body.offsetWidth;
        this.platformer = new Platformer(this.canvas.width, this.canvas.height);
        this.player.setSpawn(this.canvas.width, this.canvas.height);
        document.body.appendChild(this.canvas);
    }
    Main.prototype.setCanvas = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.scale = document.body.offsetWidth / this.scaleRef;
        this.scaleRef = document.body.offsetWidth;
        this.context.scale(this.scale, this.scale);
        this.context.beginPath();
    };
    Main.prototype.gameLoop = function () {
        this.setCanvas();
        this.player.draw(this.context);
        this.player.update(this.controlBoard.getRelMouseCoord(this.scale), this.controlBoard.mouseDown);
        this.platformer.drawPlatforms(this.context);
        this.platformer.update(this.player.cannon.bulletQueue);
        window.requestAnimationFrame(this.gameLoop.bind(this));
    };
    return Main;
}());
window.onload = function () {
    var retain = new Main();
    retain.gameLoop();
};
