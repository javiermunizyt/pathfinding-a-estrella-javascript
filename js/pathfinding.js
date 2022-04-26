/*
Creado por Javier Muñiz @javianmuniz para
el canal de YouTube "Programar es increíble"

Suscríbete para más vídeos y tutoriales:
https://www.youtube.com/channel/UCS9KSwTM3FO2Ovv83W98GTg

Enlace al tutorial paso a paso:
https://youtu.be/NWS-_VsMab4
*/
class Canvas{
	constructor(id, context) {
		this.canvas = document.getElementById(id);
		this.ctx = canvas.getContext(context);
	}
	
	getHeight() {
		return this.canvas.height;
	}
	
	getWidth() {
		return this.canvas.width;
	}

	resetCanvas() {
		canvas.width = canvas.width;
		canvas.height = canvas.height;
	}
}

class PathFinder {
	constructor(rows, columns) {
		this.colorMap = {
			"wall": "#000000",
			"ground": "#777777",
			"neighbour":"#00E02D",
			"visited":"#E01634",
			"path":"#00BFE0"
		}
		this.rows = rows;
		this.columns = columns;
		this.matrix;
		this.openSet = [];
		this.closedSet = [];
		this.path = [];
		this.itsDone = false;
		this.start;
	}

	setRoute() {
		this.start = this.matrix[0][0];
		this.goal = this.matrix[this.columns-1][this.rows-1];
	}

	fillMatrix() {
		var i;
		this.matrix = new Array(this.rows);
		for(i = 0; i < this.rows; i++) {
			this.matrix[i] = new Array(this.columns);
		}
	}

	addBoxes(height, width) {
		var i;
		var j;
		// Adding boxes to the matrix
		for(i = 0; i < this.rows; i++) {
			for(j = 0; j < this.columns; j++) {
				this.matrix[i][j] = new Box(j, i, height, width)
			}
		}
		// Adding all the neighbors to the boexes on the Array
		for(i = 0; i < this.rows; i++) {
			for(j = 0; j < this.columns; j++) {
				this.matrix[i][j].addNeighbors(this.rows, this.columns, this.matrix);
			}
		}
	}

	colorBoard(canvas){
		for(var i = 0; i < this.rows; i++) {
			for(var j = 0; j < this.columns; j++) {
				var current = this.matrix[i][j];
			  	current.type ? current.colorBox(canvas, this.colorMap["wall"]) : current.colorBox(canvas, this.colorMap["ground"])
			}
		}
		// Color the neighours.
		for(i = 0; i < this.openSet.length; i++) {
			this.openSet[i].colorBox(canvas, this.colorMap["neighbour"]);
		}
		// Color the visited boxes.
		for(i = 0; i < this.closedSet.length; i++) {
			this.closedSet[i].colorBox(canvas, this.colorMap["visited"]);
		}
		// Color the best path.
		for(i = 0; i < this.path.length; i++){
			this.path[i].colorBox(canvas, this.colorMap["path"]);
		}
  	}
	
	deleteFromArray(array, element) {
		for(var i = array.length-1; i >= 0; i--) {
			if(array[i] == element) {
				array.splice(i,1);
			}
		}
	}

	heuristic(currentPosition, finalPosition) {
		var x = Math.abs(currentPosition.x - finalPosition.x);
		var y = Math.abs(currentPosition.y - finalPosition.y);
		var distance = x + y;
		return distance;
  	}

	AStar() {
		if(!this.itsDone) {
			// If openSet has elements.
			if(this.openSet.length > 0) {
				var winnerIndex = 0;
				var currentWinner = this.openSet[winnerIndex]
	
				// Searching a lower cost in neighbors
				for(var i = 0; i < this.openSet.length; i++) {
					var currentBox = this.openSet[i];
					winnerIndex = currentBox.totalCost < currentWinner.totalCost ? i : winnerIndex;
				}
				var currentBox = currentWinner;
	
				// Once we reach the goal, we get the path traveled.
				if(currentBox === this.goal) {
					var root = currentBox;
					this.path.push(root);
	
					while(root.father!=null) {
						root = root.father;
						this.path.push(root);
					}
					console.log('path encontrado:', this.path.reverse());
					this.itsDone = true;
				}

				else {
					this.deleteFromArray(this.openSet, currentBox);
					this.closedSet.push(currentBox);
					var neighbors = currentBox.neighbors;

					for(i = 0; i < neighbors.length; i++) {
						var current = neighbors[i];
						if(!this.closedSet.includes(current) && current.type!=1) {
							var currentSteps = currentBox.takenSteps + 1;
	
							// If current in openSet
							if(this.openSet.includes(current)) {
								current.takenSteps = currentSteps < current.takenSteps ? currentSteps : current.takenSteps;
							}
							else {
								current.takenSteps = currentSteps;
								this.openSet.push(current);
							}
							// Update costs
							current.heuristic = this.heuristic(current, this.goal);
							current.totalCost = current.takenSteps + current.heuristic;
	
							// Save the father (shortest path)
							current.father = currentBox;
						}
					}
				}
			}
			else {
				console.log('No possible path.');
				this.itsDone = true;
			}
		}
	}
}
class Box {
	constructor(x, y, height, width) {
		this.x = x;
		this.y = y;
		this.tileHeight = height;
		this.tileWidth = width;

		/* f(x) : total cost = g(x) + h(x)
		* 	    --> g(x) : taken steps
		* 	    --> h(x) : heuristic. (Remaining distance) */
		this.totalCost = 0;
		this.takenSteps = 0; 
		this.heuristic = 0;

		// Random integer selected in range 0-4. --> if (integer == 1) ? ground : wall.
		this.type = Math.floor(Math.random() * 5) == 1 ? 1 : 0;

		this.neighbors = [];
		this.father = null;
	}
	addNeighbors = function (rows, columns, matrix) {
		// On left
		if (this.x > 0) {
			this.neighbors.push(matrix[this.y][this.x - 1]);
		}
		// On right
		if (this.x < rows - 1) {
			this.neighbors.push(matrix[this.y][this.x + 1]);
		}
		// On above
		if (this.y > 0) {
			this.neighbors.push(matrix[this.y - 1][this.x]);
		}
		// On bellow
		if (this.y < columns - 1) {
			this.neighbors.push(matrix[this.y + 1][this.x]);
		}
	}
	colorBox = function (canvas, key) {
		canvas.ctx.fillStyle = key;
		canvas.ctx.fillRect(this.x * tileWidth, this.y * tileHeight, tileWidth, tileHeight);
	}
}

function init() {
	const rows = 25;
	const columns = 25;

	var FPS = 60;
	var canvas = new Canvas('canvas', '2d', rows, columns );
	tileHeight = parseInt(canvas.getHeight()/rows);
	tileWidth = parseInt(canvas.getWidth()/columns);

	var board = new PathFinder(rows, columns);
	board.fillMatrix();
	board.addBoxes(tileHeight, tileWidth);
	board.setRoute();

	board.openSet.push(board.start);
  	// Starting the loop on the main function
  	setInterval(function(){main(canvas, board);}, 1000/FPS);
}

function main(canvas, board) {
	canvas.resetCanvas();
	board.AStar();
	board.colorBoard(canvas);
}