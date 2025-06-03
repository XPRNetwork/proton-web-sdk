import type { RpcInterfaces } from '@proton/js';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store';

// Define a type for the slice state
interface UserState {
    actor: string;
    permission: string;
    accountData?: RpcInterfaces.UserInfo;
}

// Define the initial state using that type
const initialState: UserState = {
  actor: '',
  permission: '',
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
        
      state.actor = action.payload.actor;
      state.permission = action.payload.permission;
      state.accountData = action.payload.accountData ?? undefined
      console.log('setUser', state);
    },
    clearUser: (state) => {
        userSlice.caseReducers.setUser(state, { type: 'setUser', payload: { actor: '', permission: '' }})
    }
  }
})

export const { setUser, clearUser } = userSlice.actions

export const selectUser = (state: RootState) => state.user

// Other code such as selectors can use the imported `RootState` type
export const selectUserAvatar = ({ user }: RootState) => {

    const avatar = user.accountData && user.accountData.avatar

    if (avatar) {
        if (avatar.indexOf('/9j/') !== -1) {
            return `data:image/jpeg;base64,${avatar}`
        } else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
            return `data:image/png;base64,${avatar}`
        }
    }

    return 'https://explorer.xprnetwork.org/img/proton_avatar.png'
}

export default userSlice.reducer