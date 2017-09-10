#!/bin/bash

BASE_URL="https://celestrak.com/NORAD/elements/"

OUTPUT_DIR="src/js/tles/"

declare -a files=("tle-new"
  "stations"
  "visual"
  "weather"
  "noaa"
  "goes"
  "resource"
  "sarsat"
  "dmc"
  "tdrss"
  "argos"
  "geo"
  "intelsat"
  "ses"
  "iridium"
  "iridium-NEXT"
  "orbcomm"
  "globalstar"
  "amateur"
  "x-comm"
  "other-comm"
  "gorizont"
  "raduga"
  "molniya"
  "gps-ops"
  "glo-ops"
  "galileo"
  "beidou"
  "sbas"
  "nnss"
  "musson"
  "science"
  "geodetic"
  "engineering"
  "eduation"
  "military"
  "radar"
  "cubesat"
  "other"
)

for i in "${files[@]}"
do
   curl "${BASE_URL}${i}.txt" > "${OUTPUT_DIR}${i}.txt"
   # Sleep for a bit - don't hit the server too hard
   sleep .5
done