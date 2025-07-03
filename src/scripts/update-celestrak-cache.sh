#!/bin/bash

DATE=`date +%Y-%m-%d`
BASE_URL="https://celestrak.org/NORAD/elements/gp.php"
TEMP_DIR="./src/data/tmp"
DATA_DIR="./docs/data"
ARCHIVE_DIR="./tle-archive"

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

# Fetch and append MethaneSAT (inactive)
curl "https://celestrak.org/NORAD/elements/gp.php?CATNR=59101&amp;FORMAT=tle" >> "${TEMP_DIR}/${filename}.txt"

echo "Done fetching TLEs"

echo "Combining TLEs"

# Combines all TLEs.
cat "${TEMP_DIR}/"* >> "${TEMP_DIR}/_all-tles.txt"

echo "Done combining TLEs"

# Copy to prod data directory.
cp "${TEMP_DIR}/_all-tles.txt" "${DATA_DIR}/tles.txt"

# Copy MethaneSAT TLE to a separate file for convenience
awk '/^METHANESAT/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" > "${DATA_DIR}/ghg-satellites.txt"
awk '/^GOSAT-GW/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C1/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C2/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C3/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C4/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C5/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C6/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C7/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^GHGSAT-C8/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^SENTINEL-5P/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^ENMAP/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^PRISMA/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^SENTINEL-2A/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^SENTINEL-2B/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^SENTINEL-2C/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
# EMIT is aboard the International Space Station (ISS)
awk '/^ISS (ZARYA)/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^LANDSAT 8/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
awk '/^LANDSAT 9/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"
# Carbon Mapper is aboard Tanager-1
awk '/^TANAGER-1/{p=3} p-- > 0' "${TEMP_DIR}/_all-tles.txt" >> "${DATA_DIR}/ghg-satellites.txt"

# Add to TLE archive for this date.
cp "${TEMP_DIR}/_all-tles.txt" "${ARCHIVE_DIR}/${DATE}_tles.txt"

# Cleanup
rm -r "${TEMP_DIR}"