import React, { useEffect, useRef } from 'react'
import { Link, } from 'react-router-dom';


export default function Home() {

  const videoref = useRef(null)
  const canvasref = useRef(null);
  const streamref=useRef(null);
  

  async function handleCameraPermission() {
    if (navigator && navigator.mediaDevices) {
      const options = { audio: false, video: { facingMode: "user", width: 300, height: 300 } }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(options)
        console.log(stream);
        streamref.current = stream;  // Store the stream in a ref, not in Redux

        videoref.current.srcObject = stream;
        videoref.current.play();

      } catch (error) {
        console.log(error)
      }
    }
  }

  async function Upload(imageDataUrl) {
    try {
      // Convert the data URL to a blob
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'captured-image.png');

      console.log(formData);
      
      // Send the image to the server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();   
      console.log('Image uploaded successfully:', data);    
      
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  async function CapturePhoto() {


    const canvas = canvasref.current;
    const video = videoref.current;


    // Define the desired resolution
    const desiredWidth = video.videoWidth;
    const desiredHeight = video.videoHeight;

    console.log(canvas, video)

    if (canvas && video) {
      // Set the canvas dimensions to match the video element
      canvas.width = desiredWidth;
      canvas.height = desiredHeight;

      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the image data from the canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Put the modified data back onto the canvas
      context.putImageData(imageData, 0, 0);

      // Optionally, convert the canvas content to a data URL (image format)
      const imageDataUrl = canvas.toDataURL('image/png');

      // For example, log the image data URL or set it as the source of an image element
      console.log(imageDataUrl);

      await Upload(imageDataUrl)
    }
  }

  const stopCamera = () => {
    if (streamref.current) {
      streamref.current.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(()=>{

    return ()=>{
      stopCamera(); // Clean up on component unmount
    }
    
  })

  return (
    <>
      <h1 className='text-4xl font-bold text-center mb-10'>Music Recommendation System using Facial Emotion</h1>
      <div className='flex justify-evenly'>
        <button className='mx-4 my-4 bg-blue-500 rounded-full w-[200px] h-[50px]' type="button" onClick={handleCameraPermission}>Give Camera Permission</button>
        <button className='mx-4 my-4  bg-pink-500 rounded-full w-[200px] h-[50px]' type="button" onClick={CapturePhoto}>Take Photo</button>

        <Link to={'/signin'}>
          <button className='mx-4 my-4  bg-orange-500 text-white rounded-full w-[200px] h-[50px]' type="button " >Login</button>
        </Link>
        <Link to={'/signup'}>
          <button className='mx-4 my-4  bg-purple-500 text-white rounded-full w-[200px] h-[50px]' type="button" >Get Started</button>
        </Link>
      </div>
      
      
      <div className='flex items-center justify-center'>
        <video className='mx-4 ' ref={videoref} width="300" height="300"  ></video>
        <canvas className='mx-4' ref={canvasref} style={{ width: 200, height: 200 }}></canvas>
      </div>

    </>
  )
}
