"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PassModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerified: (payload: any) => void;
}

type ApiResp<T = any> = {
  status?: string;
  message?: string;
  data?: T;
  task_id?: string;
  error?: string;
};

export function PassModal({ open, onOpenChange, onVerified }: PassModalProps) {
  const [step, setStep] = useState<'start' | 'form' | 'code'>('start');
  const [isp, setIsp] = useState('SK');
  const [taskId, setTaskId] = useState<string>('');
  const [captchaUrl, setCaptchaUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birth7, setBirth7] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  function onlyDigits(v: string) {
    return (v || '').replace(/\D+/g, '');
  }

  async function startFlow() {
    setLoading(true);
    setMsg('');
    try {
      const initRes = await fetch('/api/pass/init', { method: 'POST' });
      const initData: ApiResp = await initRes.json();
      if (!initRes.ok || !initData.task_id) throw new Error(initData?.message || initData?.error || 'init 실패');
      setTaskId(initData.task_id);

      const ispRes = await fetch('/api/pass/isp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: initData.task_id, isp })
      });
      const ispData: ApiResp<{ captcha: string }> = await ispRes.json();
      if (!ispRes.ok || !ispData?.data?.captcha) throw new Error(ispData?.message || ispData?.error || 'ISP 등록 실패');
      try {
        const url = new URL(ispData.data.captcha);
        const img = url.searchParams.get('img');
        setCaptchaUrl(img ? `/api/pass/img?img=${encodeURIComponent(img)}` : ispData.data.captcha);
      } catch {
        setCaptchaUrl(ispData.data.captcha);
      }
      setStep('form');
    } catch (e: any) {
      setMsg(e?.message || '시작 실패');
    } finally {
      setLoading(false);
    }
  }

  async function submitInfo() {
    setLoading(true);
    setMsg('');
    try {
      const birth = onlyDigits(birth7);
      if (birth.length !== 7) throw new Error('생년월일은 YYMMDD+성별코드 7자리여야 합니다.');
      const phoneDigits = onlyDigits(phone);
      if (phoneDigits.length < 10 || phoneDigits.length > 11) throw new Error('전화번호는 숫자 10~11자리여야 합니다.');

      const res = await fetch('/api/pass/info-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, name, birthday: birth, phone: phoneDigits, captcha_answer: captchaAnswer })
      });
      const data: ApiResp = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || '정보 제출 실패');
      setStep('code');
    } catch (e: any) {
      setMsg(e?.message || '정보 제출 오류');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/pass/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, auth_code: authCode })
      });
      const data: ApiResp = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || '인증 실패');
      onVerified(data?.data || null);
      onOpenChange(false);
    } catch (e: any) {
      setMsg(e?.message || '인증 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>본인 인증 (PASS)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {msg ? <div className="text-red-600 text-sm">{msg}</div> : null}

          {step === 'start' && (
            <div className="space-y-3">
              <label className="block text-sm">통신사</label>
              <select className="border rounded px-3 py-2 w-full bg-background text-foreground" value={isp} onChange={(e) => setIsp(e.target.value)}>
                <option value="SK">SKT</option>
                <option value="KT">KT</option>
                <option value="LG">LGU+</option>
              </select>
              <Button onClick={startFlow} disabled={loading} className="w-full">
                {loading ? '시작 중...' : '인증 시작'}
              </Button>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-3">
              <div>
                <div className="text-sm">캡챠</div>
                {captchaUrl ? <img src={captchaUrl} alt="captcha" className="border rounded bg-white" /> : null}
              </div>
              <div>
                <div className="text-sm">이름</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <div className="text-sm">전화번호</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="숫자만" />
              </div>
              <div>
                <div className="text-sm">생년월일 7자리 (YYMMDD+성별)</div>
                <Input value={birth7} onChange={(e) => setBirth7(e.target.value)} placeholder="예: 9901011" />
              </div>
              <div>
                <div className="text-sm">캡챠 정답</div>
                <Input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} />
              </div>
              <Button onClick={submitInfo} disabled={loading} className="w-full">
                {loading ? '전송 중...' : '인증번호 받기'}
              </Button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-3">
              <div className="text-sm">인증번호</div>
              <Input value={authCode} onChange={(e) => setAuthCode(e.target.value)} />
              <Button onClick={verifyCode} disabled={loading} className="w-full">
                {loading ? '확인 중...' : '인증 완료'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}


