#!/bin/bash

# Define associative array: filename => DOI
declare -A dois
dois["2024-impact-force-compound-drop.md"]="10.1063/5.0183822"
dois["2022-concentric-drop-spreading.md"]="10.1063/5.0117964"
dois["2025-impact-forces-drop-pool.md"]="10.xxxx/xxxxx"
dois["2025-jet-impact-compound-drop.md"]="10.xxxx/xxxxx"
dois["2025-scaling-maximum-force-drop.md"]="10.xxxx/xxxxx"

cd _publications || exit

for file in "${!dois[@]}"; do
  doi="${dois[$file]}"
  paperurl="https://doi.org/$doi"

  if [[ -f "$file" ]]; then
    echo "🔄 Updating $file with DOI and paperurl"

    # Remove existing doi and paperurl lines
    sed -i '/^doi:/d' "$file"
    sed -i '/^paperurl:/d' "$file"

    # Add new DOI and paperurl after journal line
    sed -i "/^journal:/a doi: \"$doi\"\npaperurl: \"$paperurl\"" "$file"
  else
    echo "⚠️  File $file not found!"
  fi
done
