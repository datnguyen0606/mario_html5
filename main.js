/*!
 * 
 *   melonJS
 *   http://www.melonjs.org
 *      
 *   Step by step game creation tutorial
 *
 **/

// game resources
var g_resources = [{
    name: "tileset",
    type: "image",
    src: "data/tileset/tileset.png"
}, {
    name: "map1",
    type: "tmx",
    src: "data/map1.tmx"
}, {
    name: "mario1",
    type: "image",
    src: "data/sprite/mario1.png"
}, {
    name: "mario2",
    type: "image",
    src: "data/sprite/mario2.png"
}, {
    name: "coin",
    type: "image",
    src: "data/sprite/coin.png"
}, {
    name: "blockcoin",
    type: "image",
    src: "data/sprite/blockcoin.png"
}, {
    name: "non_blockcoin",
    type: "image",
    src: "data/sprite/non_blockcoin.png"
}, {
    name: "blockcoin_set",
    type: "image",
    src: "data/sprite/blockcoin_set.png"
}, {
    name: "enemies",
    type: "image",
    src: "data/sprite/enemies.png"
}, {
    name: "creep",
    type: "image",
    src: "data/sprite/creep.png"
}, {
    name: "coin_set",
    type: "image",
    src: "data/sprite/coin_set.png"
}, {
    name: "mushroom",
    type: "image",
    src: "data/sprite/mushroom.png"
}];


var jsApp   = 
{   
    /* ---
    
        Initialize the jsApp
        
        ---         */
    onload: function()
    {
        
        // init the video
        if (!me.video.init('jsapp', 288, 224, false, 1.0))
        {
            alert("Sorry but your browser does not support html 5 canvas.");
         return;
        }
                
        // initialize the "audio"
        me.audio.init("mp3,ogg");
        
        // set all resources to be loaded
        me.loader.onload = this.loaded.bind(this);
        
        // set all resources to be loaded
        me.loader.preload(g_resources);

        // load everything & display a loading screen
        //me.state.change(me.state.LOADING);

        //me.debug.renderHitBox = true;
    },
    
    
    /* ---
    
        callback when everything is loaded
        
        ---                                     */
    loaded: function ()
    {
        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new PlayScreen());
      me.state.set(me.state.GAMEOVER, new OverScreen());

       // add our player entity in the entity pool
       me.entityPool.add("mainPlayer", PlayerEntity);
       me.entityPool.add("BlockCoin", BlockCoinEntity);
       me.entityPool.add("EnemyEntity", EnemyEntity);
       me.entityPool.add("CoinEntity", CoinEntity);
       me.entityPool.add("Creep", Creep);
       me.entityPool.add("mushroom", MushRoomEntity);
       me.entityPool.add("inviEntity", inviEntity);
       
   
       // enable the keyboard
       me.input.bindKey(me.input.KEY.LEFT,  "left");
       me.input.bindKey(me.input.KEY.RIGHT, "right");
       me.input.bindKey(me.input.KEY.UP,     "jump", true);
         
       mySprite = new me.SpriteObject (100, 100, me.loader.getImage("coin"));
      // start the game 
        me.state.change(me.state.PLAY);
    }

}; // jsApp

/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend(
{

   onResetEvent: function()
    {   
      // stuff to reset on state change
      me.levelDirector.loadLevel("map1");
    },
    
    
    /* ---
    
         action to perform when game is finished (state change)
        
        --- */
    onDestroyEvent: function()
    {
    
   }

});

var OverScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
    },
 
    // reset function
    onResetEvent: function() {
      me.levelDirector.loadLevel("map1");
    },
 
    // update function
    update: function() {
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
        }
        return true;      
    },
 
    // draw function
    draw: function(context) {
    },
 
    // destroy function
    onDestroyEvent: function() {
    }
 
});


//bootstrap :)
window.onReady(function() 
{
    jsApp.onload();
});
