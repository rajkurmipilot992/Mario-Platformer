/* Created 
    Sumit Narwani -  26/09/20
    */



let config = {
    type: Phaser.AUTO,  // for setting  the graphics canvas or WebGL
    
    
    
    scale: {
        mode: Phaser.Scale.FIT,
        
        // For centering of the canvas/game world
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        
    },
    
    backgroundColor: 0xffff11,
    
    // Phaser provides some physics engines to configure and use (to add laws of motion to the game)
    physics: {
        default: 'arcade',
        arcade: {
            gravity:{
                y: 1000,   // more the value, more the gravitational force (x and y for axis in which we want gravity)
            },
            debug: false,   //used to see the bounding boxes for the game elements(blue-static object,green-denotes velocity,purple-dynamic object)
        }
    },
    
    scene: {
        preload:preload,
        create:create,
        update:update,  
    
    }       

};


let player_config = {
    player_speed : 150, 
    player_jumpspeed : -700,
    player_score : 0,
}

let game = new Phaser.Game(config);

function preload(){
    this.load.image("ground", "Assets/topground.png");
    this.load.image("sky", "Assets/background.png");
    this.load.image("apple", "Assets/apple.png");
    
    // Loaded using spritesheet because it contains multiple images of width 32px each and height 48px.
    this.load.spritesheet("dude", "Assets/dude.png", {frameWidth:32, frameHeight:48});
    
    this.load.image("ray","Assets/ray.png");
    
    // Full Screen Image
    this.load.spritesheet('fullscreen', 'Assets/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    
    // Audio
    this.load.audio("numkey","Assets/numkey.mp3");
    this.load.audio("GameOver","Assets/GameOverAudio1.mp3");
}

function create(){
    W = game.config.width;
    H = game.config.height;
    
    
    // add tileSprites (repeating images)
    let ground = this.add.tileSprite(0, H-128, W, 128, "ground");
    ground.setOrigin(0,0);
    
    
    // try to create a background
    let background = this.add.sprite(0,0,"sky");
    background.setOrigin(0,0);
    background.displayWidth = W;
    background.displayHeight = H;
    background.depth = -2;
    
    // Create rays on the top of our background
    let rays = [];
    
    for(let i=-10; i<=10;i++){
        let ray = this.add.sprite(W/2, H-128, 'ray');  
        ray.displayHeight = 1.2*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = -1;
        rays.push(ray);
    }
    console.log(rays);
    
    // Rotating these rays using tween
    this.tweens.add({
        targets : rays,
        props : {
            angle :{
                value : "+=20",
            }
        },
        duration : 8000,
        repeat : -1,
    })
    
    // Here the fourth parameter given is the index for the image in spritesheet which we want here.
    this.player = this.physics.add.sprite(70, 100, "dude", 4);
    console.log(this.player);
    
    
    // Set the bounce value for the player (elastic collision)
    // this.player.setBounce(1);                              // value 1 means no energy will be lost and it will keep bouncing forever
    this.player.setBounce(0.3);
    
    
    // dont allow player to move out of the game world
    this.player.setCollideWorldBounds(true);
    
    
    
    // Player animations and player movements.
    // Left Animation
    this.anims.create({
        key : 'left',
        frames : this.anims.generateFrameNumbers('dude',{start:0,end:3}),
        frameRate : 10,
        repeat : -1,
    });
    
    // Center Animation
      this.anims.create({
        key : 'center',
        frames : [{key:'dude', frame:4}],
        frameRate : 10,
    });
    
    
    // Right Animation 
      this.anims.create({
        key : 'right',
        frames : this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate : 10,
        repeat : -1,
    });
    
    
    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();  
    
    
    
    // Add a group of apples = physical objects
    let fruits = this.physics.add.group({
        key : "apple",
        repeat : 8,
        
        // Set the scaling to reduce the size of the apple (0.2 means 20%)
        setScale : {x:0.2, y:0.2},
        setXY : {x:10, y:0, stepX:100},
    });
    
    // Add bouncing effect to all the apples  (calling setBounce function to set the random bounce for all the apples)
    fruits.children.iterate(function(f){
        f.setBounceY(Phaser.Math.FloatBetween(0.4,0.7));
    })
    
    
    // Create more platforms (static objects)
    let platforms = this.physics.add.staticGroup();
    platforms.create(500,350,'ground').setScale(2, 0.5).refreshBody();
    platforms.create(700,200,'ground').setScale(2, 0.5).refreshBody();
    platforms.create(100,200,'ground').setScale(2, 0.5).refreshBody();
    
    // This statement add ground in the group of platforms only (as ground has the same functionality/working as the platforms)
    platforms.add(ground);
    
    
    // This sets the ground to be static object(body) and does the working same as below three steps can do.
    this.physics.add.existing(ground, true);
    
               
    // this.physics.add.existing(ground);
    // ground.body.allowGravity = false;
    // round.body.immovable = true;
    
          
    // Add a collision detection between the player and the ground
    this.physics.add.collider(this.player, platforms);
    // this.physics.add.collider(this.player, ground);
    
    // Add a collision detection between the fruits and the ground
    // this.p0h00ysics.add.collider(fruits,ground);
    
    // Add a collision detection between fruits and the platform
    this.physics.add.collider(fruits,platforms);
    
    
    // Overlapping between the player and fruits
    this.physics.add.overlap(this.player, fruits, eatFruit, null, this);
    
    
    // Create cameras
    this.cameras.main.setBounds(0,0,W,H);
    
    // World is the total area in our game, that can be bigger than the screen size
    this.physics.world.setBounds(0,0,W,H);
    
    this.cameras.main.startFollow(this.player,true,true);   
    this.cameras.main.setZoom(1.5);

    
    font_style = {
        font : "bold 20px Arial",
        align : "center",
        color : "brown",
        fill : '#000',
    }
    
    // Displaying Score and Other Text
    this.game_text = this.add.text(10,10,"Welcome to Mini Mario",font_style);
    this.scoreText = this.add.text(40,40,'score : 0',font_style);

    
    // Button created to switch to full screen mode and then exit from fullscreen.
    var button = this.add.image(300, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
    button.setScale(0.5,0.5);
        
        
        button.on('pointerup', function () {

            if (this.scale.isFullscreen)
            {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);

        
        // Keyboard input for entering and exiting from the full screen.
        var FKey = this.input.keyboard.addKey('F');

        FKey.on('down', function () {

            if (this.scale.isFullscreen)
            {
                button.setFrame(0);             // set frame for identifying the image to display from the fullscreen sprite
                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);
                this.scale.startFullscreen();
            }

        }, this);
    
   
//    soundSample.stop();
//    soundSample.pause();
//    soundSample.resume();
    }



function update(){
    
    if(this.cursors.left.isDown){
        // this.player.setVelocity(-150);
         this.player.setVelocityX(-player_config.player_speed);
        
        // Left Animation called when left cursor(keyboard button) is pressed.
         this.player.anims.play('left', true);
    }
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        
        // Right Animation called when right cursor(keyboard button) is pressed.
        this.player.anims.play('right', true);
    }
    else{
        this.player.setVelocityX(0);
        
        // Rest of the time when no key is pressed, it remains to the center position.
        this.player.anims.play('center', true);
    }
    
    
    // Add jumping ability, stop the player when in air
    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(player_config.player_jumpspeed);
    }
    
    //this.game_text1 = this.add.text(40,40,player_config.player_score,font_style);
    
}



function eatFruit(player, fruit){
    
 
    fruit.disableBody(true, true);
    player_config.player_score += 50;
    
    console.log(player_config.player_score);
    this.scoreText.setText('Score : ' + player_config.player_score);
    
    this.soundSample = this.sound.add("numkey");
    this.soundSample.play();
   
    if(player_config.player_score == 400){
        
         this.game_text = this.add.text(W/2-50,H-520,"Game Over",{
            font : "bold 70px Comic Sans MS",
            align : "center",
            color : "black",
            fill : '#000',
    });
         this.scoreText = this.add.text(W/2,H-350,'score : 0',{
            font : "bold 50px Arial",
            align : "center",
            color : "black",
            fill : '#000',
    });
        this.scoreText.setText('Score : ' + player_config.player_score);    
         
            
            // Game Over Audio
            this.GameOverSound = this.sound.add("GameOver");
            this.GameOverSound.play();
        
           
    
}}
