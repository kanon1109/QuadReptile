class QuadReptile {
	/** 左上肢体二阶关节角度偏移量（单位：弧度），控制左上腿关节摆动基础角度 */
	private theta2OffsetUL: number;
	/** 右上肢体二阶关节角度偏移量（单位：弧度），控制右上腿关节摆动基础角度 */
	private theta2OffsetUR: number;
	/** 左下肢体二阶关节角度偏移量（单位：弧度），控制左下腿关节摆动基础角度 */
	private theta2OffsetDL: number;
	/** 右下肢体二阶关节角度偏移量（单位：弧度），控制右下腿关节摆动基础角度 */
	private theta2OffsetDR: number;
	/** 四肢三阶关节角度偏移补偿量（单位：弧度），统一修正所有肢体末端关节摆动角度 */
	private theta3Offset: number;
	/** 主躯干节点的基础半径（躯干节点会基于此做缩放） */
	private _bodyRadius: number = 30;
	// 关节角度偏移的符号因子（1=正向偏移，-1=反向偏移），控制摆动的增减方向
	private jointOffsetSign: number = 1;
	/** 关节摆动的频率速度（单位：弧度/帧），值越大四肢摆动的频率越快、幅度变化越明显 */
	private jointSwingSpeed: number = 0;
	//身体节数量
	private bodyCount: number = 10;
	// 躯干半径衰减陡峭度（值越大后段缩小越快，推荐1~10）
	private steepNessFactor: number = 3;
	// 最大移动距离阈值
	private moveDisMax: number = 3;
	// 关节摆动速度缩放倍率
    private swingSpeedScale: number = 8;
	// 弧度转角度常量
	private radToDeg: number = 180 / Math.PI;      
	// 角度转弧度常量
	private degToRad: number = Math.PI / 180;
	//上肢第一关节长度
	private joint1UpLen:number = 35; 
	//上肢第二关节长度
	private joint2UpLen:number = 25; 
	//下肢第一关节长度
	private joint1DownLen:number = 40; 
	//下肢第二关节长度
	private joint2DownLen:number = 30; 
	//起始位置用于计算jointSwingSpeed
	private startPt: egret.Point;
	//身体数组
	private _bodyArr: egret.Point[];
	/** 右上肢体关节坐标数组：按[基座关节, 中间关节, 末端关节]顺序存储各关节的坐标点 */
	private _jointUpRArr: egret.Point[]
	/** 左上肢体关节坐标数组：按[基座关节, 中间关节, 末端关节]顺序存储各关节的坐标点 */
	private _jointUpLArr: egret.Point[]
	/** 右下肢体关节坐标数组：按[基座关节, 中间关节, 末端关节]顺序存储各关节的坐标点 */
	private _jointDownRArr: egret.Point[]
	/** 左下肢体关节坐标数组：按[基座关节, 中间关节, 末端关节]顺序存储各关节的坐标点 */
	private _jointDownLArr: egret.Point[]
	public constructor(startX: number, startY: number) {
		this._bodyArr = [];
		this.startPt = new egret.Point(startX, startY);
		// 遍历生成躯干节点（i显式类型number）
		for (let i: number = 0; i < this.bodyCount; i++) {
			// 初始化当前节点的基础坐标（按间距生成初始位置）
			let currPt: egret.Point = new egret.Point(startX, startY * (i + 1));
			// 将当前节点坐标加入躯干节点列表
			this._bodyArr.push(currPt);
		}
		this.theta2OffsetUL = 50 * this.degToRad;
		this.theta2OffsetUR = 20 * this.degToRad;
		this.theta2OffsetDL = -50 * this.degToRad;
		this.theta2OffsetDR = -20 * this.degToRad;
		//关节数组
		this._jointUpRArr = [];
		this._jointUpLArr = [];
		this._jointDownRArr = [];
		this._jointDownLArr = [];
		//初始化关节
		for (let i: number = 1; i <= 3; i++) {
			this._jointUpRArr.push(new egret.Point());
			this._jointUpLArr.push(new egret.Point());
			this._jointDownRArr.push(new egret.Point());
			this._jointDownLArr.push(new egret.Point());
		}
		this.update();
	}

	/**
	 * 移动
	 */
	public move(x: number, y: number): void {
		if (!this._bodyArr) return;
		let headPt: egret.Point = this._bodyArr[0];
		headPt.x = x;
		headPt.y = y;
		let dis: number = egret.Point.distance(headPt, this.startPt);
		if (dis > this.moveDisMax) dis = this.moveDisMax;
		this.jointSwingSpeed = (dis / this.moveDisMax) * this.swingSpeedScale * this.jointOffsetSign;
		this.startPt.x = x;
		this.startPt.y = y;
		this.theta2OffsetUR += this.jointSwingSpeed * this.degToRad;
		this.theta2OffsetUL -= this.jointSwingSpeed * this.degToRad;
		this.theta2OffsetDL -= this.jointSwingSpeed * this.degToRad;
		this.theta2OffsetDR += this.jointSwingSpeed * this.degToRad;
		let angle: number = this.theta2OffsetUR * this.radToDeg;
		if (angle < -90) this.jointOffsetSign = Math.abs(this.jointOffsetSign);
		else if (angle > 60) this.theta2OffsetUR = -90 * this.degToRad;
		angle = this.theta2OffsetUL * this.radToDeg;
		if (angle < -60) this.theta2OffsetUL = 90 * this.degToRad;
		angle = this.theta2OffsetDR * this.radToDeg;
		if (angle > 90) this.theta2OffsetDR = -60 * this.degToRad;
		angle = this.theta2OffsetDL * this.radToDeg;
		if (angle < -90) this.theta2OffsetDL = 60 * this.degToRad;
	}

	/**
	 * 更新
	 */
	public update(): void {
		this.updateBody();
		this.updateJoints();
	}

	/**
	 * 更新身体位置
	 */
	private updateBody(): void {
		if (!this._bodyArr) return;
		let length: number = this._bodyArr.length;
		let prePt: egret.Point; // 上一个躯干节点的坐标（首节点无前驱，初始null）
		let prevR: number = 0; // 上一个躯干节点的实际半径（初始0，首节点会覆盖）
		for (let i: number = 0; i < length; i++) {
			let currPt: egret.Point = this._bodyArr[i];
			let radiusRatio: number = 1 - Math.sqrt(i / this.bodyCount) ** this.steepNessFactor;
			let currR: number = this._bodyRadius * radiusRatio;
			if (prePt) {
				let rad: number = Math.atan2(currPt.y - prePt.y, currPt.x - prePt.x);
				currPt.x = Math.cos(rad) * prevR * 2 + prePt.x;
				currPt.y = Math.sin(rad) * prevR * 2 + prePt.y;
			}
			prePt = currPt;
			prevR = currR;
		}
	}

	/**
	 * 更新关节位置
	 */
	private updateJoints(): void {
		if (!this._bodyArr) return;
		let prevPt: egret.Point = this._bodyArr[0];
		let currPt: egret.Point = this._bodyArr[1];
		this.updateJoint(this._jointUpRArr, currPt, prevPt, true, true);
		this.updateJoint(this._jointUpLArr, currPt, prevPt, false, true);
		prevPt = this._bodyArr[3];
		currPt = this._bodyArr[4];
		this.updateJoint(this._jointDownRArr, currPt, prevPt, true, false);
		this.updateJoint(this._jointDownLArr, currPt, prevPt, false, false);
	}

	/**
	 * 更新单边关节数据
	 */
	private updateJoint(jointArr: egret.Point[], p1: egret.Point, p2: egret.Point, isRight: boolean, isUp: boolean): void {
		let d: number = isRight ? 1 : - 1;
		let rad: number = Math.atan2(p1.y - p2.y, p1.x - p2.x);
		let ll: number = 30 * d;
		let l1: number = isUp ? this.joint1UpLen : this.joint1DownLen;
		let l2: number = isUp ? this.joint2UpLen : this.joint2DownLen;
		let joint1X: number = p1.x + Math.cos(rad - Math.PI / 2) * ll;
		let joint1Y: number = p1.y + Math.sin(rad - Math.PI / 2) * ll;
		let targetX: number = joint1X + Math.cos(rad - Math.PI / 2) * l1;
		let targetY: number = joint1Y + Math.sin(rad - Math.PI / 2) * l1;
		let ikX: number = (targetX - joint1X) * d;
		let ikY: number = (targetY - joint1Y) * d;
		let ikResult: { theta1: number, theta2: number };
		let joint2X: number;
		let joint2Y: number;
		// 关节2（大臂小臂连接）
		let endX: number;
		let endY: number; // 末端执行器
		let theta2Offset: number;
		let joint2Angle: number;
		if (isUp) {
			ikResult = this.twoJointIK(ikX, ikY, l1, l2, !isRight);
			theta2Offset = isRight ? this.theta2OffsetUR : this.theta2OffsetUL;
			joint2Angle = theta2Offset * this.radToDeg;
			if (!isRight) joint2Angle = this.mapRange(joint2Angle, 90, -60, -20, 90);
			else joint2Angle = -this.mapRange(joint2Angle, -60, 90, -20, 90);
		}
		else {
			ikResult = this.twoJointIK(ikX, ikY, l1, l2, isRight);
			theta2Offset = isRight ? this.theta2OffsetDR : this.theta2OffsetDL;
			joint2Angle = theta2Offset * this.radToDeg;
			if (!isRight) joint2Angle = this.mapRange(joint2Angle, 90, -60, -80, 30);
			else joint2Angle = -this.mapRange(joint2Angle, -60, 90, -80, 30);
		}
		this.theta3Offset = joint2Angle * this.degToRad;
		if (!ikResult) return;
		let { theta1, theta2 } = ikResult;
		// 关节2坐标：基座 + 大臂的极坐标转换
		const finalTheta1: number = theta1 + theta2Offset;
		joint2X = joint1X + l1 * Math.cos(finalTheta1);
		joint2Y = joint1Y + l1 * Math.sin(finalTheta1); // y轴取反
		// 末端坐标：关节2 + 小臂的极坐标转换（小臂角度=theta1+theta2）
		const finalTheta2: number = theta1 + theta2 + theta2Offset + this.theta3Offset;
		endX = joint2X + l2 * Math.cos(finalTheta2);
		endY = joint2Y + l2 * Math.sin(finalTheta2); // y轴取反
		let jointP1: egret.Point = jointArr[0];
		let jointP2: egret.Point = jointArr[1];
		let jointP3: egret.Point = jointArr[2];
		jointP1.x = joint1X;
		jointP1.y = joint1Y;
		jointP2.x = joint2X;
		jointP2.y = joint2Y;
		jointP3.x = endX;
		jointP3.y = endY;
	}

	/**
	 * 双关节机械臂IK求解器（二维）
	 * 解析法求解，返回两个关节的角度（弧度），支持肘上/肘下两种姿态
	 * @param {number} x - 末端目标x坐标
	 * @param {number} y - 末端目标y坐标
	 * @param {number} l1 - 大臂长度
	 * @param {number} l2 - 小臂长度
	 * @param {boolean} isElbowUp - 是否肘上姿态（true=肘上，false=肘下）
	 * @returns {Object|null} {theta1: 关节1角度(弧度), theta2: 关节2角度(弧度)}，无解返回null
 	*/
	private twoJointIK(x: number, y: number,
		l1: number, l2: number,
		isElbowUp: boolean = true): { theta1: number, theta2: number } {
		// 替换Math.hypot(x, y) → 勾股定理实现，无兼容问题
		const r: number = Math.sqrt(x * x + y * y);
		// 边界判断：目标点超出机械臂可达范围（l1+l2 < r 或 |l1-l2| > r），无解
		if (r > l1 + l2 || r < Math.abs(l1 - l2) || (r === 0 && l1 !== l2)) {
			return null;
		}
		// 2. 用余弦定理求关节2的角度θ₂
		const cosTheta2: number = (l1 ** 2 + l2 ** 2 - r ** 2) / (2 * l1 * l2);
		// 限制余弦值范围（避免浮点精度问题导致NaN）
		const clampedCosTheta2: number = Math.max(Math.min(cosTheta2, 1), -1);
		// 肘上/肘下对应θ₂的正负
		let theta2: number = Math.acos(clampedCosTheta2);
		if (!isElbowUp) theta2 = -theta2;
		// 3. 求关节1的角度θ₁
		// 先求基座到目标点的夹角α = arctan2(y, x)
		const alpha: number = Math.atan2(y, x);
		// 再求大臂与r的夹角β = arccos( (l1² + r² - l2²)/(2*l1*r) )
		let beta: number = 0;
		if (r > 0) { // 避免除以0
			const cosBeta: number = (l1 ** 2 + r ** 2 - l2 ** 2) / (2 * l1 * r);
			const clampedCosBeta: number = Math.max(Math.min(cosBeta, 1), -1);
			beta = Math.acos(clampedCosBeta);
		}
		// 肘上/肘下对应θ₁的计算方式
		let theta1: number = alpha - beta;
		if (!isElbowUp) theta1 = alpha + beta;
		// 角度归一化到[-π, π]（可选，方便使用）
		theta1 = this.normalizeAngle(theta1);
		theta2 = this.normalizeAngle(theta2);
		return { theta1, theta2 };
	}

	/**
	 * 线性映射核心函数
	 * @param {number} value - 输入值
	 * @param {number} inMin - 输入最小值
	 * @param {number} inMax - 输入最大值
	 * @param {number} outMin - 输出最小值
	 * @param {number} outMax - 输出最大值
	 * @returns {number} 映射后的输出值
	 */
	private mapRange(value, inMin, inMax, outMin, outMax) {
		return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	/**
	 * 角度归一化到[-π, π]（弧度）
	 * @param {number} angle - 原始角度（弧度）
	 * @returns {number} 归一化后的角度
	 */
	private normalizeAngle(angle: number) {
		angle = angle % (2 * Math.PI);
		if (angle > Math.PI) angle -= 2 * Math.PI;
		if (angle < -Math.PI) angle += 2 * Math.PI;
		return angle;
	}

	public get jointUpRArr(): ReadonlyArray<egret.Point> {
		return this._jointUpRArr;
	}

	public get jointUpLArr(): ReadonlyArray<egret.Point> {
		return this._jointUpLArr;
	}

	public get jointDownRArr(): ReadonlyArray<egret.Point> {
		return this._jointDownRArr;
	}

	public get jointDownLArr(): ReadonlyArray<egret.Point> {
		return this._jointDownLArr;
	}

	public get bodyArr(): ReadonlyArray<egret.Point> {
		return this._bodyArr;
	}

	public get bodyRadius():number
	{
		return this._bodyRadius;
	}

	public destroy(): void {
		if (this._bodyArr) this._bodyArr.length = 0;
		this._bodyArr = null;
		if (this._jointUpRArr) this._jointUpRArr.length = 0;
		this._jointUpRArr = null;
		if (this._jointUpLArr) this._jointUpLArr.length = 0;
		this._jointUpLArr = null;
		if (this._jointDownRArr) this._jointDownRArr.length = 0;
		this._jointDownRArr = null;
		if (this._jointDownLArr) this._jointDownLArr.length = 0;
		this._jointDownLArr = null;
		this.startPt = null;
	}
}