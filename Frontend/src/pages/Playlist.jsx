import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faMusic } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Playlist() {
    const songs = useSelector(state => state.songs.songsList)
    const hindiSongs = songs.filter(song => song.language === 'Hindi')
    const englishSongs = songs.filter(song => song.language === 'English')

    const imageEmotion = useSelector(state => state.songs.imageEmotion)
    const { emailId } = useParams()
    const authState = useSelector(state => state.auth)
    const authEmailId = authState.emailId
    const authStatus = authState.status

    const navigate = useNavigate()

    const [audioObjects, setAudioObjects] = useState({})
    const [currentSong, setCurrentSong] = useState(null)

    useEffect(() => {
        if (!authStatus || emailId !== authEmailId) {
            navigate('/')
        }

        return () => {
            //clean up only the current song

            if (currentSong && audioObjects[currentSong]) {
                audioObjects[currentSong].pause();          
                audioObjects[currentSong].currentTime = 0;
            }
        };
    }, [])

    // Function to fetch song and store in audioObjects if not already present
    async function getSong(songName,language) {
        try {

            // If song already exists in audioObjects, play it without fetching again
            if (audioObjects[songName]) {
                toast.info('Song already exists', {
                    position: "top-right", // Or "bottom-right" for bottom positioning
                    autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
                    hideProgressBar: false,
                    closeOnClick: true,
                });
                return
            }

            // Fetch the song from the server
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/${songName}?language=${language}`)
            if (res.status !== 200) {

                toast.error('Failed to fetch song', {
                    position: "top-right", // Or "bottom-right" for bottom positioning
                    autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
                    hideProgressBar: false,
                    closeOnClick: true,
                });

                throw new Error('Failed to fetch song')
            }

            const blob = await res.blob()

            // Create audio URL and Audio object
            const audioUrl = URL.createObjectURL(blob)
            const audio = new Audio(audioUrl)

            // Add the new audio object to state
            setAudioObjects(prev => ({
                ...prev,
                [songName]: audio
            }))

            toast.success('Song fetched successfully', {
                position: "top-right", // Or "bottom-right" for bottom positioning
                autoClose: 3000, // Duration in milliseconds (e.g., 3000ms = 3s)
                hideProgressBar: false,
                closeOnClick: true,
            });

        } catch (error) {
            console.error('Error playing song:', error)
        }
    }

    // Plays a song and stops any currently playing song
    async function playSong(songName) {
        if (currentSong) {
            audioObjects[currentSong].pause()
        }

        if (audioObjects[songName]) {
            audioObjects[songName].play()
            setCurrentSong(songName)
        }
    }

    // Pauses the currently playing song
    async function pauseSong(songName) {
        if (audioObjects[songName]) {
            audioObjects[songName].pause()
            setCurrentSong(null)
        }
    }
    return (
        <>
            <ToastContainer />
            {songs && (
                <div >
                    {imageEmotion && <h2 className='text-2xl font-bold mb-4'>Highest Predicted Emotion: {Object.keys(imageEmotion).reduce((a, b) => imageEmotion[a] > imageEmotion[b] ? a : b)}</h2>}

                    <h2 className='text-2xl font-bold mb-4'>Your Playlist: </h2>
                    <h1 className='text-xl font-bold mb-4'>Hindi Songs: </h1>
                    <ul>
                        {hindiSongs.map((song, index) => (
                            <li key={index} 
                                className="p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between" >
                                    <div className="flex items-center gap-4 hover:cursor-pointer group" onClick={() => getSong(song.song_name,song.language)}>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
                                            <FontAwesomeIcon icon={faMusic} className="text-blue-500 text-xl group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800 hover:text-blue-600 underline decoration-2 decoration-blue-400/30 hover:decoration-blue-500 transition-all duration-300">{song.song_name}</p>
                                        <p className="text-sm text-gray-500">{song.language}</p>
                                    </div>

                                    {audioObjects[song.song_name] && (
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => {

                                                    if (audioObjects[song.song_name].paused) {
                                                        playSong(song.song_name)
                                                    } else {
                                                        pauseSong(song.song_name)
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors duration-200"
                                            >
                                                <FontAwesomeIcon icon={audioObjects[song.song_name].paused ? faPlay : faPause} />
                                            </button>

                                            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden relative group">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={(audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100}
                                                    onChange={(e) => {
                                                        const time = (e.target.value / 100) * audioObjects[song.song_name].duration;
                                                        audioObjects[song.song_name].currentTime = time;
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 ease-in-out transform hover:scale-y-110"
                                                    style={{
                                                        width: `${(audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100}%`,
                                                        transition: 'width 0.3s ease-in-out'
                                                    }}
                                                    // onChange={(e) => {
                                                    //     const newWidth = (audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100;
                                                    //     e.target.style.width = `${newWidth}%`;
                                                    // }}
                                                >
                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md group-hover:scale-125 transition-transform duration-200"></div>
                                                </div>
                                            </div>

                                            <span className="text-sm text-gray-500">
                                                {Math.floor(audioObjects[song.song_name].currentTime / 60)}:
                                                {Math.floor(audioObjects[song.song_name].currentTime % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h2 className='text-2xl font-bold mb-4'>Your Playlist: </h2>
                    <h1 className='text-xl font-bold mb-4'>English Songs: </h1>

                    <ul>
                        {englishSongs.map((song, index) => (
                            <li key={index} 
                                className="p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between" >
                                    <div className="flex items-center gap-4 hover:cursor-pointer group" onClick={() => getSong(song.song_name,song.language)}>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
                                            <FontAwesomeIcon icon={faMusic} className="text-blue-500 text-xl group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800 hover:text-blue-600 underline decoration-2 decoration-blue-400/30 hover:decoration-blue-500 transition-all duration-300">{song.song_name}</p>
                                        <p className="text-sm text-gray-500">{song.language}</p>
                                    </div>

                                    {audioObjects[song.song_name] && (
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => {

                                                    if (audioObjects[song.song_name].paused) {
                                                        playSong(song.song_name)
                                                    } else {
                                                        pauseSong(song.song_name)
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors duration-200"
                                            >
                                                <FontAwesomeIcon icon={audioObjects[song.song_name].paused ? faPlay : faPause} />
                                            </button>

                                            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden relative group">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={(audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100}
                                                    onChange={(e) => {
                                                        const time = (e.target.value / 100) * audioObjects[song.song_name].duration;
                                                        audioObjects[song.song_name].currentTime = time;
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 ease-in-out transform hover:scale-y-110"
                                                    style={{
                                                        width: `${(audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100}%`,
                                                        transition: 'width 0.3s ease-in-out'
                                                    }}
                                                    // onChange={(e) => {
                                                    //     const newWidth = (audioObjects[song.song_name].currentTime / audioObjects[song.song_name].duration) * 100;
                                                    //     e.target.style.width = `${newWidth}%`;
                                                    // }}
                                                >
                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md group-hover:scale-125 transition-transform duration-200"></div>
                                                </div>
                                            </div>

                                            <span className="text-sm text-gray-500">
                                                {Math.floor(audioObjects[song.song_name].currentTime / 60)}:
                                                {Math.floor(audioObjects[song.song_name].currentTime % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

export default Playlist