import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setSongs, setImageEmotion } from '../store/songSlice';

function User() {

  const navigate = useNavigate();
  const { emailId } = useParams();

  const authState = useSelector(state => state.auth);
  const authEmailId = authState.emailId;
  const authStatus = authState.status;

  const videoref = useRef(null)
  const canvasref = useRef(null);
  const streamref = useRef(null);

  const dispatch = useDispatch();

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

      if(response.status !== 200){

        toast.error("Error Identifying Song redirecting...", {
          position: "top-right", // Or "bottom-right" for bottom positioning
          autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
          hideProgressBar: false,
          closeOnClick: true,
        });
        return;
        
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);
      console.log(data.songs);

      // Dispatch songs to Redux store
      dispatch(setImageEmotion(data.imageEmotion));
      dispatch(setSongs(data.songs));


      toast.success("Song Identified Successfully redirecting...", {
        position: "top-right", // Or "bottom-right" for bottom positioning
        autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
        hideProgressBar: false,
        closeOnClick: true,
      });

      setTimeout(() => {
        navigate(`/User/${emailId}/playlist`)
      }, 3000);

    } catch (error) {
      console.error('Error uploading image:', error);

      toast.error("Error Identifying Song redirecting...", {
        position: "top-right", // Or "bottom-right" for bottom positioning
        autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
        hideProgressBar: false,
        closeOnClick: true,
      });
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

  useEffect(() => {
    if (!authStatus || emailId !== authEmailId) {
      navigate('/')
    }

    return () => {
      stopCamera(); // Clean up on component unmount
    }
  }, [])

  return (
    <>
      <ToastContainer />
      <div className='flex justify-evenly'>
        <button className='mx-4 my-4 bg-blue-500 rounded-full w-[200px] h-[50px]' type="button" onClick={handleCameraPermission}>Give Camera Permission</button>
        <button className='mx-4 my-4  bg-pink-500 rounded-full w-[200px] h-[50px]' type="button" onClick={CapturePhoto}>Take Photo</button>
      </div>

      <div className='flex items-center justify-center'>
        <input
          type="file"
          accept="image/*"
          id="imageUpload"
          className="hidden"
          onChange={(e) => Upload(URL.createObjectURL(e.target.files[0]))}
        />
        <label 
          htmlFor="imageUpload"
          className='mx-4 my-4 bg-green-500 rounded-full w-[200px] h-[50px] flex items-center justify-center cursor-pointer hover:bg-green-600'
        >
          Upload Image
        </label>
      </div>

      <div className='flex items-center justify-center'>
        <video className='mx-4 ' ref={videoref} width="300" height="300"  ></video>
        <canvas className='mx-4' ref={canvasref} style={{ width: 200, height: 200 }}></canvas>
      </div>
    </>
  )
}

export default User