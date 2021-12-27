import { RpcInterfaces } from "@proton/js";
import { atom, selector } from "recoil";

export const userState = atom({
    key: 'userState',
    default: {
        actor: '',
        permission: '',
        accountData: undefined as RpcInterfaces.UserInfo | undefined
    },
});

export const userAvatar = selector({
    key: 'userAvatar',
    get: ({get}) => {
      const user = get(userState);
  
      const avatar = user.accountData && user.accountData.avatar

      if (avatar) {
        if (avatar.indexOf('/9j/') !== -1) {
          return `data:image/jpeg;base64,${avatar}`
        } else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
          return `data:image/png;base64,${avatar}`
        }
      }

      return 'https://bloks.io/img/proton_avatar.png'
    },
});