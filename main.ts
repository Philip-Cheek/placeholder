class Mouse {
	coord:number[];

	constructor(){
		this.coord = [null,null];
	}

	updateMovement(e:any){
		this.coord[0] = e.pageX ? e.pageX : null;
		this.coord[1] = e.pageY ? e.pageY : null;
	}
}

class Bullet {
	coord:number[];
	velocity:number[];
	speed:number;;
	life:number;
	size:number;

	constructor(pCoord:number[], angle:number, revX:boolean, size:number){
		this.speed = 4;
		this.life = 400;
		this.coord = [pCoord[0] - size/2, pCoord[1] - size/2];
		this.velocity = [this.speed * Math.cos(angle), this.speed * Math.sin(angle)];
		if (revX) this.velocity[0] *= -1;
		this.size = size;
	}

	update(){
		for (var i = 0; i < 2; i++){
			this.coord[i] += this.velocity[i];
		}
		this.life--;
	}


}

class Cannon {
	bulletQueue:Bullet[]
	bulletSize:number;
	coolDown:number;
	n:number;
	
	constructor(canvasWidth:number){
		this.bulletSize = canvasWidth * .02;
		this.bulletQueue = [];
		this.coolDown = 0;
		this.n = 10;
	}

	fire(coord:number[], angle:number, revX:boolean){
		if (this.coolDown > 0) return;
		this.coolDown = 10;
		this.bulletQueue.push(new Bullet(coord,angle,revX,this.bulletSize));
	}

	drawBullets(ctx:CanvasRenderingContext2D){
		for (var i = 0; i < this.bulletQueue.length; i++){
			let bCoord = this.bulletQueue[i].coord;
			let bSize = this.bulletQueue[i].size;
			ctx.rect(bCoord[0],bCoord[1],bSize,bSize);
			ctx.stroke();
		}
	}

	emptyChamber(){
		if (this.coolDown > 0){
			this.coolDown--;
		}
		
		for (var i = this.bulletQueue.length - 1; i >= 0; i--){
			this.bulletQueue[i].update();
			if (this.bulletQueue[i].life < 0){
				this.bulletQueue.splice(i,1);
			}
		} 
	}
}

class Platform {
	width:number;
	height:number;
	coord:number[];
	constructor(x:number,y:number,width:number,height:number){
		this.coord = [x,y];
		this.width = width;
		this.height = height;
	}

	isCollision(gBlock:any):void{
		const inBottom:boolean = gBlock.coord[1] < this.coord[1] + this.height;
		if (!inBottom) return false;
		const inTop:boolean = gBlock.coord[1] + oPlat.width > this.coord[1];
		if (!inTop) return false;
		const inRight = oPlat.coord[0] + oPlat.width > this.coord[0];
		if (!inRight) return false;
		const inLeft = oPlat.coord[0] < this.coord[0] + this.width;
		if (!inLeft) return false;
		return true;
	}

	checkBCollision(bullet,offset):void{
		const aCoord = [this.coord[0], this.coord[1] - offset]
		const inBottom:boolean = bullet.coord[1] < aCoord[1] + this.height;
		if (!inBottom) return;
		const inTop:boolean = bullet.coord[1] + bullet.size > aCoord[1];
		if (!inTop) return;
		const inRight = bullet.coord[0] + bullet.size > aCoord[0];
		if (!inRight) return;
		const inLeft = bullet.coord[0] < aCoord[0] + this.width;
		if (!inLeft) return;
		this.coord[0] += 4;
		this.width -= 8;
		bullet.life = -1;
	}

	isPCollision(oPlat:Platform):boolean{
		const inBottom:boolean = oPlat.coord[1] < this.coord[1] + this.height;
		if (!inBottom) return false;
		const inTop:boolean = oPlat.coord[1] + oPlat.width > this.coord[1];
		if (!inTop) return false;
		const inRight = oPlat.coord[0] + oPlat.width > this.coord[0];
		if (!inRight) return false;
		const inLeft = oPlat.coord[0] < this.coord[0] + this.width;
		if (!inLeft) return false;
		return true;
	}

}

class Platformer {
	platforms:Platform[];
	baseWidth:number;
	baseHeight:number;
	speed:number;
	offset:number;
	maxY:number;
	minS:number;
	maxS:number;

	constructor(canvasWidth,canvasHeight){
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

	generatePlatforms(){
		for (let z = 0; z < 200; z++){
			let minY = this.maxY + this.baseHeight;
			let y = Math.floor(Math.random() * (this.maxY - minY + 1)) + minY;
			let minSize = this.baseWidth * this.minS;
			let maxSize = this.baseWidth * this.maxS;
			let width = Math.floor(Math.random() * (maxSize- minSize + 1)) + minSize;
			let maxX = this.baseWidth - width;
			let x = Math.floor(Math.random() * maxX);
			let platform = new Platform(x, y, width, this.baseHeight * .05);
			let p = 0;
			while (p < this.platforms.length){
				if (platform.isPCollision(this.platforms[p])) break;
				p++;
			}

			if (p == this.platforms.length){
				this.platforms.push(platform)
				this.maxY -= this.baseHeight * .3;
				this.minS += .01;
				this.maxS += .01;
			}else{
				z--;
			}
		}
	}

	checkPlayerCollision(player:Player){
		for var(i = 0; )

	}

	update(bullets:Bullet[]){
		this.offset -= 1;
		let max:number = null;
		console.log(this.platforms.length);
		for (let i = this.platforms.length - 1; i >= 0; i--){
			if (this.platforms[i].coord[1] - this.offset > this.baseHeight * 1.2 ||
				this.platforms[i].width < 4){
				this.platforms.splice(i,1);
				console.log("why");
			}else {
				if (!max || this.platforms[i].coord[1] < max){
					max = this.platforms[i].coord[1];
				}
				for (var b = 0; b < bullets.length; b++)
					this.platforms[i].checkBCollision(bullets[b],this.offset);
			}
		}

		if (max - this.offset > this.baseHeight * -.5){
			this.generatePlatforms();
		}
	}

	drawPlatforms(ctx){
		for (let i = 0; i < this.platforms.length; i++){
			let x = this.platforms[i].coord[0];
			let y = this.platforms[i].coord[1] - this.offset;
			let w = this.platforms[i].width;
			let h = this.platforms[i].height;
			ctx.rect(x, y, w, h);
			ctx.stroke();
		}

	}


}

class Player {
	height:number;
	width:number;
	coord:number[]
	maxSpeed:number;
	maxThreshold:number;
	cannon:Cannon;

	constructor(canvasWidth:number,canvasHeight:number){
		this.height = canvasWidth * .1;
		this.width = canvasWidth * .1;
		this.coord = [0,0];
		this.maxSpeed = 3;
		this.maxThreshold = 30;
		this.cannon = new Cannon(canvasWidth);
		this.spawnPoint = [null, null];
	}

	setSpawn(canvasWidth:number=null,canvasHeight:number=null){
		this.coord[0] = canvasWidth/2 - this.width/2
		this.coord[1] = canvasHeight * .8;
		if (!this.spawnPoint[0])
			this.spawnPoint[0] = this.coord[0];
		if (!this.spawnPoint[1])
			this.spawnPoint[1] = this.coord[1];

	}

	draw(ctx:CanvasRenderingContext2D){
		this.cannon.drawBullets(ctx);
		ctx.rect(this.coord[0],this.coord[1],this.width,this.height);
		ctx.stroke();
	}

	update(mouse:number[],mouseDown:boolean){
		this.cannon.emptyChamber();

		if (!mouse[0] || !mouse[1]) return;


		let centerCoord:number[] = [
			this.coord[0] + this.width/2,
			this.coord[1] + this.height/2
		];

		const xDist = mouse[0] - centerCoord[0],
			yDist = mouse[1] - centerCoord[1],
			dist = Math.sqrt(Math.pow(xDist,2) + Math.pow(yDist,2)),
			speedMultiplier = dist/this.maxThreshold,
			speed = speedMultiplier < 1 ? this.maxSpeed * speedMultiplier : this.maxSpeed,
			angle = dist > 0 ? Math.asin(yDist/dist) : 0;

		if (mouseDown){
			this.cannon.fire(centerCoord,angle,mouse[0] < centerCoord[0])
		};
		let xVelocity = speed * Math.cos(angle),
            yVelocity = speed * Math.sin(angle);

        if (mouse[0] < centerCoord[0]){ xVelocity *= -1 };

        this.coord[0] += xVelocity;
        this.coord[1] += yVelocity;
	}
}

class ControlBoard {
	mouse:Mouse;
	mouseDown:boolean;
	constructor(){
		this.mouse = new Mouse();
		document.addEventListener("mousemove", this.mouse.updateMovement.bind(this.mouse));
		document.addEventListener("mousedown",()=>{
			this.mouseDown = true
		});
		document.addEventListener("mouseup",()=>{
			this.mouseDown = false
		});
	}

	getRelMouseCoord(scale):number[]{
		const relCoord:number[] = this.mouse.coord;
		for (var i = 0; i < relCoord.length; i++) relCoord[i]/scale;
		return relCoord;
	}
}

class Main {
	canvas:HTMLCanvasElement;
	context:CanvasRenderingContext2D;
	mouse:Mouse;
	keys:{string:string};
	controlBoard:ControlBoard;
	player:Player
	scaleRef:number;
	scale:number;
	platformer:Platformer;

	constructor(){
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext('2d');
		this.canvas.id = "game_canvas";
		this.canvas.width = document.body.offsetWidth;
		this.canvas.height = document.body.offsetHeight;
		this.controlBoard = new ControlBoard();
		this.player = new Player(this.canvas.width, this.canvas.height)
		this.scaleRef = document.body.offsetWidth;
		this.platformer = new Platformer(this.canvas.width, this.canvas.height);
		this.player.setSpawn(this.canvas.width, this.canvas.height);
		document.body.appendChild(this.canvas);
	}

	setCanvas(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.scale = document.body.offsetWidth/this.scaleRef;
		this.scaleRef = document.body.offsetWidth;
		this.context.scale(this.scale,this.scale);
		this.context.beginPath()
	}

	gameLoop(){
		this.setCanvas();
		this.player.draw(this.context);
		this.player.update(this.controlBoard.getRelMouseCoord(this.scale),this.controlBoard.mouseDown);
		this.platformer.drawPlatforms(this.context);
		this.platformer.update(this.player.cannon.bulletQueue);
		window.requestAnimationFrame(this.gameLoop.bind(this));
	}
}

window.onload = () => {
	const retain = new Main();
	retain.gameLoop();
};
