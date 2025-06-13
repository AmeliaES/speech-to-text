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
const downloadBtn = document.getElementById('download');

// Set the max size of the audio file to 10MB
const maxSizeMB = 10;
const MAX_SIZE = maxSizeMB * 1024 * 1024; // 10 MB in bytes

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

const stopMediaRecorder = (audioChunks) => {
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

    // If the audio file size exceeds the maximum size, alert the user
    if (audioBlob.size > MAX_SIZE) {
      alert(
        `The recorded audio file exceeds the maximum size of ${maxSizeMB}MB. Please try recording again.`
      );
      return;
    } else {
      transcribeBtn.disabled = false;
    }
  };
};

// Send the recorded audio to the server for transcription
// This function sends the audio Blob to the server using a POST request using a FormData object
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

// Function to download the audio file
const downloadAudio = () => {
  const text = document.getElementById('transcript').value;
  console.log('Transcript text:', JSON.stringify(text));

  if (!text) {
    alert('No transcript available to download.');
    return;
  }

  // Create a Blob from the transcript text
  // this Blob will be used to create a downloadable file
  // The Blob constructor takes an array of data and an options object
  // The options object specifies the MIME type of the file
  // In this case, we are creating a plain text file
  // The text will be downloaded as a .txt file
  const blob = new Blob([text], { type: 'text/plain' });

  // Create a temporary anchor element and set its href to the Blob URL
  const url = URL.createObjectURL(blob);

  // add an anchor element to the document to trigger the download
  // The anchor element is used to create a link that the user can click to download the file
  // a bit like writing a tmp <a href="somefile.txt" download>Download</a>
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transcript.txt'; // Set the file name
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --------------------------------------
// Set up event listeners for the buttons
// --------------------------------------
// When the record button is clicked, start recording audio
recordBtn.onclick = async () => {
  // Clear transcript box and disable the transcribe button
  document.getElementById('transcript').innerText = '';
  transcribeBtn.disabled = true;
  downloadBtn.disabled = true;

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
  downloadBtn.disabled = false;
  transcribeBtn.disabled = true;
};

downloadBtn.onclick = () => {
  downloadAudio();
};
