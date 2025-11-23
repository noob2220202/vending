"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { ChargeLog } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ChargeHistoryPage() {
  const [logs, setLogs] = useState<ChargeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const user = useUserStore((state: any) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.id === "비회원") {
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (showModal) setShowModal(false);

    if (loading) return;

    setLoading(true);
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/chargelogs`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) setLogs(result.data);
        }
      } catch (error) {
        console.error("충전내역 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "text-green-600 dark:text-green-400";
      case "대기":
        return "text-yellow-600 dark:text-yellow-400";
      case "거부":
        return "text-red-600 dark:text-red-400";
      case "취소":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const pagedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [logs]);

  const handleModalClose = () => {
    setShowModal(false);
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 pt-28 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-foreground text-xl">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
              접근 불가
            </DialogTitle>
            <DialogDescription className="text-base pt-4 text-start">
              로그인이 필요한 서비스입니다.
              <br />
              회원 로그인 후 이용해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              onClick={handleModalClose}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-screen-2xl mx-auto">
        <Card className="bg-muted/50 border-border">
          <CardHeader>
            <CardTitle className="text-2xl">충전내역</CardTitle>
          </CardHeader>

          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                충전내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1fr_1fr_2fr] gap-4 p-4 bg-accent/50 rounded-lg font-semibold text-sm">
                  <div className="text-center">충전금액</div>
                  <div className="text-center">충전수단</div>
                  <div className="text-center">상태</div>
                  <div className="text-center">비고</div>
                  <div className="text-center">충전일시</div>
                </div>

                {pagedLogs.map((log) => (
                  <Card key={log.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr] gap-4 items-center">
                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">충전금액</div>
                        <div className="text-foreground font-semibold text-teal-600 dark:text-teal-400 text-left lg:text-center">+{log.amount.toLocaleString()}원</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">충전수단</div>
                        <div className="text-foreground text-left lg:text-center">{log.payment_method}</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">상태</div>
                        <div className={`font-semibold text-left lg:text-center ${getStatusColor(log.status)}`}>{log.status}</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">비고</div>
                        <div className="text-muted-foreground text-sm text-left lg:text-center">-</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">충전일시</div>
                        <div className="text-muted-foreground text-sm whitespace-nowrap text-left lg:text-center">{formatDate(log.created_at)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-2">
                    <button className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
                    <button className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                    <span className="px-2 text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
                    <button className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
                    <button className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
    </>
  );
}

