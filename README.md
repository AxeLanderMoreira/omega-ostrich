# Omega Ostrich

Platformer demo inspired by Atari 2600 H.E.R.O. (powered by LittleJS game engine, and initially made for LittleJS Game Jam 2024).

## 1. Game Backstory

Some time ago, an ordinary ostrich swallowed an ancient and powerful medallion, thus becoming the might super hero **Omega Ostrich**.

Her most important mission begins now: To rescue a troop of baby spider-monkeys, that have been captured by evil hunters. At all costs, she must now prevent an already endangered species from becoming extinct.

Her powers include:

 * Super intelligence

 * Flight capability

 * Shoot Powerful optic laser beams

 * Lay explosive eggs

## 2. How to Play

Gameplay is heavily inspired by Atari 2600's H.E.R.O, and uses a classic single-button control scheme.

* Jump / fly: Tap UP direction or Button 2 (X on keyboard) to jump. Then, tap and hold to fly. Release and tap again to control the height. Use LEFT and RIGHT direction to maneuver.

* Shoot Laser beam: Hold FIRE button to shoot a short laser beam continuosly (SPACE or Z on keyboard, Button 1 on gamepad).

* Lay Explosive egg: Tap the opposite direction to turn away, and hold DOWN to crouch. While crouched, tap FIRE button, then run in the oppotie direction (otherwise you will be caught in the blast and lose a life).

* Breakable walls are shown white color, and will usually block your progress. Use an explosive egg to blow them up. Alternatively, a laser beam may also be used, but it takes a longer time to destroy the walls.

* Magma walls have a glowing red color and must be avoided. They will damage you if touched.

## 3. Known bugs

* Pause function not working in physical gamepad (game will pause and unpause instantly).

## 4. TO-DO List

* Create modern control scheme with separate buttons for the three actions: fly, laser and bomb.

* Have it installable as PWA (Progressive Web App), and switch to full screen automatically.

* Refine transition between levels.

* Add tutorial elements.

* Add particle effects.

* More levels, enemies etc.

## 5. Building

### 5.1. OS Support

Attention: Instructions are provided for Linux only, as it is the OS I personally use. 

Building on Windows or MacOS will require adaptation on the build script and/or manual steps.

### 5.2. Preconditions

After cloning this repository, follow the steps below:

* node must be installed
* run `npm install`
* run `chmod +x node_modules/ect-bin/vendor/linux/ect`
* run `sudo apt install optipng`

### 5.3. Building steps

For a debug (development) version, run:

`./build.sh debug`

It will generate a large HTML file, but it's easier to debug in case of error.

For release (production) version, run:

`./build.sh release`

It will generate an HTML file as small as possible, targetting [JS13K](https://js13kgames.com/).

Artifacts generated are the `game.zip` package at the project's root folder, and the `build` directory, containing HTML and deployed assets.

You can run the HTML locally ot host in an HTTP server.
