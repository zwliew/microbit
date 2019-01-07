// Tune these
const params = {
    fps: 5
}

const actions = {
    initialize: function (): State {
        return {
            puckPos: new Vector({
                x: 2, y: 0
            }),
            platformPos: new Vector({
                x: 2, y: 4
            }),
            puckVel: new Vector({
                x: Math.floor(Math.random() * 3 - 1),
                y: 1
            }),
            platformVel: new Vector({
                x: 0, y: 0
            }),
            running: true,
            moved: false
        }
    },
    moveLeft: function (state: State): State {
        if (state.moved) {
            return state
        }

        return {
            puckPos: state.puckPos,
            platformPos: state.platformPos,
            puckVel: state.puckVel,
            running: state.running,
            platformVel: state.platformVel.add(new Vector({
                x: -1, y: 0
            })),
            moved: true
        }
    },
    moveRight: function (state: State): State {
        if (state.moved) {
            return state
        }

        return {
            puckPos: state.puckPos,
            platformPos: state.platformPos,
            puckVel: state.puckVel,
            running: state.running,
            platformVel: state.platformVel.add(new Vector({
                x: 1, y: 0
            })),
            moved: true
        }
    },
    tick: function (state: State): State {
        if (!state.running) {
            return state
        }

        let platformPos = state.platformPos
        let platformVel = state.platformVel
        let puckPos = state.puckPos
        let puckVel = state.puckVel
        let running = state.running
        let moved = state.moved

        platformPos = state.platformPos.add(state.platformVel)
        if (platformPos.x > 3 || platformPos.x < 1) {
            platformPos = state.platformPos
        }

        platformVel = new Vector({
            x: 0,
            y: 0
        })

        puckPos = puckPos.add(puckVel)
        if (puckPos.x < 0) {
            puckPos = puckPos.add(new Vector({
                x: 2,
                y: 0
            }))
            puckVel = new Vector({
                x: 1,
                y: puckVel.y
            })
        } else if (puckPos.x > 4) {
            puckPos = puckPos.add(new Vector({
                x: -2,
                y: 0
            }))
            puckVel = new Vector({
                x: -1,
                y: puckVel.y
            })
        }

        if (puckPos.y < 0) {
            puckPos = puckPos.add(new Vector({
                x: 0,
                y: 2
            }))
            puckVel = new Vector({
                x: puckVel.x,
                y: 1
            })
        } else if (puckPos.y == platformPos.y) {
            if (puckPos.x >= platformPos.x - 1
                && puckPos.x <= platformPos.x + 1) {
                puckVel = new Vector({
                    x: Math.floor(Math.random() * 3 - 1),
                    y: -1
                })
                puckPos = new Vector({
                    x: state.puckPos.x + puckVel.x,
                    y: platformPos.y - 2
                })
            }
        } else if (puckPos.y > platformPos.y) {
            running = false
        }

        moved = false

        return {
            puckPos: puckPos,
            platformPos: platformPos,
            puckVel: puckVel,
            platformVel: platformVel,
            running: running,
            moved: moved
        }
    }
}
let s: State = actions.initialize()

basic.forever(function () {
    s = actions.tick(s)

    if (!s.running) {
        basic.showIcon(IconNames.Sad)
        return
    }

    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            led.unplot(x, y)
        }
    }

    led.plot(s.platformPos.x, s.platformPos.y)
    led.plot(s.platformPos.x - 1, s.platformPos.y)
    led.plot(s.platformPos.x + 1, s.platformPos.y)

    led.plot(s.puckPos.x, s.puckPos.y)

    basic.pause(Math.floor(1000 / params.fps))
})

input.onButtonPressed(Button.A, function () {
    s = actions.moveLeft(s)
})

input.onButtonPressed(Button.B, function () {
    s = actions.moveRight(s)
})

interface State {
    puckPos: Vector
    platformPos: Vector
    puckVel: Vector
    platformVel: Vector
    running: boolean
    moved: boolean
}

interface Position {
    x: number
    y: number
}

class Vector {
    x: number
    y: number

    constructor(pos: Position) {
        this.x = pos.x
        this.y = pos.y
    }

    add(v: Vector): Vector {
        return new Vector({
            x: this.x + v.x,
            y: this.y + v.y
        })
    }
}
