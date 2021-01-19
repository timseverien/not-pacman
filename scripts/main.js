import Game from './Game.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const game = new Game(context, 1024);

game.start();