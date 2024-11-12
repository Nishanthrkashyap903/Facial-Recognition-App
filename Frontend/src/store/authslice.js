import { createSlice } from "@reduxjs/toolkit";

const initialState={
    status:false,
    emailId: null,
}

const authSlice=createSlice(
    {
        name:'auth',
        initialState,
        reducers:{
            registerUser:(state,action)=>{
                state.status=true;
                state.emailId=action.payload.emailId;
            },
        }
    }
)

export const{registerUser}=authSlice.actions;
export default authSlice.reducer;