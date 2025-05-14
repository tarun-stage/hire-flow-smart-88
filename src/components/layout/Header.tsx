
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New candidate application for Senior Developer", time: "10 minutes ago" },
    { id: 2, text: "John Smith approved your job requisition", time: "1 hour ago" },
    { id: 3, text: "Interview scheduled with Alex Johnson", time: "2 hours ago" },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 bg-white fixed top-0 right-0 left-0 z-20 flex items-center px-4">
      <div className="ml-16 md:ml-64 flex-1 flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search candidates, jobs, or anything..."
            className="pl-8 bg-gray-50"
          />
        </div>
        
        <div className="flex items-center ml-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fade-in">
                <div className="py-2 px-4 bg-primary-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm text-gray-800">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="py-2 px-4 border-t border-gray-200">
                  <Button variant="link" className="w-full justify-center text-xs">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="default" size="sm" className="ml-4 bg-primary-600 hover:bg-primary-700">
            + New Requisition
          </Button>
        </div>
      </div>
    </header>
  );
}
