#!/bin/bash
# Simple build script for LittleJS 
# Bash script (.sh) by Alexandre Moreira, based on original Batch 
# (.bat) by Frank Force
# Minfies and combines index.html and index.js and zips the result
# Run engine/buildSetup.sh first to install dependencies

NAME="game"
BUILD_FOLDER="build"
BUILD_FILENAME="index.js"
#BUILD_MODE="release"
#BUILD_MODE="debug"
BUILD_MODE="$1"

export PATH=/home/alexandre/.yarn/bin:$PATH

# rebuild engine first
#cd engine
#./engineBuild.sh
#if [ $? -ne 0 ]; then
#    read -p "Unexpected error. Press any key to terminate..."
#    exit $?
#fi
#cd ..

# remove old files
rm -f ${NAME}.zip
rm -rf ${BUILD_FOLDER}

# generate optimized maps
cd scripts
node optimize_maps.js
cd -

# copy engine release build
mkdir ${BUILD_FOLDER}
cd ${BUILD_FOLDER}
#cat ../engine/engine.all.release.js >> ${BUILD_FILENAME}
if [ $BUILD_MODE == "release" ]; then
    cat ../engine/littlejs.release.js >> ${BUILD_FILENAME}
else
    cat ../engine/littlejs.js >> ${BUILD_FILENAME}
fi
echo "" >>${BUILD_FILENAME}

# add your game's files to include here
cat ../maps/maps_optimized.js >> ${BUILD_FILENAME}
cat ../src/gameScreen.js >> ${BUILD_FILENAME}
cat ../src/gameObjects.js >> ${BUILD_FILENAME}
cat ../src/gamePlayer.js >> ${BUILD_FILENAME}
cat ../src/enemies.js >> ${BUILD_FILENAME}
cat ../src/fluid.js >> ${BUILD_FILENAME}
cat ../src/mainGameScreen.js >> ${BUILD_FILENAME}
cat ../src/game.js >> ${BUILD_FILENAME}
cat ../src/gameInput.js >> ${BUILD_FILENAME}
cat ../src/gameLevels.js >> ${BUILD_FILENAME}
cat ../src/gameOverScreen.js >> ${BUILD_FILENAME}
cat ../src/pauseScreen.js >> ${BUILD_FILENAME}
cat ../src/titleScreen.js >> ${BUILD_FILENAME}
cat ../src/utils.js >> ${BUILD_FILENAME}

# optimize images
optipng ../images/*.png

# copy images to build folder
cp -R ../images  .

if [ $BUILD_MODE == "release" ]; then
    # minify code with closure
    mv ${BUILD_FILENAME} ${BUILD_FILENAME}.temp
    google-closure-compiler --js ${BUILD_FILENAME}.temp --js_output_file ${BUILD_FILENAME} --compilation_level ADVANCED --language_out ECMASCRIPT_2019 --warning_level VERBOSE --jscomp_off "*" --assume_function_wrapper
    if [ $? -ne 0 ]; then
        read -p "Unexpected error. Press any key to terminate..."
        exit $?
    fi
    rm -f ${BUILD_FILENAME}.temp

    # more minification with uglify or terser (they both do about the same)
    uglifyjs -o ${BUILD_FILENAME} --compress --mangle -- ${BUILD_FILENAME}
    # call terser -o ${BUILD_FILENAME} --compress --mangle -- ${BUILD_FILENAME}
    if [ $? -ne 0 ]; then
        read -p "Unexpected error. Press any key to terminate..."
        exit $?
    fi

    # roadroaller compresses the code better then zip
    cp ${BUILD_FILENAME} roadroller_${BUILD_FILENAME}
    roadroller roadroller_${BUILD_FILENAME} -o roadroller_${BUILD_FILENAME}
    if [ $? -ne 0 ]; then
        read -p "Unexpected error. Press any key to terminate..."
        exit $?
    fi
fi


# build the html, you can add html header and footers here
rm -f index.html
cat ../src/header.html > index.html
echo "<body><meta charset=utf-8><script>" >> index.html
if [ $BUILD_MODE == "release" ]; then
    cat roadroller_${BUILD_FILENAME} >> index.html
else
    cat ${BUILD_FILENAME} >> index.html
fi
echo "</script>" >> index.html

# zip the result, ect is recommended
../node_modules/ect-bin/vendor/linux/ect -9 -strip -zip ../${NAME}.zip index.html images/*.png
if [ $? -ne 0 ]; then
    read -p "Unexpected error. Press any key to terminate..."
    exit $?
fi

cd ..

# pause to see result
