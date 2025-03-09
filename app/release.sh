# quit on failure
set -e
flutter build ipa #--obfuscate  --split-debug-info=debug --extra-gen-snapshot-options=--save-obfuscation-map=/obfuscation_map

# Read API credentials from file
KEYS_FILE="$(dirname "$0")/ios-publish-keys.txt"
if [ ! -f "$KEYS_FILE" ]; then
  echo "Error: iOS publish keys file not found at $KEYS_FILE"
  exit 1
fi

# Source the keys file to get API_KEY and API_ISSUER variables
source "$KEYS_FILE"

# Verify the keys were loaded
if [ -z "$API_KEY" ] || [ -z "$API_ISSUER" ]; then
  echo "Error: API_KEY or API_ISSUER not found in $KEYS_FILE"
  exit 1
fi

xcrun altool --upload-app --type ios -f build/ios/ipa/*.ipa --apiKey "$API_KEY" --apiIssuer "$API_ISSUER"