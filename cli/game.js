/* eslint no-console:off */
const inquirer = require('inquirer');
const colors = require('colors'); // eslint-disable-line

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
            .then(({ name, userId }) => {
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
                if(body.currentSquare) {
                    this.assessSquare(userId, body.currentLevel, body.currentSquare);
                } else {
                    console.log('Sorry, can\'t go that way.');
                    this.showOptions(userId);
                }
            });
    }
    assessSquare(userId, currentSquare) {
        this.api.getSquareInfo(currentSquare)
            .then(body => {
                if(body.endpointHere) {
                    this.resolveEndpoint(userId, body);
                } else if(body.itemHere) {
                    this.resolveItem(userId, body);
                } 
            });
    }
    resolveItem(userId, squareInfo) {
        this.api.getInventory(userId)
            .then(body => {
                const itemFilter = body.inventory.filter(obj => obj._id === squareInfo.itemHere._id);
                if(itemFilter.length) {
                    lineBreak();                    
                    console.log(`${squareInfo.squareDesc} This is where you found your ${body.inventory[0]}.`.magenta);
                    this.showOptions(userId);
                } else {
                    lineBreak();
                    console.log(`${squareInfo.squareDesc} ${squareInfo.itemHere.itemStory}`.cyan);
                    this.api.addItem(userId, squareInfo.itemHere._id)
                        .then(() => {
                            lineBreak();                
                            console.log(`You fly back with a ${squareInfo.itemHere.itemName}.`.magenta);
                            this.showOptions(userId);                
                        });
                }
            });
    }  
    resolveEndpoint(userId, squareInfo) {
        this.api.getInventory(userId)
            .then(body => {
                const itemFilter = body.inventory.filter(obj => obj._id === squareInfo.endpointHere.requiredItem._id);
                if(itemFilter[0] === squareInfo.endpointHere.requiredItem) {
                    lineBreak();                                        
                    console.log(`${squareInfo.squareDesc} ${squareInfo.endpointHere.endpointStory.resolved}`.cyan);
                    if(squareInfo.itemHere) {
                        this.resolveItem(userId, squareInfo);
                    } else this.endLevel(userId);
                } else {
                    lineBreak();                    
                    console.log(`${squareInfo.squareDesc} ${squareInfo.endpointHere.endpointStory.unresolved} You fly back.`.cyan);
                    this.showOptions(userId);                
                }
            });
    }
    endLevel(userId) {
        this.api.clearInventory(userId)
            .then(({ cleared }) => {
                if(cleared) {
                    return this.api.getUserLevel()
                        .then(({ userLevel }) => {
                            const newLevel = userLevel + 1;
                            return this.api.updateUserIfLevelExists(userId, newLevel);
                        });
                }
            })
            .then(body => {
                if(!body.currentLevel) {
                    lineBreak();                                    
                    inquirer.prompt({
                        type: 'list',
                        name: 'newGame',
                        message: 'The End. Would you like to play again?',
                        choices: [{ name:'Yes!', value: 'yes' }]
                    })
                        .then(({ newGame }) => {
                            if(newGame) this.api.updateUserIfLevelExists(userId, 1);
                        });
                }
            });
    }
}

module.exports = Game;