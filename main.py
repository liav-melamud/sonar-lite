"""

Global variables

"""
# Start/Stop with button A

def on_button_pressed_a():
    global isRunning, gameStartTime, globalTimer, isSearching, searchTime
    if not (isRunning):
        # Start
        isRunning = True
        gameStartTime = input.running_time()
        globalTimer = 0
        isSearching = False
        searchTime = 0
        basic.show_icon(IconNames.HEART)
    else:
        # Stop
        isRunning = False
        cuteBot.motors(0, 0)
        basic.show_icon(IconNames.SQUARE)
input.on_button_pressed(Button.A, on_button_pressed_a)

# Display light level with button B

def on_button_pressed_b():
    global lightLevel
    if isRunning:
        lightLevel = input.light_level()
        basic.show_number(lightLevel)
        basic.pause(1000)
        basic.show_icon(IconNames.HEART)
input.on_button_pressed(Button.B, on_button_pressed_b)

rightLight = 0
leftLight = 0
frontLight = 0
distance = 0
lightLevel = 0
searchTime = 0
isSearching = False
globalTimer = 0
gameStartTime = 0
isRunning = False
lightThreshold = 100
obstacleThreshold = 15
# Initialize
basic.show_icon(IconNames.HEART)
# Timer update

def on_forever():
    global globalTimer
    if isRunning:
        globalTimer = Math.floor((input.running_time() - gameStartTime) / 1000)
basic.forever(on_forever)

# Main control loop

def on_forever2():
    global distance, lightLevel, isSearching, frontLight, leftLight, rightLight, isRunning, searchTime
    if isRunning:
        # Check for obstacles first
        distance = cuteBot.ultrasonic(cuteBot.SonarUnit.CENTIMETERS)
        if distance > 0 and distance <= obstacleThreshold:
            # Obstacle detected - avoid
            basic.show_icon(IconNames.NO)
            cuteBot.motors(-30, -30)
            basic.pause(500)
            cuteBot.motors(-40, 40)
            basic.pause(700)
            basic.show_icon(IconNames.HEART)
        else:
            # Check light levels
            lightLevel = input.light_level()
            if lightLevel > lightThreshold:
                # Light detected
                isSearching = False
                # Sample light from different angles
                frontLight = lightLevel
                # Turn slightly left
                cuteBot.motors(-20, 20)
                basic.pause(200)
                leftLight = input.light_level()
                # Turn slightly right
                cuteBot.motors(20, -20)
                basic.pause(400)
                rightLight = input.light_level()
                # Return to center
                cuteBot.motors(-20, 20)
                basic.pause(200)
                # Move toward brightest direction
                if frontLight > leftLight and frontLight > rightLight:
                    cuteBot.motors(40, 40)
                elif leftLight > rightLight:
                    cuteBot.motors(10, 40)
                else:
                    cuteBot.motors(40, 10)
                # Check for success condition
                if globalTimer >= 20:
                    isRunning = False
                    cuteBot.motors(0, 0)
                    basic.show_icon(IconNames.HAPPY)
                    music.play_tone(392, music.beat(BeatFraction.QUARTER))
                    music.play_tone(523, music.beat(BeatFraction.WHOLE))
                    basic.pause(2000)
            else:
                # No light detected - search
                if not (isSearching):
                    isSearching = True
                    searchTime = 0
                searchTime += 1
                cuteBot.motors(30, -30)
                if searchTime >= 150:
                    isRunning = False
                    cuteBot.motors(0, 0)
                    basic.show_icon(IconNames.CONFUSED)
                    music.start_melody(music.built_in_melody(Melodies.WAWAWAWAA),
                        MelodyOptions.ONCE)
                    basic.pause(2000)
    else:
        cuteBot.motors(0, 0)
basic.forever(on_forever2)
