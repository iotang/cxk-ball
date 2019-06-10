class Skill
{
	/**
	 * 
	 * @param {*} main 
	 * @param {string} name 技能名称
	 * @param {*} icon 技能图标
	 * @param {string} desc 技能描述
	 * @param {number} cd 技能冷却时间，单位秒
	 * @param {number} cost 技能消耗
	 * @param {number|string} keyCode 按键
	 */
	constructor(main, name, icon, desc, cd, cost, keyCode)
	{
		this.main = main;
		this.name = name;
		this.icon = icon;
		this.desc = desc;
		this.cd = cd;
		this.cost = cost;
		this.delta = 0;
		if (typeof keyCode === "number")
		{
			this.keyCode = keyCode;
		}
		else if (typeof keyCode === "string" && keyCode.length === 1)
		{
			this.keyCode = keyCode.toUpperCase().charCodeAt(0);
		}
		else
		{
			throw new Error(`技能 ${name} 无法绑定按键 "${keyCode}"`);
		}
		this.lastCastTime = 0;

		this.bindKey();
	}

	refresh()
	{
		this.lastCastTime = 0;
		this.delta = Math.ceil(this.cost * Math.pow(window.cacheBallSpeed, 2.9));
	}

	bindKey()
	{
		window.addEventListener("keydown", (event) =>
		{
			if ((typeof this.keyCode === "number" && event.keyCode === this.keyCode)
				|| (Array.isArray(this.keyCode) && this.keyCode.indexOf(event.keyCode) >= 0)
			)
			{
				try
				{
					this.cast();
				} catch (e)
				{
					// TODO 使用更好的方式提示
					console.log("技能释放失败：", e.message);
				}
			}
		});

		const keyName = typeof this.keyCode === "number" ? String.fromCharCode(this.keyCode) : this.keyCode.map(key => String.fromCharCode(key)).join("/");

		this.delta = Math.ceil(this.cost * Math.pow(window.cacheBallSpeed, 2.9));
		console.log(`CXK 已加载技能：[${keyName}]${this.name}，冷却 ${this.cd}，消耗 ${this.delta}`);
		this.lastCastTime = 0;
	}

	/**
	 * 释放技能
	 */
	cast()
	{
		let nowtime = Date.now();

		if (this.lastCastTime + this.cd * 1000 > nowtime)
		{
			let distan = this.cd - ((this.lastCastTime + this.cd * 1000) - nowtime) / 1000.00;
			distan = distan.toFixed(2);
			this.isRunning = 0;
			throw new Error(`技能尚未冷却 (${distan} / ${this.cd})`);
		}
		if (this.main.score.allScore < this.delta)
		{
			this.isRunning = 0;
			throw new Error(`积分不足 (${this.main.score.allScore} / ${this.delta})`);
		}

		this.lastCastTime = nowtime; // 更新上次释放时间
		this.main.score.scorepunishment += this.delta;  // 扣除积分
		this.main.score.computeScore();
		// TODO 显示释放技能的特效

		console.log(`CXK 消耗了 ${this.delta} 积分发动了技能 ${this.name}！\n${this.desc}`);

		return 0;
	}
}

class SkillQ extends Skill
{
	constructor(main)
	{
		super(main,
			"意念控球",
			"",
			"CXK 使用意念控制球转向一次，朝向离球最近的一个砖块",
			3,
			4,
			"Q");
	}

	/**
	 * 计算球和砖块的距离(的平方)
	 * @param {*} ball 
	 * @param {*} block 
	 */
	static calDistance(ball, block)
	{
		return Math.pow(ball.x - block.x, 2) + Math.pow(ball.y - block.y, 2);
	}

	cast()
	{
		if (super.cast() != 0)
		{
			return;
		};
		const { blockList, ball } = this.main;
		console.log(blockList)
		let targetBlock = null;
		let targetDistance = null;

		// 获取距离球最近的砖块
		blockList.forEach(block =>
		{
			const blockDistance = SkillQ.calDistance(ball, block);
			if (!targetDistance || blockDistance < targetDistance)
			{
				targetBlock = block;
				targetDistance = blockDistance;
			}
		});

		// 使用意念控制球转向
		ball.speedX = ball.x - targetBlock.x;
		ball.speedY = ball.y - targetBlock.y;
		if (ball.speedY == 0)
		{
			ball.speedY = 0.01;
		}
		let per = Math.abs(window.cacheBallSpeed / ball.speedY);
		ball.speedX = ball.speedX * per;
		ball.speedX = Math.min(ball.speedX, 60);
		ball.speedX = Math.max(ball.speedX, -60);
		if (ball.speedY >= 0) ball.speedY = window.cacheBallSpeed;
		else ball.speedY = -window.cacheBallSpeed;
	}
}

class SkillW extends Skill
{
	constructor(main)
	{
		super(main,
			"虚鲲鬼步",
			"",
			"CXK 发动在美国校队时领悟的绝技，5 秒内让篮球跟着 CXK",
			15,
			20,
			"W");
		this.duration = 5;  // 持续5秒
	}

	cast()
	{
		if (super.cast() != 0)
		{
			return;
		};
		const { paddle, ball } = this.main;
		this.casting = setInterval(() =>
		{
			ball.x = paddle.x + paddle.w / 2;
			ball.speedX = 0;
		}, 1000 / 60);
		setTimeout(() =>
		{
			clearInterval(this.casting);
			ball.speedX = 0;
		}, this.duration * 1000);
	}
}

class SkillE extends Skill
{
	constructor(main)
	{
		super(main,
			"闪烁之鲲",
			"",
			"CXK 利用自己长期跳舞的经验，向当前方向闪烁一小段距离",
			0.2,
			1.25,
			"E");
	}

	cast()
	{
		if (super.cast() != 0)
		{
			return;
		};
		const { paddle, ball } = this.main;

		let transdis = 150;

		if (move_way == 2)
		{
			if (ball.x < paddle.x && ball.y + 80 > paddle.y) paddle.x = Math.max(ball.x, paddle.x - transdis);
			else paddle.x = Math.max(-30, paddle.x - transdis);
		}
		if (move_way == 1)
		{
			if (ball.x > paddle.x && ball.y + 80 > paddle.y) paddle.x = Math.min(ball.x, paddle.x + transdis);
			else paddle.x = Math.min(paddle.x + transdis, canvas.width - 40);
		};
	}
}

class SkillR extends Skill
{
	constructor(main)
	{
		super(main,
			"爱坤之祝",
			"",
			"ikun 们对 CXK 施加祝福，其它技能的 CD 和消耗降低了",
			30,
			6,
			"R");
		this.duration = 10;  // 持续10秒
	}

	cast()
	{
		if (super.cast() != 0)
		{
			return;
		};
		const { game, skillq, skillw, skille } = this.main;

		var skillqcd, skillwcd, skillecd;
		var skillqdlt, skillwdlt, skilledlt;
		var isover = 0;

		skillqcd = skillq.cd;
		skillwcd = skillw.cd;
		skillecd = skille.cd;
		skillqdlt = skillq.delta;
		skillwdlt = skillw.delta;
		skilledlt = skille.delta;

		this.casting = setInterval(() =>
		{
			if (game.state == game.state_GAMEOVER || game.state == game.state_UPDATE)
			{
				isover = 1;
				skillq.cd = skillqcd;
				skillw.cd = skillwcd;
				skille.cd = skillecd;
				skillq.delta = skillqdlt;
				skillw.delta = skillwdlt;
				skille.delta = skilledlt;
				clearInterval(this.casting);
			}
			if (!isover)
			{
				skillq.cd = skillqcd / 2;
				skillw.cd = skillwcd / 2;
				skille.cd = skillecd / 2;
				skillq.delta = Math.ceil(skillqdlt / 3);
				skillw.delta = Math.ceil(skillwdlt / 3);
				skille.delta = Math.ceil(skilledlt / 3);
			}
		}, 125);

		setTimeout(() =>
		{
			if (!isover)
			{
				clearInterval(this.casting);
				skillq.cd = skillqcd;
				skillw.cd = skillwcd;
				skille.cd = skillecd;
				skillq.delta = skillqdlt;
				skillw.delta = skillwdlt;
				skille.delta = skilledlt;
			}
		}, this.duration * 1000);
	}
}
