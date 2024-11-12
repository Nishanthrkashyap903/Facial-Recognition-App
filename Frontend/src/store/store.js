import { configureStore} from "@reduxjs/toolkit"
import authSlice from "./authslice"
import songReducer from './songSlice';

const store=configureStore(
    {
        reducer:{
            auth:authSlice,
            songs: songReducer
        }
    }
)

export default store;