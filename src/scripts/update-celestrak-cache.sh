#!/bin/bash

DATE=`date +%Y-%m-%d`
BASE_URL="https://celestrak.org/NORAD/elements/gp.php"
TEMP_DIR="./src/data/tmp"
DATA_DIR="./docs/data"
ARCHIVE_DIR="./tle-archive"

https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&amp;FORMAT=tle

declare -a files=(
  "active"
  # "amateur"
  # "argos"
  # "beidou"
  # "cubesat"
  # "dmc"
  # "galileo"
  # "geo"
  # "geodetic"
  # "glo-ops"
  # "gps-ops"
  # "resource"
  # "sarsat"
  # "sbas"
  # "science"
  # "ses"
  # "stations"
  # "tdrss"
  # "visual"
  # "weather"
)

mkdir "${TEMP_DIR}"

# Fetch each file.
declare -i i=1
for filename in "${files[@]}"
do
  echo "Progress: ${i}/${#files[@]}: ${filename}"
  curl "${BASE_URL}?GROUP=${filename}&amp;FORMAT=tle" > "${TEMP_DIR}/${filename}.txt"
  # Sleep for a bit to be nice to the Celestrak servers.
  sleep .5
  let i++
done

echo "Done fetching TLEs"

echo "Combining TLEs"

# Combines all TLEs.
cat "${TEMP_DIR}/"* >> "${TEMP_DIR}/_all-tles.txt"

echo "Done combining TLEs"

# Copy to prod data directory.
cp "${TEMP_DIR}/_all-tles.txt" "${DATA_DIR}/tles.txt"

# Add to TLE archive for this date.
cp "${TEMP_DIR}/_all-tles.txt" "${ARCHIVE_DIR}/${DATE}_tles.txt"

# Cleanup
rm -r "${TEMP_DIR}"