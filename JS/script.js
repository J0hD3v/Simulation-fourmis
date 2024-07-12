// #region CLASSES

class Ant {
    constructor(name,positionX,positionY,state) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.lastPositionX = positionX;
        this.lastPositionY = positionY;
        this.state = state;
        this.lastMovementX = 0;
        this.lastMovementY = 0;
        this.speed = 10;
        this.tabPheromones = [];
    }

    move() {

        let movementX = 0;
        let movementY = 0;

        if (this.state == "searching") {
            // calcul du mouvement
            if (this.lastMovementX <= 0) {
                movementX = Math.floor(Math.random()*(this.speed+1))-(this.speed*0.65);
            } else {
                movementX = Math.floor(Math.random()*(this.speed+6))-(this.speed/2);
            }
    
            if (this.lastMovementY <= 0) {
                movementY = Math.floor(Math.random()*(this.speed+1))-(this.speed*0.65);
            } else {
                movementY = Math.floor(Math.random()*(this.speed+6))-(this.speed/2);
            }
        } else if (this.state == "fetching") {
            // calcul du mouvement
            movementX = (-(parseInt((this.positionX).replace("px","")) - anthill.positionX)) / this.speed;
            movementY = (-(parseInt((this.positionY).replace("px","")) - anthill.positionY)) / this.speed;
            // création de phéromones
            this.createPheromones();
        }

        /* 
        // ancienne version : calcul des mouvements (entre -this.speed/2 et this.speed/2)
        let movementX = Math.floor(Math.random()*(this.speed+1))-(this.speed/2);
        let movementY = Math.floor(Math.random()*(this.speed+1))-(this.speed/2);
        */
        
        // rotation de la fourmi
        // old
        /* if (movementX >= movementY) {
            tabAnts[this.name].style.transform = "rotate(90deg)";
        } else {
            tabAnts[this.name].style.transform = "rotate(0deg)";
        } */

        let rotation = 0;
        if (movementY < 0) {
            rotation += 180;
        }
        rotation += (Math.atan2(movementX, -movementY))*(180/Math.PI);
        console.log(rotation);
        tabAnts[this.name].style.transform = `rotate(${rotation}deg)`;


        // calcul de la nouvelle position
        let newAntX = (parseInt((this.positionX).replace("px",""))+movementX)+"px";
        let newAntY = (parseInt((this.positionY).replace("px",""))+movementY)+"px";
    
        let newAntX_value = parseInt((newAntX).replace("px",""));
        let newAntY_value = parseInt((newAntY).replace("px",""));
        
        // si la fourmi reste bien dans l'écran
        if (
            newAntX_value >= 0 &&
            newAntY_value >= 0 &&
            //
            newAntX_value <= window.innerWidth-20 &&
            newAntY_value <= window.innerHeight-20
        ) {
            // enregistrement du deplacement dans tabInfosAnts
            this.positionX = newAntX;
            this.positionY = newAntY;
            //
            this.lastMovementX = movementX;
            this.lastMovementY = movementY;
            // actualisation de la position de la fourmi
            tabAnts[this.name].style.left = this.positionX;
            tabAnts[this.name].style.top = this.positionY;
        }
    }

    createPheromones() {
        // creation de la div "pheromone"
        let newPheromone = document.createElement("div");
        newPheromone.className = "pheromone";
        newPheromone.style.left = this.positionX;
        newPheromone.style.top = this.positionY;
        document.body.append(newPheromone);
        tabPheromones.push(newPheromone);
        // creation de l'objet "pheromone" associé
        this.tabPheromones.push(new Pheromone (this,(tabPheromones.length)-1,this.positionX,this.positionY,20));
    }

    actualisePheromones() {
        for (let pheromone of this.tabPheromones) {
            pheromone.actualise();
        }
    }
}


class Pheromone {
    constructor (ant,index,positionX,positionY,value) {
        this.ant = ant;
        this.index = index;
        this.positionX = positionX;
        this.positionY = positionY;
        this.value = value;
    }

    actualise() {
        this.value--;
        if (this.value < 0) {
            tabPheromones[this.index].remove();
            
        }
        tabPheromones[this.index].style.opacity = (this.value)*5 +"%";
    }
}






// #region VARIABLES

const anthill = {
    div : document.querySelector(".anthill"),
    positionX : 200,
    positionY : 200
}

const tabAnts = document.querySelectorAll(".ant");

let tabInfosAnts = [];
for (let i=0 ; i<tabAnts.length ; i++) {
    tabInfosAnts.push(new Ant (i,200+"px",200+"px","searching"));
}

const tabFood = document.querySelectorAll(".food");

let tabPheromones = [];




// #region FONCTIONS

function checkCollision(div1, div2) {
    const rect1 = div1.getBoundingClientRect();
    const rect2 = div2.getBoundingClientRect();
    
    let collisionHorizontale = false;
    let collisionVerticale = false;

    // si la GAUCHE de div1 est avant la DROITE de div2
    // et la DROITE de div1 est après la GAUCHE de div2
    if(rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x) {
        collisionHorizontale = true;
    }
    // si le HAUT de div1 est avant le BAS de div2
    // et le BAS de div1 est après le HAUT de div2
    if(rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
        collisionVerticale = true;
    }

    // return VRAi si il y a collision horizontale ET verticale (superposition)
    return collisionHorizontale && collisionVerticale;
}


function moveAnts() {
    // pour l'ensemble des fourmis
    for (let ant of tabInfosAnts) {

        ant.move();
        tabInfosAnts[ant.name].actualisePheromones();

        // si collision avec de la nourriture
        for (let food of tabFood) {
            if (checkCollision(tabAnts[ant.name],food) == true) {
                tabAnts[ant.name].classList.add("fetching");
                tabInfosAnts[ant.name].speed = 20;
                tabInfosAnts[ant.name].state = "fetching";
            } else {
                // si pas collision 
                tabAnts[ant.name].classList.remove("fetching");
                tabInfosAnts[ant.name].speed = 10;
            }
        }

        // si collision avec la fourmilière
        if (checkCollision(tabAnts[ant.name],anthill.div) == true) {
            tabInfosAnts[ant.name].state = "searching";
        } else {
            // si pas collision 
            tabAnts[ant.name].classList.remove("fetching");
            tabInfosAnts[ant.name].speed = 10;
        }
    }
}




// #region EXECUTION

setInterval(() => {
    moveAnts();
},100)
