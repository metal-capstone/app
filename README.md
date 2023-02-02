# spotify chatbot app

## Create container

docker build . -t spotify-chatbot-app

## Run container

docker run -p 3000:3000 -d spotify-chatbot-app

## Debug React App
1. Open the app folder in VSCode.
2. Select the Run and Debug tab on the left bar.
3. Choose `Launch Chrome: React App Debugging`.
4. Press the green play button next to it.
