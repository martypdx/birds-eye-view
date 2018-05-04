/* eslint no-console:off */
const inquirer = require('inquirer');
const colors = require('colors'); // eslint-disable-line
const gameLevels = 2;

const lineBreak = () => console.log('\n');

const signupQuestions = [
    {
        type: 'list',
        name: 'auth',
        message: 'Are you a new or returning user?\n\n',
        choices: [{ name:'This is my first time, sign me up!', value: 'signUp' }, { name: 'I\'ve been here before, sign me in!', value: 'signIn' }]
    },
    {
        type: 'input',
        name: 'name',
        message: 'Please enter your username'
    },
    {
        type: 'password',
        name: 'password',
        message: 'Please enter your password'
    }
];

class Game {
    constructor(api) {
        this.api = api;
    }
    start() {
        inquirer.prompt(signupQuestions)
            .then(({ auth, name, password }) => this.api[auth]({ name, password }))
            .then(({ token, name, userId }) => {
                this.user = name;
                this.initSquare(userId);
            })
            .catch(err => {
                lineBreak();
                console.log(JSON.parse(err.response.text).error.yellow, 'Please try again!'.bold.cyan);
                this.start();
            });
    }
    initSquare(userId) {
        this.api.getInitialDesc(userId)
            .then(square=> {
                lineBreak();                
                console.log(square.intro.replace('(User Name)', this.user).blue);
                this.showOptions(userId);
            });
    }
    showOptions(userId) {
        lineBreak();        
        inquirer.prompt({
            type: 'list',
            name: 'direction',
            message: 'Which direction would you like to fly?',
            choices: [{ name:'North', value: 'n' },
                { name: 'South', value: 's' },
                { name: 'East', value: 'e' },
                { name: 'West', value: 'w' }]
        })
            .then(({ direction }) => {
                this.resolveDirection(userId, direction);
            });
    }

    resolveDirection(userId, direction) {
        this.api.getUserCoords(userId)
            .then(body => {

                let { x, y } = body;
                switch(direction) {
                    case 'n':
                        y++;
                        break;
                    case 's':
                        y--;
                        break;
                    case 'e':
                        x++;
                        break;
                    case 'w':
                        x--;    
                }

                return this.api.updateUserIfSquareExists(userId, x, y);
            })
            .then(body => {
                if(body) {
                    this.api.assessSquare(userId, body.currentLevel, body.currentSquare);
                } else {
                    console.log('sorry');
                    this.showOptions(userId);
                }
            });
    }
    assessSquare(userId, currentLevel, currentSquare) {
        this.api.getSquareInfo(currentLevel, currentSquare)
            .then(body => {
                if(!itemId && !endpointId) {
                    rollForHazard(userId); // write method
                } else if(itemId && endpointId) {
                    this.resolveSpecial(userId);  // write method
                } else if(endpointId) {
                    this.resolveEndpoint(userId);  // write method
                } else if(itemId) {
                    this.resolveItem(userId);  // write method
                } 
            });
    }




    // resolveAction(userId, direction) {       
    //     this.api.getOption(userId, direction)
    //         .then(body => {
    //             switch(body.action) {
    //                 case 'look':
    //                     lineBreak();
    //                     console.log(`${body.info} You fly back.`.cyan);
    //                     this.showOptions(userId);
    //                     break;
    //                 case 'interact':
    //                     this.addToInventory(userId, body.info);
    //                     break;
    //                 case 'resolve':
    //                     this.completeTask(userId, body.info);
    //             }
    //         });   
    // }
    addToInventory(userId, itemInfo) {
        this.api.getInventory(userId)
            .then(body => {
                if(body.inventory[0] === itemInfo.itemName) {
                    lineBreak();                    
                    console.log(`This is where you found your ${body.inventory[0]}. You fly back.`.magenta);
                    this.showOptions(userId);
                } else {
                    lineBreak();
                    console.log(itemInfo.itemDesc.cyan);
                    this.api.addItem(userId, itemInfo.itemName)
                        .then(body => {
                            lineBreak();                
                            console.log(`You fly back with a ${body.inventory[0]}.`.magenta);
                            this.showOptions(userId);                
                        });
                }
            });
    }
    completeTask(userId, endpointInfo) {
        this.api.getInventory(userId)
            .then(body => {
                if(body.inventory[0] === endpointInfo.requiredItem) {
                    lineBreak();                                        
                    console.log(`${endpointInfo.desc} ${endpointInfo.resolved}`.cyan);
                    this.endLevel(userId);
                } else {
                    lineBreak();                    
                    console.log(`${endpointInfo.desc} ${endpointInfo.unresolved} You fly back.`.cyan);
                    this.showOptions(userId);                
                }
            });
    }
    endLevel(userId) {
        this.api.deleteInventory(userId)
            .then(({ inventory }) => {
                if(inventory.length === 0) {
                    return this.api.getLevel(userId);
                }
            })
            .then(({ level }) => {
                if(level === gameLevels) {
                    lineBreak();                                    
                    inquirer.prompt({
                        type: 'list',
                        name: 'newGame',
                        message: 'The End. Would you like to play again?',
                        choices: [{ name:'Yes!', value: 'yes' }]
                    })
                        .then(({ newGame }) => {
                            if(newGame) this.newLevel(userId, 1);
                        });
                } else {
                    this.newLevel(userId, level + 1);
                }
            });
    }
    newLevel(userId, newLevel) {
        this.api.updateLevel(userId, newLevel)
            .then(() => {
                this.presentTask(userId);
            });
    }
}

module.exports = Game;