"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { BuyLog } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PurchaseHistoryPage() {
  const [logs, setLogs] = useState<BuyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const user = useUserStore((state: any) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (showModal) setShowModal(false);

    if (loading) return;

    if (!user || user.id === "비회원") {
      setShowModal(true);
      setLoading(false);
      return;
    }



    setLoading(true);
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/buylogs`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) setLogs(result.data);
        }
      } catch (error) {
        console.error("구매내역 로드 실패:", error);
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

  const handleModalClose = () => {
    setShowModal(false);
    router.push("/");
  };

  const handleCopy = (value: string | number) => {
    try {
      const text = String(value ?? "");
      if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }
    } catch {}
  };

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const pagedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [logs]);

  if (loading) {
    return (
      <main className="min-h-screen p-6 pt-28 lg:pt-24">
        <div className="max-w-screen-2xl mx-auto">
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
            <DialogDescription className="text-base pt-4">
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
            <CardTitle className="text-2xl">구매내역</CardTitle>
          </CardHeader>

          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                구매내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_2fr] gap-4 p-4 bg-accent/50 rounded-lg font-semibold text-sm">
                  <div className="text-center">상품명</div>
                  <div className="text-center">기간</div>
                  <div className="text-center">수량</div>
                  <div className="text-center">금액</div>
                  <div className="text-center">코드</div>
                  <div className="text-center">파일함</div>
                  <div className="text-center">구매일시</div>
                </div>

                {pagedLogs.map((log) => (
                  <Card key={log.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_2fr] gap-4 items-center">
                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">상품명</div>
                        <div className="text-foreground font-medium text-left lg:text-center">{log.product_name}</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">기간</div>
                        <div className="text-foreground text-left lg:text-center">{log.plan_day}일</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">수량</div>
                        <div className="text-foreground text-left lg:text-center">{log.amount}개</div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">금액</div>
                        <div className="text-foreground font-semibold text-blue-600 dark:text-blue-400">
                          <div className="text-left lg:text-center">{log.price.toLocaleString()}원</div>
                        </div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">코드</div>
                        <div className="text-foreground text-left lg:text-center">
                          <button
                            type="button"
                            className="underline-offset-2 hover:underline"
                            onClick={() => handleCopy(log.code)}
                            title="클릭하여 복사"
                          >
                            {log.code}
                          </button>
                        </div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">파일함</div>
                        <div className="flex justify-start lg:justify-center">
                          <Button asChild variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                            <Link href={`/api/filebox?productId=${log.product_id}`} target="_blank">파일함 열기</Link>
                          </Button>
                        </div>

                        <div className="lg:hidden font-semibold text-muted-foreground text-sm text-left">구매일시</div>
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
    {copied && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-md bg-black/80 text-white text-sm shadow-lg">
        복사되었습니다
      </div>
    )}
    </>
  );
}

