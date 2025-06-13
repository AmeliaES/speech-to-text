## Set up project

```{bash}
# create & activate virrual env
python3 -m venv venv
source ./venv/bin/activate
# Install requirements either:
pip install flask
pip install git+https://github.com/openai/whisper.git
brew install ffmpeg
pip freeze > requirements.txt
# or install from requirements.txt:
# pip install -r requirements.txt
```

## What I have learnt:

- Asynchronous programming with JavaScript. This is method that enables your programme to start a long-running task but still be responsive to other events whilst that task is running. So in this project this was used when asking for permission to access the user's microphone in the browser.
  - Callbacks can be used to implement asynchronous functions BUT these can get very nested and then hard to debug (ie. "callback hell"). Instead, we can use JavaScript promises. Here the function starts and returns a Promise object. We can attach handlers to this promise object which will be executed when the operation has succeeded or failed.
