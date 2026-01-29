import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import logo from 'figma:asset/2b873b7a4e58ed40d540d82b4af77defc36ae5c8.png';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 shadow-sm">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5 shadow-sm">
            <img src={logo} alt="BloodLink Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg tracking-wide text-red-700">BloodLink</h2>
            <p className="text-xs text-red-600">Ministry of Health</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            3
          </Badge>
        </button>

        {/* Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Avatar className="bg-gradient-to-br from-red-500 to-red-600">
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm">Admin User</p>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
