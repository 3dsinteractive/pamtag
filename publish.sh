#!/bin/sh

echo "Select the version number increment type."
echo "Please choose an option:"
echo "1. patch"
echo "2. minor"
echo "3. major"
echo "Other. Do not increment"

read -p "Enter your choice (1, 2, or 3): " user_choice

case $user_choice in
  1)
    npm version patch
    ;;
  2)
    npm version minor
    ;;
  3)
    npm version major
    ;;
  *)
    echo "No increment"
    ;;
esac

yarn build
npm pack
npm publish



