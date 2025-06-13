from flask import Flask, render_template, request, jsonify
import whisper
import os

app = Flask(__name__)
# Create an uploads directory if it doesn't exist
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# Ensure the maximum file size is set (e.g., 10MB)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB limit

# Load the Whisper model
model = whisper.load_model("base")

# Set up the main route 
@app.route("/")
def index():
    return render_template("index.html")

# Set up the route for transcribing audio files
@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file safely (this ensures malicious files are not executed)
    filename = 'recording.webm'
    filepath = os.path.join(UPLOAD_FOLDER, filename)
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

# Set up the route for handling errors
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Max size is 10MB.'}), 413

if __name__ == "__main__":
    app.run(debug=True)
