let walrus = new UserCharacter('#walrus', 10, 20, 10);
let limon_projectile = new Projectile('#walrus-weapon', 10, 20, 20, 10000);

let mouse = {x:0, y:0};

let tracking = false;

let tracking_interval = null;

function track(timeout){
    
}

$(document).bind('mousemove',function(e){
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    
    if(!walrus.tracking){
        walrus.angle(mouse);
    }
    
});

$(document).on('click', function(e){
    console.log(mouse);
})

/*let stroke_map = {};
onkeydown = onkeyup = function(e){
    e = e || event;
    stroke_map[e.keyCode] = e.type == 'keydown';
}*/

$(document).on('keydown', function(key){
    
    
    if(key.keyCode === 90){
        
        walrus.tracking = !walrus.tracking;
        
        walrus.track(mouse);
        
    }
    
    if(key.keyCode === 88){
        
        limon_projectile.traveling = !limon_projectile.traveling;
        
        limon_projectile.fire(mouse);
    }
      
})
