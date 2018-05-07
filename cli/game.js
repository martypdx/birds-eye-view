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
        this.api.getUserPosition(userId)
            .then(({ _id })=> {
                this.assessSquare(userId, _id);
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
        this.api.getUserPosition(userId)
            .then(body => {

                let { x, y } = body.coords;
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

                return this.api.updateUserIfSquareExists(userId, x, y, body._id);
            })
            .then(body => {
                if(body.currentSquare) {
                    this.assessSquare(userId, body.currentSquare);
                } else {
                    lineBreak();                                        
                    console.log('That direction is outside your territory. Try another.'.blue);
                    this.showOptions(userId);
                }
            });
    }
    assessSquare(userId, currentSquare) {
        return Promise.all([
            this.api.getSquareInfo(currentSquare),
            this.api.getVisitedSquare(userId, currentSquare)
        ])
            .then(([squareInfo, visitCheck]) => {
                const { visited } = visitCheck;
                if(squareInfo.endpointHere) {
                    this.resolveEndpoint(userId, squareInfo, visited);
                } else if(squareInfo.itemHere) {
                    this.resolveItem(userId, squareInfo, visited);
                } else {
                    lineBreak();
                    !visited ? console.log(`${squareInfo.squareDesc.cyan}`) : console.log(`${squareInfo.visitedDesc.magenta}`);
                    this.showOptions(userId);
                }
            });
    }
    checkInventory(userId, squareInfo, itemToMatch) {
        return this.api.getInventory(userId, itemToMatch)
            .then(body => body);
    }
    resolveEndpoint(userId, squareInfo, visited) {
        this.checkInventory(userId, squareInfo, squareInfo.endpointHere.requiredItem._id)
            .then(item => {
                if(item.itemName) {
                    this.api.deleteInventory(userId, item._id)
                        .then(() => {
                            if(squareInfo.itemHere) {
                                this.resolveItem(userId, squareInfo, visited, `${squareInfo.endpointHere.endpointStory.resolved}`);
                            } else {
                                lineBreak();     
                                !visited ?
                                    console.log(`${squareInfo.squareDesc} ${squareInfo.endpointHere.endpointStory.resolved}`.magenta)
                                    : console.log(`${squareInfo.visitedDesc}\n${squareInfo.endpointHere.endpointStory.resolved}`.magenta);
                                this.endLevel(userId);
                            }
                        });
                } else {
                    lineBreak();     
                    !visited ?
                        console.log(`${squareInfo.squareDesc} ${squareInfo.endpointHere.endpointStory.unresolved}`.cyan)
                        : console.log(`${squareInfo.visitedDesc.magenta}\n${squareInfo.endpointHere.endpointStory.unresolved.cyan}`);
                    this.showOptions(userId);                
                }
            });
    }
    resolveItem(userId, squareInfo, visited, resolvedInfo = '') {
        this.checkInventory(userId, squareInfo, squareInfo.itemHere._id)
            .then(({ itemName }) => {
                if(itemName) {
                    lineBreak();                    
                    console.log(`${squareInfo.visitedDesc} This is where you found your ${itemName}.`.magenta);
                    this.showOptions(userId);
                } else {
                    this.api.addItem(userId, squareInfo.itemHere._id)
                        .then(() => {
                            lineBreak();
                            const space = resolvedInfo ? '\n\n' : '';
                            !visited ?
                                console.log(`${squareInfo.squareDesc.cyan}${space}${resolvedInfo.magenta}`)
                                : console.log(`${squareInfo.visitedDesc}\n${squareInfo.endpointHere.endpointStory.resolved}`.magenta);
                            lineBreak();                
                            console.log(`${squareInfo.itemHere.itemStory}`.magenta);
                            this.showOptions(userId);                
                        });
                }
            });
    }  
    endLevel(userId) {
        return Promise.all([
            this.api.clearInventory(userId),
            this.api.clearVisited(userId)
        ])
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
                            if(newGame) this.api.createNewGame(userId)
                                .then(() => this.initLevel(userId));
                        });
                }
            });
    }
}

module.exports = Game;