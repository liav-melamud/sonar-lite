// Global variables
let isRunning = false
let gameStartTime = 0
let globalTimer = 0
let lightLevel = 0
let lightThreshold = 50  // Adjust based on your environment
let obstacleThreshold = 15  // cm
let searchTime = 0
let isSearching = false

// Initialize
basic.showIcon(IconNames.Heart)

// Start/Stop with button A
input.onButtonPressed(Button.A, function () {
    if (!isRunning) {
        // Start
        isRunning = true
        gameStartTime = input.runningTime()
        globalTimer = 0
        isSearching = false
        searchTime = 0
        basic.showIcon(IconNames.Heart)
    } else {
        // Stop
        isRunning = false
        cuteBot.stopcar()
        basic.showIcon(IconNames.Square)
    }
})

// Display light level with button B
input.onButtonPressed(Button.B, function () {
    if (isRunning) {
        lightLevel = input.lightLevel()
        basic.showNumber(lightLevel)
        basic.pause(1000)
        basic.showIcon(IconNames.Heart)
    } else {
        // Display sonar distance when stopped
        let distance = cuteBot.ultrasonic(cuteBot.SonarUnit.Centimeters)
        basic.showNumber(distance)
        basic.pause(1000)
        basic.showIcon(IconNames.Square)
    }
})

// Main loop
basic.forever(function () {
    if (isRunning) {
        // Check for obstacles first
        let distance = cuteBot.ultrasonic(cuteBot.SonarUnit.Centimeters)

        if (distance > 0 && distance <= obstacleThreshold) {
            // Obstacle detected - avoid
            basic.showIcon(IconNames.No)
            cuteBot.motors(-30, -30)
            basic.pause(500)
            cuteBot.motors(-40, 40)
            basic.pause(700)
            basic.showIcon(IconNames.Heart)
        } else {
            // Check for light
            lightLevel = input.lightLevel()

            if (lightLevel > lightThreshold) {
                // Light detected
                isSearching = false

                // Sample light from different angles
                let frontLight = lightLevel

                // Turn slightly left
                cuteBot.motors(-20, 20)
                basic.pause(200)
                let leftLight = input.lightLevel()

                // Turn slightly right
                cuteBot.motors(20, -20)
                basic.pause(400)
                let rightLight = input.lightLevel()

                // Return to center
                cuteBot.motors(-20, 20)
                basic.pause(200)

                // Move toward brightest direction
                if (frontLight > leftLight && frontLight > rightLight) {
                    // Light is brightest straight ahead
                    cuteBot.motors(50, 50)
                } else if (leftLight > rightLight) {
                    // Light is brightest to the left
                    cuteBot.motors(20, 50)
                } else {
                    // Light is brightest to the right
                    cuteBot.motors(50, 20)
                }

                // Success condition
                if (globalTimer >= 20) {
                    isRunning = false
                    cuteBot.stopcar()
                    basic.showIcon(IconNames.Happy)
                    music.playTone(392, music.beat(BeatFraction.Quarter))
                    music.rest(music.beat(BeatFraction.Eighth))
                    music.playTone(523, music.beat(BeatFraction.Whole))
                    basic.pause(2000)
                    basic.showIcon(IconNames.Square)
                }
            } else {
                // No light detected - search
                if (!isSearching) {
                    isSearching = true
                    searchTime = 0
                }

                searchTime += 1
                cuteBot.motors(30, -30)  // Rotate to search for light

                // If complete rotation made without finding light
                if (searchTime >= 150) {
                    isRunning = false
                    cuteBot.stopcar()
                    basic.showIcon(IconNames.Confused)
                    music.startMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once)
                    basic.pause(2000)
                    basic.showIcon(IconNames.Square)
                }
            }
        }
    } else {
        cuteBot.stopcar()
    }
})

// Timer update
basic.forever(function () {
    if (isRunning) {
        globalTimer = Math.floor((input.runningTime() - gameStartTime) / 1000)
    }
})