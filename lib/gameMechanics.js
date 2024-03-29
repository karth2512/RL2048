var defaults = {
    delay: 10 //Game speed
};

var _this = $('#2048');

var options = defaults

var dir = {
        up: 'up',
        right: 'right',
        down: 'down',
        left: 'left'
    }


var log=0;
import {config} from './cred.js';
firebase.initializeApp(config);
var database = firebase.database();

var holder = {} //Game outer holder
var content = {} //Game inner container
var matrix = [] //For the logic behind
var boxes = [] //Boxes storage
var isCheating = 0
var isGameOver = false;


/**
 * Restart the game by recreate all DOM elements.
 */
function resetGame() {
    //Reset the props
    boxes = [];
    matrix = [];
    isCheating = 0;
    isGameOver = false;
    //Recreate DOM elements
    holder = $('<div>').addClass('holder2048');
    content = $('<div>').addClass('container').appendTo(holder);
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            //Reset matrix
            matrix[i * 4 + j] = {
                top: i * 70,
                left: j * 70,
                taken: false,
                combined: false,
                value: 0
            };
            //This is for the borders of each cell.
            $('<div>').addClass('mask').css({
                left: j * 70 + "px",
                top: i * 70 + "px"
            }).appendTo(content);
        }
    }
    //Create the first box on board
    createBox();
    //Insert game holder and anything to whoever calls this function
    _this.html(holder);
}

/**
 * Create a box and add to game
 * Takes 1 or 0 param.
 *
 * @param value
 */
function createBox(value) {
    //Check if there are spaces for a new box or not
    var emptyMatrix = 0;
    for (var i = 0; i < matrix.length; i++) {
        if (!matrix[i].taken) {
            emptyMatrix++;
        }
    }
    if (emptyMatrix === 0) {
        return;
    }
    //Chose an actual index (means not taken) randomly for the new box
    var random = Math.floor(Math.random() * emptyMatrix + 1);
    var chosenIndex = 0;
    for (var j = 0; chosenIndex < matrix.length; chosenIndex++) {
        while (matrix[chosenIndex].taken) {
            chosenIndex++;
        }
        if (++j === random) {
            matrix[chosenIndex].taken = true;
            break;
        }
    }
    //Do the create job
    value = value ? value : (Math.floor(Math.random() * 4 + 1) === 4 ? 4 : 2); //Use the value parse in or (1/4 -> 4 or  3/4 -> 2)
    var newBox = $('<div>').addClass('box').attr({
        position: chosenIndex,
        value: value
    }).css({
        marginTop: matrix[chosenIndex].top + 2,
        marginLeft: matrix[chosenIndex].left + 2,
        opacity: 0
    }).text(value).appendTo(content).animate({
        opacity: 1
    }, options.delay * 2);
    //Finally push it to the boxes array
    boxes.push(newBox);
}

/**
 * Combine 2 boxes into 1
 * @param source
 * @param target
 * @param value
 */
function combineBox(source, target, value) {
    var _value = parseInt(value) * 2;
    boxes[target].attr('value', _value).html(_value).css({
        zIndex: 99
    }).animate({
        width: '+=20',
        height: '+=20',
        marginTop: '-=10',
        marginLeft: '-=10'
    }, options.delay / 2, function () {
        $(this).animate({
            width: '-=20',
            height: '-=20',
            marginTop: '+=10',
            marginLeft: '+=10'
        }, options.delay / 2, function () {
            $(this).css({
                zIndex: 1
            })
        })
    });
    boxes[source].remove();
    boxes.splice(source, 1);
}

/**
 * Check if game over
 * @returns {boolean}
 */
function gameOver() {
	//console.log(boxes)
    if (boxes.length != 16) {
        return false;
    }
    var i, a, b;
    for (i = 0; i < 16; i++) {
        for (a = 0; a < 16; a++) {
            if (boxes[a].attr('position') == i)
                break;
        }
        if (i % 4 != 3) {
            for (b = 0; b < 16; b++) {
                if (boxes[b].attr('position') == i + 1)
                    break;
            }
            if (boxes[a].attr('value') == boxes[b].attr('value'))
                return false;
        }
        if (i < 12) {
            for (b = 0; b < 16; b++) {
                if (boxes[b].attr('position') == i + 4)
                    break;
            }
            if (boxes[a].attr('value') == boxes[b].attr('value'))
                return false;
        }
    }
    return true;
}

/**
 * Game run
 * @param dir
 */
function gameRun(dir) {
    if (isGameOver) {
        return;
    }
    if (run(dir)) {
        createBox();
    }
    if (gameOver()) {
        isGameOver = true;
        console.log("Game Over");
		//send negative
		
    }
}

/**
 * Bind keyboard and screen touch events to game
 */
function bind() {
    $(window).keydown(function (event) {
        if (!isGameOver) {
            if (event.which == 37) {
                event.preventDefault();
                gameRun(dir.left);
            } else if (event.which == 38) {
                event.preventDefault();
                gameRun(dir.up);
            } else if (event.which == 39) {
                event.preventDefault();
                gameRun(dir.right);
            } else if (event.which == 40) {
                event.preventDefault();
                gameRun(dir.down);
            }
        }
    });
    var touchStartClientX, touchStartClientY;
    document.addEventListener("touchstart", function (event) {
        if (event.touches.length > 1)
            return;
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
    });
    document.addEventListener("touchmove", function (event) {
        event.prevMatrixentDefault();
    });
    document.addEventListener("touchend", function (event) {
        if (event.touches.length > 0)
            return;
        var dx = event.changedTouches[0].clientX - touchStartClientX;
        var absDx = Math.abs(dx);
        var dy = event.changedTouches[0].clientY - touchStartClientY;
        var absDy = Math.abs(dy);
        if (Math.max(absDx, absDy) > 10) {
            if (absDx > absDy) {
                if (dx > 0) {
                    gameRun(dir.right);
                } else {
                    gameRun(dir.left);
                }
            } else {
                if (dy > 0) {
                    gameRun(dir.down);
                } else {
                    gameRun(dir.up);
                }
            }
        }
    });
}

/**
 * [WARNING] This method is ugly enough for now. Waiting for refactor.
 *
 * Make a single game move.
 * Takes 1 param.
 *
 * @param dir
 * @returns {boolean}
 */
function run(dir) {
    var isMoved = false; //This is to indicate that if the game actually moved after calling this function
    var i, j, k, empty, _empty, position, value1, value2, temp; //Junks
    //Reset the matrix attr 'combined' before moving
    for (i = 0; i < 16; i++) {
        matrix[i].combined = false;
    }
    if (dir == "left") {
        isCheating = -1;
        for (i = 0; i < 4; i++) {
            empty = i * 4;
            _empty = empty;
            for (j = 0; j < 4; j++) {
                position = i * 4 + j;
                if (!matrix[position].taken) {
                    continue;
                }
                if (matrix[position].taken && position === empty) {
                    empty++;
                    if (empty - 2 >= _empty) {
                        for (k = 0; k < boxes.length; k++) {
                            if (boxes[k].attr("position") == position) {
                                break;
                            }
                        }
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty - 2) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty - 2].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty - 1].taken = false;
                            matrix[empty - 2].combined = true;
                            empty--;
                            isMoved = true;
                        }
                    }
                } else {
                    for (k = 0; k < boxes.length; k++) {
                        if (boxes[k].attr("position") == position) {
                            break;
                        }
                    }
                    boxes[k].animate({
                        marginLeft: matrix[empty].left + 2,
                        marginTop: matrix[empty].top + 2
                    }, options.delay);
                    boxes[k].attr('position', empty);
                    matrix[empty].taken = true;
                    matrix[position].taken = false;
                    empty++;
                    isMoved = true;
                    if (empty - 2 >= _empty) {
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty - 2) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty - 2].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty - 1].taken = false;
                            matrix[empty - 2].combined = true;
                            empty--;
                        }
                    }
                }
            }
        }
    } else if (dir == "right") {
        isCheating = -1;
        for (i = 3; i > -1; i--) {
            empty = i * 4 + 3;
            _empty = empty;
            for (j = 3; j > -1; j--) {
                position = i * 4 + j;
                if (!matrix[position].taken) {
                    continue;
                }
                if (matrix[position].taken && position === empty) {
                    empty--;
                    if (empty + 2 <= _empty) {
                        for (k = 0; k < boxes.length; k++) {
                            if (boxes[k].attr("position") == position) {
                                break;
                            }
                        }
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty + 2) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty + 2].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty + 1].taken = false;
                            matrix[empty + 2].combined = true;
                            empty++;
                            isMoved = true;
                        }
                    }
                } else {
                    for (k = 0; k < boxes.length; k++) {
                        if (boxes[k].attr("position") == position) {
                            break;
                        }
                    }
                    boxes[k].animate({
                        marginLeft: matrix[empty].left + 2,
                        marginTop: matrix[empty].top + 2
                    }, options.delay);
                    boxes[k].attr('position', empty);
                    matrix[empty].taken = true;
                    matrix[position].taken = false;
                    empty--;
                    isMoved = true;
                    if (empty + 2 <= _empty) {
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty + 2) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty + 2].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty + 1].taken = false;
                            matrix[empty + 2].combined = true;
                            empty++;
                        }
                    }
                }
            }
        }
    } else if (dir == "up") {
        isCheating = -1;
        for (i = 0; i < 4; i++) {
            empty = i;
            _empty = empty;
            for (j = 0; j < 4; j++) {
                position = j * 4 + i;
                if (!matrix[position].taken) {
                    continue;
                }
                if (matrix[position].taken && position === empty) {
                    empty += 4;
                    if (empty - 8 >= _empty) {
                        for (k = 0; k < boxes.length; k++) {
                            if (boxes[k].attr("position") == position) {
                                break;
                            }
                        }
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty - 8) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty - 8].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty - 4].taken = false;
                            matrix[empty - 8].combined = true;
                            empty -= 4;
                            isMoved = true;
                        }
                    }
                } else {
                    for (k = 0; k < boxes.length; k++) {
                        if (boxes[k].attr("position") == position) {
                            break;
                        }
                    }
                    boxes[k].animate({
                        marginLeft: matrix[empty].left + 2,
                        marginTop: matrix[empty].top + 2
                    }, options.delay);
                    boxes[k].attr('position', empty);
                    matrix[empty].taken = true;
                    matrix[position].taken = false;
                    empty += 4;
                    isMoved = true;
                    if (empty - 8 >= _empty) {
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty - 8) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty - 8].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty - 4].taken = false;
                            matrix[empty - 8].combined = true;
                            empty -= 4;
                        }
                    }
                }
            }
        }
    } else if (dir == "down") {
        if (isCheating != -1) {
            isCheating++;
            if (isCheating == 10) {
                return true;
            }
        }
        for (i = 0; i < 4; i++) {
            empty = i + 12;
            _empty = empty;
            for (j = 3; j > -1; j--) {
                position = j * 4 + i;
                if (!matrix[position].taken) {
                    continue;
                }
                if (matrix[position].taken && position === empty) {
                    empty -= 4;
                    if (empty + 8 <= _empty) {
                        for (k = 0; k < boxes.length; k++) {
                            if (boxes[k].attr("position") == position) {
                                break;
                            }
                        }
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty + 8) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty + 8].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty + 4].taken = false;
                            matrix[empty + 8].combined = true;
                            empty += 4;
                            isMoved = true;
                        }
                    }
                } else {
                    for (k = 0; k < boxes.length; k++) {
                        if (boxes[k].attr("position") == position) {
                            break;
                        }
                    }
                    boxes[k].animate({
                        marginLeft: matrix[empty].left + 2,
                        marginTop: matrix[empty].top + 2
                    }, options.delay);
                    boxes[k].attr('position', empty);
                    matrix[empty].taken = true;
                    matrix[position].taken = false;
                    empty -= 4;
                    isMoved = true;
                    if (empty + 8 <= _empty) {
                        value1 = boxes[k].attr('value');
                        for (temp = 0; temp < boxes.length; temp++) {
                            if (boxes[temp].attr("position") == empty + 8) {
                                break;
                            }
                        }
                        value2 = boxes[temp].attr('value');
                        if (value1 == value2 && !matrix[empty + 8].combined) {
                            combineBox(k, temp, value1);
                            matrix[empty + 4].taken = false;
                            matrix[empty + 8].combined = true;
                            empty += 4;
                        }
                    }
                }
            }
        }

    }
    return isMoved;
}

resetGame();
bind();
// create an environment object
var env = {};
env.getNumStates = function() { return 16; }
env.getMaxNumActions = function() { return 4; }

// create the DQN agent
var spec = {} // see full options on DQN page
spec.update = 'qlearn';
spec.gamma = 0.1; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.05; // value function learning rate
spec.experience_add_every = 1; // number of time steps before we add another experience to replay memory
spec.experience_size = 40000000000000000; // size of experience replay memory
spec.learning_steps_per_iteration = 20;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 500 // number of neurons in hidden layer

var agent = new RL.DQNAgent(env, spec); 
firebase.database().ref('RLv1Agent/').on("value", function(snapshot)
{
    agent.fromJSON(JSON.parse(snapshot.val()));
    console.log(snapshot.val());
}, 
function (error) {
    console.log("Error: " + error.code);
});

var noChange=0;
setInterval(function(){ 
    // start the learning loop
    var states=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var grid = document.getElementsByClassName("box");
    for (var a=0;a<grid.length;a++)
    {
        states[grid[a].getAttribute('position')]=parseInt(grid[a].getAttribute('value'))
    }
    //console.log(states);
    var prevMatrix = states;
    var action = agent.act(states); // s is an array of length 8
    //console.log(action+37);
    const ke = new KeyboardEvent("keydown", {bubbles: true, cancelable: true, keyCode: action+37});
    document.body.dispatchEvent(ke)
    var states=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var grid = document.getElementsByClassName("box");
    for (var a=0;a<grid.length;a++)
    {
        states[grid[a].getAttribute('position')]=parseInt(grid[a].getAttribute('value'))
    }
    //console.log(prevMatrix);
    //console.log(states);
    var reward=getrewardard(prevMatrix,states);
    //console.log(reward);
    agent.learn(reward); // the agent improves its Q,policy,model, etc. rewardard is a float

}, 100);

var record = [];
var samerecord = [];
function saveAgent(Agent)
{
    firebase.database().ref('RLv1Agent/').set(JSON.stringify(Agent.toJSON()));
}
function saveRecord()
{
    firebase.database().ref('RLv1-Max/'+log).set(record.join());
    firebase.database().ref('RLv1-Same/'+log).set(samerecord.join());
    log=log+1;
    var h3 = document.getElementsByTagName('h3')[0]
    h3.innerHTML=log;
}
function getrewardard(prevMatrix,currentMatrix){
    //console.log(isGameOver);
    var same = true;
    var rewardard = 0;
    var pointBase = 2;
    var penalty = -1000000;
    var prevMatrixCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var currentMatrixCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (var c=0;c<16;c++)
    {
        if(prevMatrix[c]==0)
            prevMatrixCount[0]+=1
        else
            prevMatrixCount[Math.log(prevMatrix[c])/Math.log(2)]+=1     
    }
    //console.log(prevMatrixCount)
    for (var c=0;c<16;c++)
    {
        if(currentMatrix[c]==0)
            currentMatrixCount[0]+=1
        else
            currentMatrixCount[Math.log(currentMatrix[c])/Math.log(2)]+=1       
    }
    //console.log(currentMatrixCount)
    for(var c=0;c<16;c++)
    {
        var temp=currentMatrixCount[c]-prevMatrixCount[c];
        if(temp!=0)
        {
            same=false
            rewardard+=Math.abs(temp*Math.pow(pointBase,c));
        }
    }

    if(same)
    {
        rewardard = penalty;
        noChange+=1;
    }
    if(isGameOver)
    {
        var max = Math.max.apply(null,currentMatrix);
        record.push(max);
        samerecord.push(noChange);
        var h2 = document.getElementsByTagName('h2')[0]
        if(parseInt(h2.innerHTML)%10==0)
        {
            saveAgent(agent);
            saveRecord();
            record = [];
            samerecord =[];
        }
        h2.innerHTML=parseInt(h2.innerHTML)+1
        noChange=0;
        resetGame();
        bind();
    }
    //console.log(rewardard);
    return rewardard;
}
