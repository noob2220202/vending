"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type EmergencyNotice = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  end_at: string;
};

export function EmergencyAnnouncement() {
  const [open, setOpen] = useState(false);
  const [allNotices, setAllNotices] = useState<EmergencyNotice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isNoticeHidden = (noticeId: number): boolean => {
    if (typeof window === 'undefined') return false;
    const storageKey = `hideEmergency_${noticeId}`;
    const hiddenUntil = localStorage.getItem(storageKey);
    if (!hiddenUntil) return false;
    return new Date(hiddenUntil).getTime() > Date.now();
  };

  const findNextVisibleNotice = (notices: EmergencyNotice[], startIndex: number = 0): number => {
    for (let i = startIndex; i < notices.length; i++) {
      if (!isNoticeHidden(notices[i].id)) {
        return i;
      }
    }
    return -1;
  };

  useEffect(() => {
    let cancelled = false;

    fetch('/api/announcements/emergency')
      .then(r => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data && Array.isArray(json.data) && json.data.length > 0) {
          setAllNotices(json.data);
          const firstVisibleIndex = findNextVisibleNotice(json.data);
          if (firstVisibleIndex !== -1) {
            setCurrentIndex(firstVisibleIndex);
            setOpen(true);
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const currentNotice = allNotices[currentIndex];

  const hideCurrentNoticeForOneDay = () => {
    if (!currentNotice) return;
    const until = new Date(Date.now() + 24*60*60*1000).toISOString();
    const storageKey = `hideEmergency_${currentNotice.id}`;
    try { 
      localStorage.setItem(storageKey, until);
    } catch {}
    
    const nextIndex = findNextVisibleNotice(allNotices, currentIndex + 1);
    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
    } else {
      setOpen(false);
    }
  };

  const closeAndShowNext = () => {
    const nextIndex = findNextVisibleNotice(allNotices, currentIndex + 1);
    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
    } else {
      setOpen(false);
    }
  };

  if (!currentNotice) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg border-2 border-orange-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            긴급 공지
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-lg font-semibold">{currentNotice.title}</div>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">{currentNotice.content}</div>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={hideCurrentNoticeForOneDay}
            className="gap-2"
          >
            <span>하루동안 보지 않기</span>
          </Button>
          <Button 
            onClick={closeAndShowNext} 
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          >
            {findNextVisibleNotice(allNotices, currentIndex + 1) !== -1 ? '다음 공지 보기' : '닫기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


