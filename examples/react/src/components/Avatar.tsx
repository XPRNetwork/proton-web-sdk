import { useSelector } from 'react-redux';
import { selectUser, selectUserAvatar, setUser } from '../store/slices/user.slice';
import * as SDK from "../webSdk";
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../hooks/store';

export const Avatar = () => {

  const user = useSelector(selectUser)
  const avatar = useSelector(selectUserAvatar)

  const dispatch = useAppDispatch()
 
  const clear = useCallback(() => dispatch(
    setUser({
      actor: '',
      permission: '',
      accountData: undefined
    })
  ), [dispatch])

  const login = useCallback(async (reconnect: boolean = false) => {
    clear();
    
    if (reconnect) {
      await SDK.reconnect();
    } else {
      await SDK.login();
    }

    if (SDK.session && SDK.session.auth) {
      dispatch(
        setUser({
          actor: SDK.session.auth.actor.toString(),
          permission: SDK.session.auth.permission.toString(),
          accountData: await SDK.getProtonAvatar(SDK.session.auth.actor.toString())
        })
      );
    }
  }, [clear, dispatch])

  useEffect(() => {
    login(true)
  }, [login])

  const logout = async () => {
    await SDK.logout();
    clear();
  }

  if (!user.actor) {
    return (
      <div
        onClick={() => login()}
        className="cursor-pointer whitespace-nowrap bg-purple-100 border border-transparent rounded-md py-2 px-4 inline-flex items-center justify-center text-base font-medium text-purple-600 hover:bg-purple-200"
      >
        Login
      </div>
    )
  }
  return (
    <div className="relative">
      <div>
        <div
          className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 lg:p-2 lg:rounded-md0"
          id="user-menu"
          aria-haspopup="true"
        >
          <img
            className="hidden sm:block h-8 w-8 rounded-full"
            src={avatar}
            alt="Profile"
          />

          <span className="ml-1 sm:ml-3 text-gray-700 text-sm font-medium lg:block">
            { user.actor }
          </span>
          
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="trash-alt"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            onClick={() => logout()}
            className="ml-2 w-4 h-4 cursor-pointer"
          >
            <path
              fill="currentColor"
              d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"
              className=""
            />
          </svg>
        </div>
      </div>
    </div>
  );
}