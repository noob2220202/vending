"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChargeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ChargeModal({ open, onOpenChange }: ChargeModalProps) {
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState<number>(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passVerified, setPassVerified] = useState<boolean>(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/user/verified')
        .then(res => res.json())
        .then(data => {
          setPassVerified(data.verified || false);
          setVerifiedData(data.data || null);
        })
        .catch(() => {
          setPassVerified(false);
          setVerifiedData(null);
        });
    }
  }, [open]);


  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!amount || amount <= 0) {
      setError("금액을 입력하세요.");
        return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount,
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || '충전 요청 실패');
      setSuccess(json.message || '충전이 완료되었습니다!');
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(null);
      }, 2000);
    } catch (e: any) {
      setError(e?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>결제</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`text-sm ${passVerified ? 'text-green-600' : 'text-red-600'}`}>
                {passVerified ? '본인 인증 완료' : '본인 인증 필요'}
              </div>
            </div>
            {passVerified && verifiedData ? (
              <div className="text-xs text-muted-foreground">
                {verifiedData.name} ({verifiedData.phone})
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">결제 방식</div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              계좌이체
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {verifiedData?.name}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">입금할 금액</div>
            <div className="flex items-center gap-2">
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <span className="text-muted-foreground">원</span>
            </div>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="font-semibold flex items-center gap-2"><span>⚠️</span>주의사항</div>
            <div>입금자명은 한 번 지정시 변경이 불가능 합니다.</div>
            <div>입금금액과 입금자명이 정확하다면 1분내로 자동 충전됩니다.</div>
            <div>1시간동안 입금확인이 되지 않을 경우 취소 처리 됩니다.</div>
            <div>입금신청을 잘못하신 경우 1시간 후 다시 시도해주세요.</div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
        </div>

        <DialogFooter>
          <Button disabled={loading || !passVerified} className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60" onClick={handleSubmit}>
            {loading ? '처리 중...' : (!passVerified ? '본인 인증 후 충전 가능' : '충전하기')}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
}


