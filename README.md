# Bird's Eye View

This is a text-based adventure game played entirely through the CLI. Experience a day in the life of a creative city crow whose only wish is to find a decent meal.

// initial commit

## Requirements

MongoDB, Node.js, and your favorite CLI

## Installing

1. Clone down the repository and change the directory.

    ```
    git clone https://github.com/team-lollipop/birds-eye-view.git
    ```
2. Install the dependencies from package.json.

    ```
    npm i
    ```
3. Type run command into the CLI to start the game!

    ```
    node cli
    ```

## Built With

* [Inquirer](https://www.npmjs.com/package/inquirer) - Package used to create a client side interface for the CLI
* [bcryptjs](https://github.com/dcodeIO/bcrypt.js/blob/master/README.md) - Used for security
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Used to generate authentification tokens
* [Mocha](https://mochajs.org/#installation) - Used for development testing
* [Chai](http://www.chaijs.com/) - Used for development testing
* [mongoose](http://mongoosejs.com/docs/api.html) - Model validation

## Authors

* [Henry](https://github.com/hnrzzle),
* [Keli](https://github.com/kelihansen),
* [Tasha](https://github.com/Tashazun)

with inspiration from [Space Explorers](https://github.com/ZacIsLate/SpaceExplorers)

## Coding Standards

* Obey the linter.
* ES6 is our friend (e.g. choose `const` and `let` over `var`).
* Keep mocha tests grammatical (i.e. `it('has a working route')...` over `it('route works')...`).

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
