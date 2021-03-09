let OnscreenObjects = new Map();


function angleTowards(cur_pos, tow_pos){
    let vy = (cur_pos.y - tow_pos.y)
    let vx = (cur_pos.x - tow_pos.x);
    let theta = Math.atan2(vy, vx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function moveTowards(cur_pos, tow_pos, step){
    
    let vy = (cur_pos.y - tow_pos.y);
    let vx = (cur_pos.x - tow_pos.x);
    if(Math.abs(vy) < .5 && Math.abs(vx) < .5){
        return cur_pos;
    }
    let unit_vd = Math.sqrt(Math.pow((cur_pos.y - tow_pos.y),2) + Math.pow((cur_pos.x - tow_pos.x),2));
    let unit_vy = vy/unit_vd
    let unit_vx = vx/unit_vd
    let x = cur_pos.x - (step * unit_vx);
    let y = cur_pos.y - (step * unit_vy);
    return {x: x, y: y};
    
}

function moveAway(cur_pos, tow_pos, step){
    let vy = (cur_pos.y - tow_pos.y);
    let vx = (cur_pos.x - tow_pos.x);
    if(Math.abs(vy) < .5 && Math.abs(vx) < .5){
        return cur_pos;
    }
    let unit_vd = Math.sqrt(Math.pow((cur_pos.y - tow_pos.y),2) + Math.pow((cur_pos.x - tow_pos.x),2));
    let unit_vy = vy/unit_vd
    let unit_vx = vx/unit_vd
    let x = cur_pos.x + (step * unit_vx);
    let y = cur_pos.y + (step * unit_vy);
    return {x: x, y: y};
}

function getObjectsAtPosition(pos, classes){
    
    let objects = [];
    
    for(let classname of classes){
        $(classname).each(function(){
            
            try{
                
                let object = OnscreenObjects['#' + $(this).attr('id')];
                
                if(object.coversPosition(pos)){
                    objects.push(object);
                }
                
            } catch(e){
                
            }
        })
    
    }
    
    return objects;
    
}


function getRandomPointsInBounds(bounds, num_points){
    
    let random_points = [];
    
    for(let i = 0; i < num_points; i++){
    
        random_points.push({
            x : Math.random() * (bounds.bottom_right.x - bounds.top_left.x) + bounds.top_left.x,
            y : Math.random() * (bounds.bottom_right.y - bounds.top_left.y) + bounds.top_left.y
        })

    }
    
    return random_points;
}

function getObjectAtBounds(bounds, classes){
    
    let objects = [];
    let NUM_POINTS = 6;
    let random_points = getRandomPointsInBounds(bounds, NUM_POINTS);
    
    for(let pos of random_points){
        objects = objects.concat(getObjectsAtPosition(pos, classes));
    }
    
    return objects;
}

function inBounds(pos, bounds){
    if((pos.x > bounds.left && pos.x < bounds.right) &&
    (pos.y > bounds.top && pos.y < bounds.bottom )){
        return true;
    } else {
        return false;
    }
}

function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    );
}

function willCollideWith(pos, object, classes){
    let a = {
        x: pos.x,
        y: pos.y,
        width: object.width,
        height: object.height
    }
    
    let objects = new Map();
    for(let classname of classes){
        objects[classname] = [];
    }
    
    for(let classname of classes){
        $(classname).each(function(){
            
            let b = OnscreenObjects['#' + $(this).attr('id')];
            
            if(isCollide(a, b)){
                objects[classname].push(b);
            }
        })
    }
    
    return objects;
}

class OnscreenObject{
    constructor(id){
        this.id = id;
        OnscreenObjects[id] = this;
        this.x = parseFloat($(this.id).css('left'));
        this.y = parseFloat($(this.id).css('top'));
        this.tiles = new Set();
        this.prev_x = null;
        this.prev_y = null;
        this.prev_pos = null;
        this.width = parseFloat($(this.id).css('width'));
        this.height = parseFloat($(this.id).css('height'));
        this.interaction_bounds = {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            top_left : {x: this.x, y: this.y},
            bottom_right : {x: this.x + this.width, y: this.y + this.height},
            bottom_left: {x: this.x, y: this.y + this.height},
            top_right: {x: this.x + this.width, y: this.y}
        }
        this.pos = {x: this.x, y: this.y};
        console.log(this);
    }
    
    updateBounds(){
        this.interaction_bounds = {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            top_left : {x: this.x, y: this.y},
            bottom_right : {x: this.x + this.width, y: this.y + this.height},
            bottom_left: {x: this.x, y: this.y + this.height},
            top_right: {x: this.x + this.width, y: this.y}
        }
    }
    
    move(pos){
        this.prev_x = this.x;
        this.prev_y = this.y;
        this.prev_pos = {x: this.prevx, y: this.prevy};
        this.x = pos.x;
        this.y = pos.y;
        this.pos = pos;
        $(this.id).css('left', this.x);
        $(this.id).css('top', this.y);
        this.updateBounds();
    }
    
    tempMove(pos){
        this.x = pos.x;
        this.y = pos.y;
        this.pos = pos;
        $(this.id).css('left', this.x);
        $(this.id).css('top', this.y);
        this.updateBounds();
    }
    
    angle(pos){
        $(this.id + ' .main').css({'transform' : 'rotate('+ angleTowards(this.pos, pos) +'deg)'})
    }
    
    coversPosition(pos){
        return inBounds(pos, this.interaction_bounds);
    }
    
    willCollideWith(pos, classes){
        return willCollideWith(pos, this, classes);
    }
    
}

class Character extends OnscreenObject{
    constructor(id, max_health, heals, speed){
        super(id);
        this.MAX_HEALTH = max_health;
        this.health = max_health;
        this.heals = heals;
        this.speed = speed;
        this.weapons = [];
        this.powers = [];
        this.tracking = false;
        this.tracking_interval = null;
    }
    
    addWeapon(weapon){
        this.weapons.push(weapon);
    }
    
    addPower(power){
        this.weapons.push(power);
    }
    
    moveTowards(pos){
        
        this.angle(pos);
        
        this.tiles = new Set();
        
        let new_pos = moveTowards(this.pos, pos, this.speed);
        
        let objects = this.willCollideWith(new_pos, ['.chest', '.no-move']);
        
        if(objects['.chest'].length < 1){
            console.log("No chest!")
            $('#lightbox').css('display', 'none');
        }
        
        for(let object of objects['.chest']){
            
            try{
                object.interact(this);
            } catch(e){
                
            }
        }
        
        if(objects['.no-move'].length > 0){
            console.log("Wall!");
        } else {
            this.move(new_pos);
        }
    }
    
    track(pos){
        
        if(this.tracking){
            this.tracking_interval = setInterval(function(object){
                console.log(pos);
                object.moveTowards(pos);
            }, 100, this)
        } else{
            clearInterval(this.tracking_interval);
        }
        
    }
    
    damage(damage){
        this.health -= damage;
        if(this.health <= 0){
            this.retire();
        }
    }
    
}

class UserCharacter extends Character{
    constructor(id, max_health, heals, speed){
        super(id, max_health, heals, speed);
    }
    
}

class Setting extends OnscreenObject{
    constructor(id){
        super(id);
    }
}

class Tile extends Setting{
    constructor(id){
        super(id);
    }
    
    interact(object){
        object.tiles.add(this);
        console.log("Tile");
    }
}

class Chest extends Setting{
    constructor(id){
        super(id);
    }
    
    interact(object){
        
        console.log("Interacting!");
        
        let display = $('#lightbox').css('display');
        
        $('#lightbox').css('display', 'block');
        let photo_url = $(this.id).attr('content');
        $('#lightbox img').attr('src', photo_url);
        

    }
}


class Weapon extends OnscreenObject{
    
    constructor(id, damage){
        super(id);
        this.damage = damage;
    }
    
    afflict(object){
        object.damage(this.damage);
    }
    
    
}

class SWeapon extends Weapon{
    constructor(id, damage){
        super(id, damage);
    }
    
    single(pos){
        object = getObjectAtPosition(pos);
        object.interact(this);
    }
}

class Projectile extends Weapon{
    
    constructor(id, damage, speed, step, range){
        super(id, damage);
        this.speed = speed;
        this.step = step;
        this.range = range;
        this.terminus = null;
        this.traveling = false;
        this.travel_interval = null;
    }
    
    single(pos){
        object = getObjectAtPosition(pos);
        object.interact(this);
    }
    
    fire(pos){
        this.angle(pos);
        
        this.terminus = moveTowards(this.pos, pos, this.range);
        
        console.log("TERMINUS!!!!: ", this.terminus);
        
        this.traveling = true;
        
        this.travel(this.terminus);
    }
    
    travel(pos){
        
        if(this.traveling){
            this.travel_interval = setInterval(function(object){
                console.log(pos);
                object.moveTowards(pos);
            }, 100, this)
        } else{
            clearInterval(this.tracking_interval);
        }
        
    }
    
    moveTowards(pos){
        
        let new_pos = moveTowards(this.pos, pos, this.step);
        
        let objects = this.willCollideWith(new_pos, ['.chest', '.no-move']);
        
        if(objects['.chest'].length < 1){
            console.log("No chest!")
            $('#lightbox').css('display', 'none');
        }
        
        for(let object of objects['.chest']){
            
            try{
                object.interact(this);
            } catch(e){
                
            }
        }
        
        if(objects['.no-move'].length > 0){
            console.log("Wall!");
        } else {
            this.move(new_pos);
        }
        
    }
}