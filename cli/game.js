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
            .then(({ auth, name, password }) => {
                if(auth === 'signUp') {
                    return this.api.signUp({ name, password })
                        .then(({ userId }) => {
                            this.initLevel(userId);
                        });
                } else if(auth === 'signIn') {
                    return this.api.signIn({ name, password })
                        .then(({ userId }) => {
                            this.locateUser(userId);
                        });
                }
            })
            .catch(err => {
                lineBreak();
                console.log(JSON.parse(err.response.text).error.yellow, 'Please try again!'.bold.cyan);
                this.start();
            });
    }
    initLevel(userId) {
        this.api.getLevelIntro(userId)
            .then(({ intro })=> {
                lineBreak();                
                console.log(intro.blue);
                this.showOptions(userId);
            });
    }
    locateUser(userId) {
        this.api.getUserSquare(userId)
            .then(({ currentSquare })=> {
                this.assessSquare(userId, currentSquare);
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
                    this.assessSquare(userId, body.currentSquare);
                } else {
                    console.log('But that direction is outside your territory. You should try another.'.cyan);
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
                } else {
                    console.log(`${body.squareDesc}`);
                    this.showOptions(userId);
                }
            });
    }
    compareInventory(userId, squareInfo, itemToMatch) {
        return this.api.getInventory(userId)
            .then(body => {
                const itemFilter = body.inventory.filter(obj => obj.item._id === itemToMatch);
                return itemFilter;
            });
    }
    resolveItem(userId, squareInfo) {
        this.compareInventory(userId, squareInfo, squareInfo.itemHere._id)
            .then(itemFilter => {
                if(itemFilter.length) {
                    lineBreak();                    
                    console.log(`${squareInfo.squareDesc} This is where you found your ${squareInfo.itemHere.itemName}.`.magenta);
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
        this.compareInventory(userId, squareInfo, squareInfo.endpointHere.requiredItem._id)
            .then(itemFilter => {
                if(itemFilter.length) {
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
            .then(() => {
                return this.api.getUserLevel(userId);
            })
            .then(({ level }) => {
                const newLevel = level + 1;
                return this.api.updateUserIfLevelExists(userId, newLevel);
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
                            if(newGame) this.api.updateUserIfLevelExists(userId, 1)
                                .then(() => this.showOptions(userId));
                        });
                }
            });
    }
}

module.exports = Game;