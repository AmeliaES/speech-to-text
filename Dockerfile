# Use an official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /flask-app

# Copy requirements.txt to working dir
COPY requirements.txt requirements.txt
# Update the apt package manager and installing git
RUN apt-get update && apt-get install git -y
# Install dependencies
RUN pip3 install -r requirements.txt
RUN pip3 install "git+https://github.com/openai/whisper.git" 
RUN apt-get install -y ffmpeg

COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Set environment variable
ENV FLASK_APP=app.py

# Run the app (tell Flask to listen to all network interfaces)
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
