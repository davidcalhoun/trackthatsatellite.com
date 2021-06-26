#!/bin/bash

DATE=`date +%Y-%m-%d`
BASE_URL="https://celestrak.com/NORAD/elements"
TEMP_DIR="./src/data/tmp"
DATA_DIR="./docs/data"
ARCHIVE_DIR="./tle-archive"

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
  "active"
)

mkdir "${TEMP_DIR}"

# Fetch each file.
declare -i i=1
for filename in "${files[@]}"
do
  echo "Progress: ${i}/${#files[@]}: ${filename}"
  curl "${BASE_URL}/${filename}.txt" > "${TEMP_DIR}/${filename}.txt"
  # Sleep for a bit to be nice to the Celestrak servers.
  sleep .5
  let i++
done

# Combines all TLEs.
cat "${TEMP_DIR}/"* >> "${TEMP_DIR}/_all-tles.txt"

# Extract ISS info to bundle with initial JS payload.
# head -3 stations.txt >> _iss.txt
# cd ~/

# Copy to prod data directory.
cp "${TEMP_DIR}/_all-tles.txt" "${DATA_DIR}/tles.txt"

# Add to TLE archive for this date.
cp "${TEMP_DIR}/_all-tles.txt" "${ARCHIVE_DIR}/${DATE}_tles.txt"
# tar -cjvf "${ARCHIVE_DIR}/${DATE}_tles.bz2" "${ARCHIVE_DIR}/${DATE}_tles.txt"

# Cleanup
rm -r "${TEMP_DIR}"