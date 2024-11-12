import { createSlice } from '@reduxjs/toolkit';

const songSlice = createSlice({
    name: 'songs',
    initialState: {
        songsList: [],
        imageEmotion: null
    },
    reducers: {
        setSongs: (state, action) => {
            state.songsList = action.payload;
        },
        clearSongs: (state) => {
            state.songsList = [];
        },
        setImageEmotion: (state, action) => {
            state.imageEmotion = action.payload;
        }
    }
});

export const { setSongs, clearSongs, setImageEmotion } = songSlice.actions;
export default songSlice.reducer; 