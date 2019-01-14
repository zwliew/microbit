let progress = 0
let pattern: number[] = []
let listening = false
listening = false
game.setScore(1)
// Loop the game for 3 rounds
while (game.score() <= 3) {
    // Display the current round
    basic.showString("R" + game.score())
    basic.pause(500)

    // Generate a random pattern and display the image pattern
    pattern = [Math.randomRange(1, 5), Math.randomRange(1, 5), Math.randomRange(1, 5), Math.randomRange(1, 5), Math.randomRange(1, 5)]
    for (let value of pattern) {
        if (value == 1) {
            basic.showIcon(IconNames.Heart)
            basic.pause(100)
        } else if (value == 2) {
            basic.showIcon(IconNames.Duck)
            basic.pause(100)
        } else if (value == 3) {
            basic.showIcon(IconNames.Giraffe)
            basic.pause(100)
        } else if (value == 4) {
            basic.showIcon(IconNames.Ghost)
            basic.pause(100)
        } else if (value == 5) {
            basic.showIcon(IconNames.Scissors)
            basic.pause(100)
        }
        basic.clearScreen()
        basic.pause(100)
    }
    basic.pause(200)
    basic.clearScreen()
    basic.showString("Go!")

    // Listen for the user's inputs
    listening = true
    progress = 0
    while (listening) {
        if (tinkercademy.ADKeyboard(ADKeys.A, AnalogPin.P0)) {
            if (pattern[progress] == 1) {
                progress += 1
                basic.clearScreen()
                basic.pause(20)
                basic.showIcon(IconNames.Heart)
            } else {
                game.gameOver()
            }
        } else if (tinkercademy.ADKeyboard(ADKeys.B, AnalogPin.P0)) {
            if (pattern[progress] == 2) {
                progress += 1
                basic.clearScreen()
                basic.pause(20)
                basic.showIcon(IconNames.Duck)
            } else {
                game.gameOver()
            }
        } else if (tinkercademy.ADKeyboard(ADKeys.C, AnalogPin.P0)) {
            if (pattern[progress] == 3) {
                progress += 1
                basic.clearScreen()
                basic.pause(20)
                basic.showIcon(IconNames.Giraffe)
            } else {
                game.gameOver()
            }
        } else if (tinkercademy.ADKeyboard(ADKeys.D, AnalogPin.P0)) {
            if (pattern[progress] == 4) {
                basic.clearScreen()
                basic.pause(20)
                basic.showIcon(IconNames.Ghost)
            } else {
                game.setScore(0)
            }
        } else if (tinkercademy.ADKeyboard(ADKeys.E, AnalogPin.P0)) {
            if (pattern[progress] == 5) {
                basic.clearScreen()
                basic.pause(20)
                progress += 1
                basic.showIcon(IconNames.Scissors)
            } else {
                game.gameOver()
            }
        }

        // Has the user gotten the entire sequence correct?
        if (progress >= 5) {
            listening = false
            game.addScore(1)
        }
        basic.pause(50)
    }
}

// The user has beaten the game. Display the victory screen!
basic.showLeds(`
    # # # # #
    # # # # #
    . # # # .
    . . # . .
    . # # # .
    `)
basic.pause(200)
basic.clearScreen()
basic.pause(200)
basic.showLeds(`
    # # # # #
    # # # # #
    . # # # .
    . . # . .
    . # # # .
    `)
basic.pause(500)
basic.showString("Winner!")

