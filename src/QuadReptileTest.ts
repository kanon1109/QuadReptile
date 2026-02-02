class QuadReptileTest extends egret.Sprite {
	private qr:QuadReptile;
	private bodyList: egret.Shape[] = [];
	private joint1List: egret.Shape[] = [];
	private joint2List: egret.Shape[] = [];
	private joint3List: egret.Shape[] = [];
	private joint4List: egret.Shape[] = [];
	private jointR: number = 6;
	public constructor() {
		super();
		this.qr = new QuadReptile(100, 100);
		let length: number = this.qr.bodyArr.length;
		const k: number = 3; // 控制陡峭度，k越大后段降幅越快（推荐1~10）
		for(let i:number = 0; i < length; i++)
		{
			const ratio: number = 1 - Math.sqrt(i / length) ** k; // 核心变形
			let r: number = this.qr.bodyRadius * ratio;
			let ball: egret.Shape = this.drawBall(i > 0 ? 0xFFFFFF : 0x00ff00, r)
			this.bodyList.push(ball);
		}

		let base: egret.Shape = this.drawBall(0xFFFFFF, this.jointR)
		let joint: egret.Shape = this.drawBall(0xFFFFFF, this.jointR)
		let end: egret.Shape = this.drawBall(0xFFFFFF, this.jointR)
		this.joint1List.push(base);
		this.joint1List.push(joint);
		this.joint1List.push(end);
		base = this.drawBall(0xFFFFFF, this.jointR)
		joint = this.drawBall(0xFFFFFF, this.jointR)
		end = this.drawBall(0xFFFFFF, this.jointR)
		this.joint2List.push(base);
		this.joint2List.push(joint);
		this.joint2List.push(end);

		base = this.drawBall(0xFFFFFF, this.jointR)
		joint = this.drawBall(0xFFFFFF, this.jointR)
		end = this.drawBall(0xFFFFFF, this.jointR)
		this.joint3List.push(base);
		this.joint3List.push(joint);
		this.joint3List.push(end);
		base = this.drawBall(0xFFFFFF, this.jointR)
		joint = this.drawBall(0xFFFFFF, this.jointR)
		end = this.drawBall(0xFFFFFF, this.jointR)
		this.joint4List.push(base);
		this.joint4List.push(joint);
		this.joint4List.push(end);

		this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
		this.addEventListener(egret.Event.ADDED_TO_STAGE, this.addtoStage, this);
	}

	private addtoStage(): void {
		this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
	}

	private touchHandler(e: egret.TouchEvent): void {
		this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveHandler, this);
		this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEndHandler, this);
		this.stage.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.touchEndHandler, this);
		this.qr.move(e.stageX, e.stageY);
	}

	private touchEndHandler(): void {
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveHandler, this);
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEndHandler, this);
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_CANCEL, this.touchEndHandler, this);
	}

	private touchMoveHandler(e: egret.TouchEvent): void {
		this.qr.move(e.stageX, e.stageY);
	}

	private update(): void {
		this.qr.update();
		this.graphics.clear();
		let length: number = this.bodyList.length;
		let preP: egret.Point;
		for (let i: number = 0; i < length; i++) {
			let p: egret.Point = this.qr.bodyArr[i];
			if (preP) {
				this.graphics.lineStyle(1, 0xFFFFFF);
				this.graphics.moveTo(preP.x, preP.y);
				this.graphics.lineTo(p.x, p.y);
			}
			preP = p;
			let ball: egret.Shape = this.bodyList[i];
			ball.x = p.x;
			ball.y = p.y;
		}

		for(let i:number = 0; i < this.qr.jointUpRArr.length; i++)
		{
			this.joint1List[i].x = this.qr.jointUpRArr[i].x;
			this.joint1List[i].y = this.qr.jointUpRArr[i].y;
			if(i == 0) this.graphics.moveTo(this.joint1List[i].x, this.joint1List[i].y);
			else this.graphics.lineTo(this.joint1List[i].x, this.joint1List[i].y);
		}

		for(let i:number = 0; i < this.qr.jointUpLArr.length; i++)
		{
			this.joint2List[i].x = this.qr.jointUpLArr[i].x;
			this.joint2List[i].y = this.qr.jointUpLArr[i].y;
			if(i == 0) this.graphics.moveTo(this.joint2List[i].x, this.joint2List[i].y);
			else this.graphics.lineTo(this.joint2List[i].x, this.joint2List[i].y);
		}

		for(let i:number = 0; i < this.qr.jointDownRArr.length; i++)
		{
			this.joint3List[i].x = this.qr.jointDownRArr[i].x;
			this.joint3List[i].y = this.qr.jointDownRArr[i].y;
			if(i == 0) this.graphics.moveTo(this.joint3List[i].x, this.joint3List[i].y);
			else this.graphics.lineTo(this.joint3List[i].x, this.joint3List[i].y);
		}

		for(let i:number = 0; i < this.qr.jointDownLArr.length; i++)
		{
			this.joint4List[i].x = this.qr.jointDownLArr[i].x;
			this.joint4List[i].y = this.qr.jointDownLArr[i].y;
			if(i == 0) this.graphics.moveTo(this.joint4List[i].x, this.joint4List[i].y);
			else this.graphics.lineTo(this.joint4List[i].x, this.joint4List[i].y);
		}
		
	}

	private drawBall(color: number, r: number): egret.Shape {
		let ball: egret.Shape = new egret.Shape();
		ball.graphics.lineStyle(3, color);
		ball.graphics.drawCircle(0, 0, r);
		this.addChild(ball);
		return ball;
	}
}