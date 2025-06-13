// Declare variables for media recording
// mediaRecorder will handle the recording process
// audioChunks is an array that will store the recorded audio data
// audioBlob will contain the recorded audio after recording as a single file
let mediaRecorder;
let audioChunks = [];
let audioBlob;

// Get references to the HTML elements by their IDs
const recordBtn = document.getElementById('record');
const stopBtn = document.getElementById('stop');
const transcribeBtn = document.getElementById('transcribe');
const audio = document.getElementById('audio');
const transcriptBox = document.getElementById('transcript');

// --------------------------------------
// Define helper functions
// --------------------------------------
// Get permission to use the microphone and return the median stream promise
const getMediaStream = async () => {
  // Ask the browser for permission to use the microphone
  // getUserMedia returns a promise that resolves to a MediaStream object (stream of audio data)
  // await pauses the execution until the user grants permission
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return stream;
};

// Get media recorder from the stream
const getMediaRecorder = async (stream) => {
  // Create a new MediaRecorder instance with the stream
  // MediaRecorder is a built-in browser API that allows recording of media streams
  mediaRecorder = new MediaRecorder(stream);
  return mediaRecorder;
};

const getAudioChunks = (audioChunks) => {
  // Empry array to hold audio data chunks
  audioChunks = [];
  // When data is available, push it (ie. add it) to the audioChunks array
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  return audioChunks;
};

const audioToBlob = (audioChunks) => {
  // Create a Blob from the audioChunks array
  // Blob is a file-like object of immutable, raw data
  // The type is set to 'audio/webm' for compatibility with the MediaRecorder API
  return new Blob(audioChunks, { type: 'audio/webm' });
};

const blobToUrl = (blob) => {
  // Create a URL for the Blob
  // This URL can be used to play the audio in the audio element
  return URL.createObjectURL(blob);
};

// --------------------------------------
// Set up event listeners for the buttons
// --------------------------------------
// When the record button is clicked, start recording audio
recordBtn.onclick = async () => {
  // Get the media stream from the user's microphone
  const stream = await getMediaStream();

  // Get media recorder from the stream
  mediaRecorder = await getMediaRecorder(stream); // using the global mediaRecorder variable

  // Get audio chunks from the media recorder
  audioChunks = getAudioChunks(audioChunks);

  // Using the onstop event to handle the end of recording
  // When the recording stops, create a Blob from the audioChunks array
  // and set the audio source to the Blob URL
  mediaRecorder.onstop = () => {
    // Save the recorded audio data as a Blob (a JSON file for binary data)
    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    // Create a URL for the Blob and set it as the source of the audio element
    // Importantly this URL only exists while the page is open and only works on the client side (ie. the browser)
    // This allows the audio to be played back without needing to upload it to a server
    // This is a temporary URL that can be used to play the audio
    audio.src = URL.createObjectURL(audioBlob);
    transcribeBtn.disabled = false;
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};

function transcribeAudio() {
  if (!audioBlob) return;

  // Set up a FormData object to send the audio Blob
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm'); // append(name, value, filename)

  // sends the audio Blob to the server using a POST request
  fetch('/transcribe', {
    method: 'POST',
    body: formData,
  })
    // Take the server response (ie. the output from the fetch function) and convert it to JSON
    .then((res) => res.json())
    // Update the transcript box with the transcribed text
    .then((data) => {
      document.getElementById('transcript').innerText = data.text;
    })
    // Handle any errors that occur during the transcription process,
    // eg. network issues or server errors or if the server result is not in the expected format
    .catch((err) => {
      console.error('Transcription error:', err);
    });
}

// --------------------------------------
// Set up event listeners for the buttons
// --------------------------------------
// When the record button is clicked, start recording audio
recordBtn.onclick = async () => {
  // Get the media stream from the user's microphone
  const stream = await getMediaStream();

  // Get media recorder from the stream
  mediaRecorder = await getMediaRecorder(stream); // using the global mediaRecorder variable

  // Get audio chunks from the media recorder
  audioChunks = getAudioChunks(audioChunks);

  // Begin recording audio
  mediaRecorder.start();
  // Disable the record button and enable the stop button
  recordBtn.disabled = true;
  stopBtn.disabled = false;

  // Define the onstop event to handle the end of recording
  stopMediaRecorder(audioChunks);
};

// When the stop button is clicked, stop recording audio
// and reset the buttons
stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};

transcribeBtn.onclick = async () => {
  transcribeAudio();
};
