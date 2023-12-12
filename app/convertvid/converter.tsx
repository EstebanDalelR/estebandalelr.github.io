"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";

export default function Converter() {
  const [loaded, setLoaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setVidLoaded(true);
      console.log("effect", selectedFiles);
    }
  }, [selectedFiles]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
      const url = URL.createObjectURL(event.target.files[0]);

      if (videoRef.current) {
        videoRef.current.src = url;
        setVideoUrl(url);
        videoRef.current.load(); // Explicitly load the new video source
      }
    }
  };
  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
    const ffmpeg = ffmpegRef.current;
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  const transcode = async () => {
    if (selectedFiles.length === 0) {
      alert("Please upload a WebM file first.");
      return;
    }
    const ffmpeg = ffmpegRef.current;
    const file = selectedFiles[0];
    const filename = file.name;

    // Write the uploaded file to the FFmpeg FS
    await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
    console.log("wrote file");
    // Transcode the uploaded WebM file to MP4
    alert(
      "Please wait while we convert your video, this may take a while. A download will start when done."
    );
    await ffmpeg.exec(["-i", filename, "output.mp4"]);
    // Reading the output file from FFmpeg FS
    const data = await ffmpeg.readFile("output.mp4");
    // Create a Blob from the output file
    // @ts-ignore
    const blob = new Blob([data.buffer], { type: "video/mp4" });

    // Create a Blob URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a download link and append it to the DOM (or trigger it programmatically)
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "output.mp4";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return loaded ? (
    <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <input
        type="file"
        multiple
        accept="video/webm"
        onChange={handleFileChange}
      />
      <div>
        <button
          onClick={transcode}
          className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
        >
          Transcode webm to mp4
        </button>
      </div>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ visibility: vidLoaded ? "visible" : "hidden" }}
      ></video>
    </div>
  ) : (
    <button
      className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
      onClick={load}
    >
      Load ffmpeg-core
      {isLoading && (
        <span className="animate-spin ml-3">
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="loading"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </svg>
        </span>
      )}
    </button>
  );
}
