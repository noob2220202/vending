"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  created_at: string;
}

export function ChargeNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const recentNotifications = data.data.filter((notification: Notification) => {
          const notificationTime = new Date(notification.created_at).getTime();
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          return notificationTime > fiveMinutesAgo;
        });
        
        if (recentNotifications.length > 0) {
          setNotifications(recentNotifications);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const dismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card key={notification.id} className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'charge_complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                {notification.type === 'charge_complete' && notification.data && (
                  <div className="text-xs text-gray-500 mt-1">
                    충전 방법: {notification.data.device === 'aos' ? '자동충전' : '수동충전'}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={dismissAll}
            className="text-xs"
          >
            모두 닫기
          </Button>
        </div>
      )}
    </div>
  );
}
