var PLAYER = 1000;
var INVI_OBJ = 1001;
var MUSHROOM = 2000


/*------------------- 
a player entity
-------------------------------- */
var PlayerEntity = me.ObjectEntity.extend({
 
    /* -----
 
    constructor
 
    ------ */
 
    init: function(x, y, settings, level) {
        // call the constructor
        this.parent(x, y, settings);
 
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 14);
        this.level = level;
 
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        this.collidable = true;

        this.addAnimation("stand", [6]);
        this.addAnimation("run", [0, 1, 2]);
        this.addAnimation("jump", [4]);        
        this.setCurrentAnimation("stand");
        this.type = PLAYER;

        this.upgrade = false;
        //this.updateColRect(-1, 0, -10, 20);
    },
 
    /* -----
 
    update the player pos
 
    ------ */
    update: function() {
        if (this.pos.y > 180) {
            me.state.change(me.state.GAMEOVER);
        }

        if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
            this.setCurrentAnimation("run");
        } else if (me.input.isKeyPressed('right')) {
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
            this.setCurrentAnimation("run");
        } else {
            this.vel.x = 0;
        }
        if (me.input.isKeyPressed('jump')) {
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
                this.setCurrentAnimation("stand");
            }
 
        }
 
        // check & update player movement
        this.updateMovement();
 
     // check for collision
        var res = me.game.collide(this);
     
        if (res) {
            // if we collide with an enemy
            if (res.obj.type == me.game.ENEMY_OBJECT) {
                var enemy = res.obj;
                if (this.upgrade) {
                    this.upgrade = false;
                    this.falling = false;
                }
                if ((res.y > 0) && this.falling) {                                    
                    enemy.dying = true;
                    enemy.dyding_time = me.timer.getTime();
                } else if (!enemy.dying){
                    // let's flicker in case we touched an enemy
                    if (this.level == 2) {
                        var new_mario = new PlayerEntity(this.pos.x, this.pos.y, {image: 'mario1', spritewidth: 16}, 1);
                        new_mario.upgrade = true;
                        me.game.add(new_mario, this.z);
                        me.game.sort();
                        me.game.remove(this);
                    } else {
                        me.state.change(me.state.GAMEOVER);
                    }
                    //this.flicker(45);
                }
            }
        }

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
        } else {
            this.setCurrentAnimation("stand");
        }
        this.parent();
         
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return true;
    }
 
});


/*----------------
 a Coin entity
------------------------ */
var CoinEntity = me.ObjectEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);  
        this.collecting = false;
        this.collecting_time = null;
        this.setVelocity(0, 3);

        this.addAnimation("init", [0]);
        this.addAnimation("hit", [0, 5, 4, 6]);
        this.setCurrentAnimation("init");
    },
 
    update: function() {
        if (this.collecting) {
            var current = me.timer.getTime();
            var gap = current - this.collecting_time;
            if (gap > 400) {
                me.game.remove(this);
            } else {
                this.vel.y = -this.maxVel.y * me.timer.tick;
                this.updateMovement();
                this.parent();
            }
        } else {
            var res = me.game.collide(this);
            if (res && res.obj.type == PLAYER) {
                // res.obj here is mario
                var mario = res.obj;
                if (res.y > 0 && !mario.falling) {
                    this.collecting = true;
                    this.collecting_time = me.timer.getTime();
                    this.setCurrentAnimation("hit");
                }
            }
        }
    }
 
});


var BlockCoinEntity = me.ObjectEntity.extend({

    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);

        //this.visible = false;
        this.collidable = true;
        this.addAnimation("init", [0,0,1,1,2]);
        this.addAnimation("hit", [3]);
        this.setCurrentAnimation("init"); 
    },

    update: function() {
        var res = me.game.collide(this);
        if (res && res.obj.type == PLAYER) {
            // res.obj here is mario            
            var mario = res.obj;
            if (res.y > 0 && !mario.falling) {                
                mario.falling = true;
                mario.vel.y = mario.maxVel.y * me.timer.tick;
                mario.jumping = false;
                this.setCurrentAnimation("hit");
                //me.game.remove(this);
            }
        } else {
            this.parent();
        }
    }
 
});


var EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
 
        this.startX = x;
        this.endX = x + settings.width - settings.spritewidth;
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
        this.walkLeft = true;
 
        // walking & jumping speed
        this.setVelocity(1, 6);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
        this.dying = false;
        this.dyding_time = null;
 
    },
 
    // manage the enemy movement
    update: function() {
        // do nothing if not visible
        if (!this.visible)
            return false;
 
        if (this.dying) {
            var current = me.timer.getTime();
            var gap = current - this.dyding_time
            if (gap > 600 && gap < 1200) {
                this.flicker(45);
            } else if (gap > 1200) {
                me.game.remove(this);
            }
        }

        if (this.alive && !this.dying) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            // make it walk
            this.flipX(this.walkLeft);
            this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
                 
        } else {
            this.vel.x = 0;
        }
         
        // check and update movement
        this.updateMovement();
         
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }
        return false;
    }
});


var Creep = EnemyEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "creep";
        settings.spritewidth = 16;
        settings.spriteheight = 16;

        this.parent(x, y, settings);

        this.addAnimation("init", [0, 1]);
        this.addAnimation("hit", [2]);
        this.setCurrentAnimation("init");
    },

    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
        if (this.dying) {
            this.setCurrentAnimation("hit");
        }
    },
});


var MushRoomEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
 
        // walking & jumping speed
        this.setVelocity(1, 7);
 
        // make it collidable
        //this.collidable = true;
        // make it a enemy object
        this.type = MUSHROOM;
        this.moving = false;
        this.move_right = true;
    },

    update: function() {
        var res = me.game.collide(this);        
        if (this.moving) {
            if (res) {
                if (res.obj.type == INVI_OBJ) {
                    this.move_right = false;
                } else if (res && res.obj.type == PLAYER) {
                    me.state.change(me.state.GAMEOVER);
                    // mario = res.obj;
                    // var new_mario = new PlayerEntity(mario.pos.x, mario.pos.y, {image: 'mario2', spritewidth: 16}, 2);
                    // me.game.add(new_mario, mario.z);
                    // me.game.sort();
                    // me.game.remove(mario);
                    // me.game.remove(this);

                }
            }
            if (this.move_right) {
                this.vel.x += this.accel.x * me.timer.tick;
            } else {
                this.vel.x -= this.accel.x * me.timer.tick;
            }  
            this.updateMovement();
            this.parent();
        } else {
            if (res && res.obj.type == PLAYER) {
                // res.obj here is mario
                var mario = res.obj;
                if (res.y > 0 && mario.falling) {
                    this.collidable = true;
                    this.moving = true;
                    this.vel.y = -this.maxVel.y * me.timer.tick;
                }
            }
        }
    }

});


var inviEntity = me.InvisibleEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
        this.type = 1001;
    }
});