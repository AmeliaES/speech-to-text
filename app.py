from flask import Flask, render_template, request, jsonify
import whisper
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = whisper.load_model("base")

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file safely
    filename = 'recording.webm'
    filepath = os.path.join('uploads', filename)
    os.makedirs('uploads', exist_ok=True)
    file.save(filepath)

    # Convert or decode file if needed before passing to Whisper
    try:
        result = model.transcribe(filepath)
        text = result['text']
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    return jsonify({'text': text})


if __name__ == "__main__":
    app.run(debug=True)
