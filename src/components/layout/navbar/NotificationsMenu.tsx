
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Notification } from '@/services/api';

interface NotificationsMenuProps {
  notifications: Notification[];
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ notifications }) => {
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadNotificationsCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id} className={cn("p-3 cursor-pointer", !notification.read && "bg-muted/50")}>
              <div className="flex flex-col gap-1">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString()}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="py-3 px-2 text-center text-muted-foreground">
            No notifications yet
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="cursor-pointer w-full text-center justify-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
