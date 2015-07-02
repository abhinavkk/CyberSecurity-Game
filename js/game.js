var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload()
{
	game.load.image('bullet', 'images/bullet.png');
	game.load.image('ship', 'images/player.png');
	game.load.spritesheet('kaboom', 'images/explode.png', 128, 128);
	game.load.image('1wrong1', 'images/redW1.png');
	game.load.image('1wrong2', 'images/redW2.png');
	game.load.image('1wrong3', 'images/redW3.png');
	game.load.image('starfield', 'images/sky4.png');
	game.load.image('background', 'images/background2.png');
	game.load.image('bar', 'images/bar2.png');
	game.load.image('1a', 'images/1a.png');
	game.load.image('2wrong1', 'images/yellowW1.png');
	game.load.image('2wrong2', 'images/yellowW2.png');
	game.load.image('2wrong3', 'images/yellowW3.png');
	game.load.image('2a', 'images/2a.png');
	game.load.image('3wrong1', 'images/greyW1.png');
	game.load.image('3wrong2', 'images/greyW2.png');
	game.load.image('3wrong3', 'images/greyW3.png');
	game.load.image('3a', 'images/3a.png');
	game.load.image('4wrong1', 'images/orangeW1.png');
	game.load.image('4wrong2', 'images/orangeW2.png');
	game.load.image('4wrong3', 'images/orangeW3.png');
	game.load.image('4a', 'images/4a.png');
	game.load.image('5wrong1', 'images/greenW1.png');
	game.load.image('5wrong2', 'images/greenW2.png');
	game.load.image('5wrong3', 'images/greenW3.png');
	game.load.image('5a', 'images/5a.png');
	game.load.audio('plus', 'sounds/explosion.mp3');
	game.load.audio('blaster', 'sounds/blaster.mp3');
	game.load.audio('subtract', 'sounds/player_death.wav');
}

var player;
var bullets;
var blaster;
var plus;
var subtract;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var questionString = '';
var question = '';
var scoreText;
var stateText;
var options;
var bar;
var answer;
var quiz = 0;
var index = 1;
var position = new Array(3, 1, 2, 1, 0);
var problems = new Array("A small program written to alter the way a computer operates, without the permission or knowledge of the user.", "Programs that replicate themselves from system to system without the use of a host file.", "The use of social networks to repeatedly harm or harass other people in a deliberate manner is called?",
 "Efforts to temporarily or indefinitely interrupt or suspend services of a host connected to the Internet is called?.", "What is a computer software that is used to prevent, detect and remove malicious software?");

function create()
{
	// game.world.setBounds(0, 0, 1000, 600);
	game.physics.startSystem(Phaser.Physics.ARCADE);

	starfield = game.add.tileSprite(0, 0, 1000, 600, 'starfield');
	bar = game.add.tileSprite(800, 0, 6, 600, 'bar');

	//  Our bullet group
	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(30, 'bullet');
	bullets.setAll('anchor.x', 0.5);
	bullets.setAll('anchor.y', 1);
	bullets.setAll('outOfBoundsKill', true);
	bullets.setAll('checkWorldBounds', true);

	plus = game.add.audio('plus');
	subtract = game.add.audio('subtract');
	blaster = game.add.audio('blaster');

	//  The hero!
	player = game.add.sprite(400, 500, 'ship');
	player.anchor.setTo(0.5, 0.5);
	game.physics.enable(player, Phaser.Physics.ARCADE);
	player.body.collideWorldBounds = true;

	options = game.add.group();
    options.enableBody = true;
    options.physicsBodyType = Phaser.Physics.ARCADE;

    createOptions();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '50px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    // Question
    question = problems[quiz];
    questionString = game.add.text(810, 10, 'Q. ' + question, { font: '34px Arial', fill: '#fff', align: 'center' });
    questionString.wordWrap = true;
    questionString.wordWrapWidth = 180;


    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupOptions, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createOptions()
{

	var num = 1;
	for(var i=0; i<4; ++i)
	{
		// position 3 wrong options
		if(position[quiz]!=i)
		{
			var choices = options.create(i*200, 0, index + 'wrong' + num);
			choices.anchor.setTo(0.5,0.5);
			++num;

			choices.body.velocity.y = 15;
		}
	}

	//positions the correct option
	answer = game.add.sprite((position[quiz]+0.5)*200, 50, index + 'a'); 
	answer.anchor.setTo(0.5, 0.5);
	game.physics.enable(answer, Phaser.Physics.ARCADE);
	answer.body.velocity.y = 15;

	options.x = 100;
	options.y = 50;
}

function setupOptions(option)
{
	option.anchor.x = 0.5;
	option.anchor.y = 0.5;
	option.animations.add('kaboom');
}

function removeOptions(option)
{
	option.kill();
}

function update()
{
	// starfield.tilePosition.y += 2;
	game.physics.arcade.overlap(bullets, options, wrongCollisionHandler, null, this);
	game.physics.arcade.overlap(bullets, answer, correctCollisionHandler, null, this);

	player.body.velocity.setTo(0,0);

	if(cursors.left.isDown)
	{
		player.body.velocity.x = -200;
	}
	else if(cursors.right.isDown)
	{
		if(player.body.x >= 770)
			player.body.velocity.x = 0;
		else
			player.body.velocity.x = 200;
	}

	if(fireButton.isDown)
	{
		fireBullet();
	}

	options.forEach(function(item)
	{
		if(item.body.y >= 400)
		{
			item.kill();
		}
	}, this);
	if(answer.body.y >= 400)
	{
		answer.kill();
		if(quiz == 4)
		{
			stateText.text = "Your Final Score is " + score + "\nClick to restart";
			stateText.visible = true;

			//the "click to restart" handler
			game.input.onTap.addOnce(restart,this);
		}
		else
		{
			++quiz; ++index;
			createOptions();
			question = '';
			question = problems[quiz];
			questionString.text = 'Q. ' + question;

		}
	}	
}

function render()
{

}

function wrongCollisionHandler(bullet,option)
{
	bullet.kill();
	option.kill();

	score-=30;
	scoreText.text = scoreString + score;

	subtract.play();

	var explosion = explosions.getFirstExists(false);
	explosion.reset(option.body.x, option.body.y);
	explosion.play('kaboom', 30, false, true);

}

function correctCollisionHandler(bullet,option)
{
	bullet.kill();
	option.kill();

	score+=100;
	scoreText.text = scoreString + score;

	plus.play();

	var explosion = explosions.getFirstExists(false);
	explosion.reset(option.body.x, option.body.y);
	explosion.play('kaboom', 30, false, true);	

	options.forEach(removeOptions, this);

	++quiz; ++index;
	if(quiz<5)
	{
		createOptions();
		question = '';
		question = problems[quiz];
		questionString.text = 'Q. ' + question;
	}
	else
	{
		stateText.text = "Your Final Score is " + score + "\nClick to restart";
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart,this);
	}
}

function fireBullet()
{
	//  To avoid them being allowed to fire too fast we set a time limit
	if(game.time.now > bulletTime)
	{
		bullet = bullets.getFirstExists(false);

		if(bullet)
		{
			blaster.play();
			bullet.reset(player.x, player.y + 8)
			bullet.body.velocity.y = -400;
			bulletTime = game.time.now + 200;
		}
	}
}

function resetBullet(bullet)
{
	// Called if bullet goes out of the screen
	bullet.kill();
}

function restart()
{
	quiz = 0;
	index = 1;

	createOptions();
	player.revive();

	stateText.visible = false;

	score = 0;
	scoreText.text = scoreString + score;
	question = '';
	question = problems[quiz];
	questionString.text = 'Q. ' + question;
}



