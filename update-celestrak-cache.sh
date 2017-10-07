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
  "education"
  "military"
  "radar"
  "cubesat"
  "other"
)

# Fetch each file.
declare -i i=1
for filename in "${files[@]}"
do
  echo "Progress: ${i}/${#files[@]}: ${filename}"
  curl "${BASE_URL}${filename}.txt" > "${OUTPUT_DIR}${filename}.txt"
  # Sleep for a bit to be nice to the Celestrak servers.
  sleep .5
  let i++
done

# Combine all TLEs.
cd "${OUTPUT_DIR}"
rm _all-tles.txt || true
rm _iss.txt || true
cat * >> _all-tles.txt

# Extract ISS info to bundle with initial JS payload.
head -3 stations.txt >> _iss.txt