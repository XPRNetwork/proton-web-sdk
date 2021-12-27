import { Avatar } from "./Avatar";
import logo from '../assets/logo.svg'

export const Header = () => (
  <div className="relative bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center border-b border-gray-200 py-6 md:justify-start md:space-x-10">
        <div className="hidden sm:block flex justify-start">
          <span className="sr-only">Proton</span>
          <img
            className="w-auto h-8 sm:h-10"
            src={logo}
            alt=""
          />
        </div>

        <nav className="flex space-x-4 sm:space-x-10 justify-center pr-2">
          Transfer
        </nav>

        <div className="flex items-center justify-end space-x-8 md:flex-1 lg:w-0">
          <Avatar/>
        </div>
      </div>
    </div>
  </div>
)