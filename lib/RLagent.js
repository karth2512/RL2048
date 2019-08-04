var log=0;
import {config} from './cred.js';
firebase.initializeApp(config);
var database = firebase.database();
var defaults = {
    delay: 10 //Game speed
};
var options = defaults

var dir = {
        up: 'up',
        right: 'right',
        down: 'down',
        left: 'left'
    }

var holder = {} //Game outer holder
var content = {} //Game inner container
var matrix = [] //For the logic behind
var boxes = [] //Boxes storage
var isCheating = 0
var isGameOver = false;

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
