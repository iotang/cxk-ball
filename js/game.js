/* by：弦云孤赫——David Yang
** github - https://github.com/yangyunhe369
*/
// 创建储存积分的变量
var storageScore = 0;
// 创建储存总分的变量
var globalScore = 0;

var hasReachedHighScore = 0;

// 游戏主要运行逻辑
var streak = 0;
var streakhitcnt = 0;
var streaksum = 0;
var lashit = 0;

class Game
{
	constructor(main)
	{
		let g = {
			main: main,                                                   // 游戏主函数
			actions: {},                                                  // 记录按键动作
			keydowns: {},                                                 // 记录按键keycode
			state: 1,                                                     // 游戏状态值，初始默认为1
			state_START: 1,                                               // 开始游戏
			state_RUNNING: 2,                                             // 游戏开始运行
			state_STOP: 3,                                                // 暂停游戏
			state_GAMEOVER: 4,                                            // 游戏结束
			state_UPDATE: 5,                                              // 游戏通关
			canvas: document.getElementById("canvas"),                    // canvas元素
			context: document.getElementById("canvas").getContext("2d"),  // canvas画布
			timer: null,                                                  // 轮询定时器
			fps: main.fps,                                                // 动画帧数，默认60
		}
		Object.assign(this, g)
	}
	// 绘制页面所有素材
	draw(paddle, ball, ballshadow, blockList, score, skillq, skillw, skille, skillr)
	{
		let g = this
		// 清除画布
		g.context.clearRect(0, 0, g.canvas.width, g.canvas.height)
		// 绘制背景图
		// g.drawBg()
		// 绘制挡板
		g.drawImage(paddle)
		// 绘制小球
		g.drawImage(ball)
		// 绘制小球阴影
		g.drawImage(ballshadow)
		// 绘制砖块
		g.drawBlocks(blockList)
		// 绘制分数
		g.drawText(score)
		g.drawSkills(skillq, 0)
		g.drawSkills(skillw, 1)
		g.drawSkills(skille, 2)
		g.drawSkills(skillr, 3)

		window.canvas_g = this
	}
	// 绘制图片
	drawImage(obj)
	{
		this.context.drawImage(obj.image, obj.x, obj.y)
	}
	// 绘制背景图
	drawBg()
	{
		let bg = imageFromPath(allImg.background)
		this.context.drawImage(bg, 0, 0, cdiv.clientWidth, cdiv.clientHeight)
	}
	// 绘制所有砖块
	drawBlocks(list)
	{
		for (let item of list)
		{
			this.drawImage(item)
		}
	}
	// 绘制计数板
	drawText(obj)
	{
		this.context.textAlign = "end"

		this.context.font = "24px sans-serif"
		this.context.fillStyle = "#000"
		// 绘制分数
		this.context.fillText(obj.text, this.canvas.width - 8, this.canvas.height - 10 - 72)

		this.context.font = "bold 72px sans-serif"
		this.context.fillStyle = "#000"
		this.context.fillText(obj.allScore, this.canvas.width - 8, this.canvas.height - 10)

		hasReachedHighScore |= (obj.grandHighestScore <= globalScore + obj.allScore);

		if (hasReachedHighScore) this.context.fillStyle = "#090";
		else this.context.fillStyle = "#666";
		this.context.font = "italic 18px sans-serif"
		this.context.fillText("累计", this.canvas.width - 8, this.canvas.height - 10 - 72 - 36)
		this.context.font = "italic bold 24px sans-serif"
		this.context.fillText(globalScore + obj.allScore, this.canvas.width - 8 - 36 - 16, this.canvas.height - 10 - 72 - 36)

		if (hasReachedHighScore) this.context.fillStyle = "#090";
		else this.context.fillStyle = "#009";
		this.context.font = "italic 18px sans-serif"
		this.context.fillText("最高", this.canvas.width - 8, this.canvas.height - 10 - 72 - 36 - 24)
		this.context.font = "italic bold 24px sans-serif"
		this.context.fillText(obj.grandHighestScore, this.canvas.width - 8 - 36 - 16, this.canvas.height - 10 - 72 - 36 - 24)

		if (streakhitcnt > 0)
		{
			this.context.fillStyle = "#000";
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("接球次数", this.canvas.width - 8, this.canvas.height / 2)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText(streakhitcnt, this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2)
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("平均打点", this.canvas.width - 8, this.canvas.height / 2 - 24)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText(((streaksum + streak) / (streakhitcnt + (streak != 0))).toFixed(4), this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2 - 24)
		}

		if (streak > 0)
		{
			let streaksize = Math.min(96, (Math.log(streak + 1) / Math.log(51)) * (96 - 24) + 24);
			this.context.font = "bold " + streaksize + "px sans-serif"
			let colorr = 255 / 20 * streak;
			let colorb = 255 / 0.6 - 255 / 0.6 / 50 * streak;
			colorr = Math.floor(Math.max(Math.min(colorr, 255), 0));
			colorb = Math.floor(Math.max(Math.min(colorb, 255), 0));
			this.context.fillStyle = "rgb(" + colorr + ", 0, " + colorb + ")";
			this.context.fillText(streak, this.canvas.width - 8 - 24 * 2, streaksize);
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillStyle = "#000";
			this.context.fillText("连击", this.canvas.width - 8, 10 + 24);
		}
		this.context.textAlign = "start"

		this.context.font = "bold 24px sans-serif"
		this.context.fillStyle = "#000"
		this.context.fillText(obj.textLv + obj.lv, obj.x, obj.y)

		storageScore = obj.allScore;
	}
	drawSkills(obj, num)
	{
		let nowtime = Date.now();
		let distan = ((obj.lastCastTime + obj.cd * 1000) - nowtime) / 1000.00;
		if (distan > 1) distan = Math.max(0.0, distan.toFixed(0));
		else distan = Math.max(0.0, distan.toFixed(1));

		let isCDOK = (distan <= 0);
		let isScoreOK = (obj.main.score.allScore >= obj.delta);

		if (isCDOK && isScoreOK) this.context.fillStyle = "#99f";
		else this.context.fillStyle = "#ccc";
		this.context.font = "bold 48px sans-serif"
		this.context.fillText(String.fromCharCode(obj.keyCode), num * 216 + 3, this.canvas.height - 36 + 3)

		if (isCDOK && isScoreOK) this.context.fillStyle = "#000";
		else this.context.fillStyle = "#999";
		this.context.font = "bold 48px sans-serif"
		this.context.fillText(String.fromCharCode(obj.keyCode), num * 216, this.canvas.height - 36)
		this.context.font = "24px sans-serif"
		this.context.fillText(obj.name, num * 216 + 48, this.canvas.height - 36)

		if (!isCDOK)
		{
			this.context.font = "24px sans-serif"
			this.context.fillStyle = "#a00"
			this.context.fillText("CD " + distan + "s", num * 216, this.canvas.height - 36 + 24 * 1.25)
		}
		else
		{
			this.context.font = "bold 24px sans-serif"
			this.context.fillStyle = "#0a0"
			this.context.fillText("Ready", num * 216, this.canvas.height - 36 + 24 * 1.25)
			this.context.font = "18px sans-serif"
			this.context.fillStyle = "#000"
			this.context.fillText("(" + obj.cd + ")", num * 216 + 80, this.canvas.height - 36 + 24 * 1.25)
		}
		if (!isScoreOK)
		{
			this.context.font = "bold 24px sans-serif"
			this.context.fillStyle = "#a00"
			this.context.fillText(obj.delta, num * 216 + 128, this.canvas.height - 36 + 24 * 1.25)
		}
		else
		{
			this.context.font = "24px sans-serif"
			this.context.fillStyle = "#00a"
			this.context.fillText(obj.delta, num * 216 + 128, this.canvas.height - 36 + 24 * 1.25)
		}

	}
	// 游戏结束
	gameOver()
	{
		globalScore = globalScore + storageScore;
		streakhitcnt++;
		streaksum += streak;
		streak = 0;
		// 清除定时器
		clearInterval(this.timer)
		// 清除画布
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		// 绘制背景图
		//this.drawBg()
		// 绘制提示文字
		let x = this.canvas.width / 2;
		let y = this.canvas.height / 2 - 100;
		this.context.textAlign = "center"
		this.context.font = "32px sans-serif"
		this.context.fillStyle = "#000"
		this.context.fillText("CXK，你球掉了！", x, y);
		this.context.font = "18px sans-serif"
		this.context.fillText("总得分 ", x, y + 18 * 1.5)
		this.context.font = "bold 72px sans-serif"
		this.context.fillText(globalScore, x, y + 18 * 1.5 + 72 * 1)
		this.context.font = "bold italic 24px sans-serif"
		if (hasReachedHighScore) this.context.fillStyle = "#090";
		else this.context.fillStyle = "#009";
		this.context.fillText("最高 " + this.main.score.grandHighestScore, x, y + 18 * 1.5 + 72 * 1 + 24 * 1.2);
		if (streakhitcnt > 0)
		{
			this.context.textAlign = "end"
			this.context.fillStyle = "#000";
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("接球次数", this.canvas.width - 8, this.canvas.height / 2)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText(streakhitcnt, this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2)
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("平均打点", this.canvas.width - 8, this.canvas.height / 2 - 24)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText((streaksum / streakhitcnt).toFixed(4), this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2 - 24)
		}
		this.context.textAlign = "start"
		this.context.fillStyle = "#000"
		$("#ballspeedset").removeAttr("disabled");
		// audio.pause();
		streak = 0;
		streakhitcnt = 0;
		streaksum = 0;
		globalScore = 0;
		hasReachedHighScore = 0;
	}
	// 游戏晋级
	goodGame()
	{
		globalScore = globalScore + storageScore;
		streakhitcnt++;
		streaksum += streak;
		streak = 0;
		// 清除定时器
		clearInterval(this.timer)
		// 清除画布
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		// 绘制背景图
		//this.drawBg()
		// 绘制提示文字

		let x = this.canvas.width / 2;
		let y = this.canvas.height / 2 - 100;
		this.context.textAlign = "center"
		this.context.font = "32px sans-serif"
		this.context.fillStyle = "#000"
		this.context.fillText("CXK，下一关！", x, y);
		this.context.font = "18px sans-serif"
		this.context.fillText("当前得分 ", x, y + 18 * 1.5)
		this.context.font = "bold 72px sans-serif"
		this.context.fillText(globalScore, x, y + 18 * 1.5 + 72 * 1)
		this.context.font = "bold italic 24px sans-serif"
		if (hasReachedHighScore) this.context.fillStyle = "#090";
		else this.context.fillStyle = "#009";
		this.context.fillText("最高 " + this.main.score.grandHighestScore, x, y + 18 * 1.5 + 72 * 1 + 24 * 1.2);
		if (streakhitcnt > 0)
		{
			this.context.textAlign = "end"
			this.context.fillStyle = "#000";
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("接球次数", this.canvas.width - 8, this.canvas.height / 2)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText(streakhitcnt, this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2)
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("平均打点", this.canvas.width - 8, this.canvas.height / 2 - 24)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText((streaksum / streakhitcnt).toFixed(4), this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2 - 24)
		}
		this.context.textAlign = "start"
		this.context.fillStyle = "#000"
		// audio.pause();
	}
	// 游戏通关
	finalGame()
	{
		globalScore = globalScore + storageScore;
		streakhitcnt++;
		streaksum += streak;
		streak = 0;
		// 清除定时器
		clearInterval(this.timer)
		// 清除画布
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		// 绘制背景图
		//this.drawBg()
		// 绘制提示文字

		let x = this.canvas.width / 2;
		let y = this.canvas.height / 2 - 100;
		this.context.textAlign = "center"
		this.context.font = "32px sans-serif"
		this.context.fillStyle = "#000"
		this.context.fillText("CXK，通关！", x, y);
		this.context.font = "18px sans-serif"
		this.context.fillText("总得分 ", x, y + 18 * 1.5)
		this.context.fillStyle = "#00f"
		this.context.font = "bold 72px sans-serif"
		this.context.fillText(globalScore, x, y + 18 * 1.5 + 72 * 1)
		this.context.font = "bold italic 24px sans-serif"
		if (hasReachedHighScore) this.context.fillStyle = "#090";
		else this.context.fillStyle = "#009";
		this.context.fillText("最高 " + this.main.score.grandHighestScore, x, y + 18 * 1.5 + 72 * 1 + 24 * 1.2);
		if (streakhitcnt > 0)
		{
			this.context.textAlign = "end"
			this.context.fillStyle = "#000";
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("接球次数", this.canvas.width - 8, this.canvas.height / 2)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText(streakhitcnt, this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2)
			this.context.font = "italic 18px sans-serif"
			this.context.fillText("平均打点", this.canvas.width - 8, this.canvas.height / 2 - 24)
			this.context.font = "italic bold 24px sans-serif"
			this.context.fillText((streaksum / streakhitcnt).toFixed(4), this.canvas.width - 8 - 18 * 4 - 16, this.canvas.height / 2 - 24)
		}
		this.context.textAlign = "start"
		this.context.fillStyle = "#000"
		$("#ballspeedset").removeAttr("disabled");
		// audio.pause();
		streak = 0;
		streakhitcnt = 0;
		streaksum = 0;
		globalScore = 0;
		hasReachedHighScore = 0;
	}
	// 注册事件
	registerAction(key, callback)
	{
		this.actions[key] = callback
	}
	// 小球碰撞砖块检测
	checkBallBlock(g, paddle, ball, blockList, score)
	{
		let p = paddle, b = ball
		// 小球碰撞挡板检测
		if (p.collide(b))
		{
			streaksum += streak;
			streak = 0;
			if (lashit + 200 < Date.now()) streakhitcnt++;
			lashit = Date.now();
			// 当小球运动方向趋向挡板中心时，Y轴速度取反，反之则不变
			cxk_body = 4;
			if (Math.abs(b.y + b.h / 2 - p.y + p.h / 2) > Math.abs(b.y + b.h / 2 + b.speedY - p.y + p.h / 2))
			{
				b.speedY *= -1
			}
			else
			{
				b.speedY *= 1
			}
			// 设置X轴速度
			b.speedX = p.collideRange(b)
		}
		// 小球碰撞砖块检测
		blockList.forEach(function (item, i, arr)
		{
			if (item.collide(b))
			{ // 小球、砖块已碰撞
				streak++;
				if (!item.alive)
				{ // 砖块血量为0时，进行移除
					arr.splice(i, 1)
				}
				// 当小球运动方向趋向砖块中心时，速度取反，反之则不变
				if ((b.y < item.y && b.speedY < 0) || (b.y > item.y && b.speedY > 0))
				{
					if (!item.collideBlockHorn(b))
					{
						b.speedY *= -1
					}
					else
					{ // 当小球撞击砖块四角时，Y轴速度不变
						b.speedY *= 1
					}
				}
				else
				{
					b.speedY *= 1
				}
				// 当小球撞击砖块四角时，X轴速度取反
				if (item.collideBlockHorn(b))
				{
					b.speedX *= -1
				}
				// 计算分数
				score.computeScore()
			}
		})
		// 挡板移动时边界检测
		if (p.x <= 0 - 30)
		{ // 到左边界时
			p.isLeftMove = false
		}
		else
		{
			p.isLeftMove = true
		}
		if (p.x >= canvas.clientWidth - p.w + 30)
		{ // 到右边界时
			p.isRightMove = false
		}
		else
		{
			p.isRightMove = true
		}
		// 移动小球
		b.move(g)
	}
	// 设置逐帧动画
	setTimer(paddle, ball, ballshadow, blockList, score, skillq, skillw, skille, skillr)
	{
		let g = this
		let main = g.main
		g.timer = setInterval(function ()
		{
			// actions集合
			let actions = Object.keys(g.actions)
			for (let i = 0; i < actions.length; i++)
			{
				let key = actions[i]
				if (g.keydowns[key])
				{
					// 如果按键被按下，调用注册的action
					g.actions[key]()
				}
			}
			// 当砖块数量为0时，挑战成功
			if (blockList.length == 0)
			{
				if (main.LV === main.MAXLV)
				{ // 最后一关通关
					// 升级通关
					g.state = g.state_UPDATE
					// 挑战成功，渲染通关场景
					g.finalGame()
					main.LV = 0;
				}
				else
				{ // 其余关卡通关
					// 升级通关
					g.state = g.state_UPDATE
					// 挑战成功，渲染下一关卡场景
					g.goodGame()
				}
			}
			// 判断游戏是否结束
			if (g.state === g.state_GAMEOVER)
			{
				g.gameOver()
			}
			// 判断游戏开始时执行事件
			if (g.state === g.state_RUNNING)
			{
				g.checkBallBlock(g, paddle, ball, blockList, score)
				// 绘制游戏所有素材
				g.draw(paddle, ball, ballshadow, blockList, score, skillq, skillw, skille, skillr)
			}
			else if (g.state === g.state_START)
			{
				// 绘制游戏所有素材
				g.draw(paddle, ball, ballshadow, blockList, score, skillq, skillw, skille, skillr)
			}
		}, 1000 / g.fps)
	}
	/**
	 * 初始化函数
	 */
	init()
	{
		let g = this,
			canvas = this.canvas,
			paddle = g.main.paddle,
			ball = g.main.ball,
			ballshadow = g.main.ballshadow,
			blockList = g.main.blockList,
			score = g.main.score,
			skillq = g.main.skillq,
			skillw = g.main.skillw,
			skille = g.main.skille,
			skillr = g.main.skillr
		// 设置键盘按下及松开相关注册函数
		window.addEventListener("keydown", function (event)
		{
			if (event.keyCode == 65)
			{
				g.keydowns[37] = true;
			}
			else if (event.keyCode == 68)
			{
				g.keydowns[39] = true;
			}
			else
			{
				g.keydowns[event.keyCode] = true
			}
		})
		window.addEventListener("keyup", function (event)
		{
			if (event.keyCode == 65)
			{
				g.keydowns[37] = false;
			}
			else if (event.keyCode == 68)
			{
				g.keydowns[39] = false;
			}
			else
			{
				g.keydowns[event.keyCode] = false
			}
		})
		// 设置鼠标点击
		window.addEventListener("mousedown", function (event)
		{
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			let y = event.clientY;
			let x = event.clientX;
			if (y <= clientHeight * 3 / 4)
			{
				if (x < clientWidth / 2)
				{
					g.keydowns[37] = true;
					g.keydowns[39] = false;
				}
				else
				{
					g.keydowns[37] = false;
					g.keydowns[39] = true;
				}
			}
			else
			{
				if (clientWidth * 0 / 4 <= x && x < clientWidth * 1 / 4) skillq.cast();
				if (clientWidth * 1 / 4 <= x && x < clientWidth * 2 / 4) skillw.cast();
				if (clientWidth * 2 / 4 <= x && x < clientWidth * 3 / 4) skille.cast();
				if (clientWidth * 3 / 4 <= x && x <= clientWidth * 4 / 4) skillr.cast();
			}
		})
		window.addEventListener("mouseup", function (event)
		{
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			let y = event.clientY;
			let x = event.clientX;
			if (y <= clientHeight * 3 / 4)
			{
				g.keydowns[37] = false;
				g.keydowns[39] = false;
			}
		})
		window.addEventListener("touchstart", function (event)
		{
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			let y = event.touches[0].pageY;
			let x = event.touches[0].pageX;
			if (y <= clientHeight * 3 / 4)
			{
				if (x < clientWidth / 2)
				{
					g.keydowns[37] = true;
					g.keydowns[39] = false;
				}
				else
				{
					g.keydowns[37] = false;
					g.keydowns[39] = true;
				}
			}
			else
			{
				if (clientWidth * 0 / 4 <= x && x < clientWidth * 1 / 4) skillq.cast();
				if (clientWidth * 1 / 4 <= x && x < clientWidth * 2 / 4) skillw.cast();
				if (clientWidth * 2 / 4 <= x && x < clientWidth * 3 / 4) skille.cast();
				if (clientWidth * 3 / 4 <= x && x <= clientWidth * 4 / 4) skillr.cast();
			}
			event.preventDefault();
		})
		window.addEventListener("touchend", function (event)
		{
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			let y = event.touches[0].pageY;
			let x = event.touches[0].pageX;
			if (y <= clientHeight * 3 / 4)
			{
				g.keydowns[37] = false;
				g.keydowns[39] = false;
			}
		})
		g.registerAction = function (key, callback)
		{
			g.actions[key] = callback
		}
		// 注册左方向键移动事件
		g.registerAction("37", function ()
		{
			// 判断游戏是否处于运行阶段
			if (g.state === g.state_RUNNING && paddle.isLeftMove)
			{
				move_way = 2;
				paddle.moveLeft()
			}
		})
		// 注册右方向键移动事件
		g.registerAction("39", function ()
		{
			// 判断游戏是否处于运行阶段
			if (g.state === g.state_RUNNING && paddle.isRightMove)
			{
				move_way = 1;
				paddle.moveRight()
			}
		})
		window.startGame = function ()
		{
			window.cacheBallSpeed = parseInt($("#ballspeedset").val());
			// audio.play();
			if (g.state !== g.state_UPDATE)
			{
				$("#ballspeedset").attr("disabled", "disabled");
				if (g.state === g.state_GAMEOVER)
				{ // 游戏结束时
					// 开始游戏
					g.state = g.state_START
					// 初始化
					g.main.start()
				}
				else
				{
					// 开始游戏
					ball.fired = true
					g.state = g.state_RUNNING
				}
			}
		}
		window.nextGame = function ()
		{
			// audio.play();
			if (g.state === g.state_UPDATE && g.main.LV !== g.main.MAXLV)
			{ // 进入下一关
				// 开始游戏
				g.state = g.state_START
				// 初始化下一关卡
				g.main.start(++g.main.LV)
				$("#ballspeedset").attr("disabled", "disabled");
			}
		}
		window.pauseGame = function ()
		{
			// audio.pause();
			if (g.state !== g.state_UPDATE && g.state !== g.state_GAMEOVER)
			{
				g.state = g.state_STOP
			}
		}
		window.addEventListener("keydown", function (event)
		{
			switch (event.keyCode)
			{
				// 注册回车键发射事件
				case 13:
					window.cacheBallSpeed = parseInt($("#ballspeedset").val());
					// audio.play();
					if (g.state !== g.state_UPDATE)
					{
						$("#ballspeedset").attr("disabled", "disabled");
						if (g.state === g.state_GAMEOVER)
						{ // 游戏结束时
							// 开始游戏
							g.state = g.state_START
							// 初始化
							g.main.start()
						}
						else
						{
							// 开始游戏
							ball.fired = true
							g.state = g.state_RUNNING
						}
					}
					break
				case 75:
					window.cacheBallSpeed = parseInt($("#ballspeedset").val());
					// audio.play();
					if (g.state !== g.state_UPDATE)
					{
						$("#ballspeedset").attr("disabled", "disabled");
						if (g.state === g.state_GAMEOVER)
						{ // 游戏结束时
							// 开始游戏
							g.state = g.state_START
							// 初始化
							g.main.start()
						}
						else
						{
							// 开始游戏
							ball.fired = true
							g.state = g.state_RUNNING
						}
					}
					break
				// N 键进入下一关卡
				case 78:
					// 游戏状态为通关，且不为最终关卡时
					// audio.play();
					if (g.state === g.state_UPDATE && g.main.LV !== g.main.MAXLV)
					{ // 进入下一关
						// 开始游戏
						g.state = g.state_START
						// 初始化下一关卡
						g.main.start(++g.main.LV)
						$("#ballspeedset").attr("disabled", "disabled");
					}
					break
				/*
			case 77:
				if ($("#audio").attr("src") == "media/jntm.m4a")
				{
					audio.src = "about:blank";
					audio.pause();
				}
				else
				{
					audio.src = "media/jntm.m4a";
					audio.play();
				}
				break
				*/
				// P 键暂停游戏事件
				case 80:
					if (g.state !== g.state_UPDATE && g.state !== g.state_GAMEOVER)
					{
						g.state = g.state_STOP
					}
					break
			}
		})
		// 设置轮询定时器
		g.setTimer(paddle, ball, ballshadow, blockList, score, skillq, skillw, skille, skillr)
	}
}
