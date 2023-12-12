import React, { useRef, useState } from "react";

export default function VidMaker() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Create the ref for the canvas

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };
  function createVideo(images, durationPerImage) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Assuming all images are the same size - you'd need to handle different sizes
    if (!canvas || !ctx) return;

    canvas.width = 640; // Set to your required dimensions
    canvas.height = 480;

    // Create a video stream from the canvas
    const stream = canvas?.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url); // Update the state with the video URL
    };

    mediaRecorder.start();

    // Function to process each image
    let currentImage = 0;
    const processImage = () => {
      if (currentImage >= images.length) {
        mediaRecorder.stop();
        return;
      }

      // Draw the image onto the canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas?.width, canvas?.height);
        currentImage++;
        setTimeout(processImage, durationPerImage * 1000);
      };
      img.src = URL.createObjectURL(images[currentImage]);
    };

    processImage();
  }

  const handleCreateVideo = () => {
    if (selectedFiles.length === 0) {
      alert("Please select some images first!");
      return;
    }

    const duration = prompt(
      "Enter the duration for each image in seconds:",
      "0.1"
    );
    let timeDuration = parseFloat(duration!);
    if (!timeDuration || isNaN(timeDuration) || timeDuration <= 0) {
      alert("Please enter a valid number for the duration.");
      return;
    }

    // Now proceed to create the video
    createVideo(selectedFiles, parseFloat(duration!));
  };

  return (
    <>
      <h1>Image to Video Converter</h1>
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />
      <div>
        <button onClick={handleCreateVideo}>Create Video</button>
      </div>
      {videoUrl && (
        <div>
          <a href={videoUrl} download="video.mp4">
            Download Video
          </a>
        </div>
      )}
      <canvas ref={canvasRef} id="canvas"></canvas>
    </>
  );
}
