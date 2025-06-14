# Speech-to-text App (Flask & OpenAI)


https://github.com/user-attachments/assets/3a6be739-d029-4463-abf3-7ee9ff1bc17a



## Run app locally using Docker

1. [Install Docker](https://docs.docker.com/get-started/get-docker/)
2. Run the following:

   ```
   docker pull ameliaes/speech-to-text:latest
   docker run -p 5000:5000 ameliaes/speech-to-text
   ```

3. View app at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## What I have learnt:

- Set up a Flask web server to serve HTML and handle POST requests. Learnt how to use Flasks `@app.route()`
- Used OpenAI Whisper to transcribe audio files on the server side. This is a model that runs locally without using an API or a paid service!
- Learnt about recording audio from the browser using MediaRecorder API.
- Learnt some more JavaScript functions eg.
  - Asynchronous programming with JavaScript. This is method that enables your programme to start a long-running task but still be responsive to other events whilst that task is running. So in this project this was used when asking for permission to access the user's microphone in the browser.
    - Callbacks can be used to implement asynchronous functions BUT these can get very nested and then hard to debug (ie. "callback hell"). Instead, we can use JavaScript promises. Here the function starts and returns a Promise object. We can attach handlers to this promise object which will be executed when the operation has succeeded or failed.

## What next...

I'm working on a couple of GitHub issues to make this app better: adding more E2E tests, alert the user if they record files that are too large (whilst recording) and check the security of the app.

Essentially this project was a quick introduction into using Flask with OpenAI Whisper. In the long term the goal is to set up an offline, home voice assistant. So instead of using Alexa and sending our data to Amazon we can have our own local system running off a Raspberry Pi. It's pretty amazing that the offline models from OpenAI are freely available to make this home system possible.
