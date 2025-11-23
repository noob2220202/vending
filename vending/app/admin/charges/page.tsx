"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  Loader2,
  AlertCircle,
  DollarSign
} from 'lucide-react';

type ChargeRequest = {
  id: number;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  user_name: string;
  user_phone: string;
};

export default function AdminChargesPage() {
  const [charges, setCharges] = useState<ChargeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const loadCharges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/charges');
      if (res.ok) {
        const data = await res.json();
        setCharges(data.data || []);
      }
    } catch (error) {
      console.error('충전 요청 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('이 충전 요청을 승인하시겠습니까?')) return;
    
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/charges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' })
      });

      if (res.ok) {
        await loadCharges();
        alert('충전이 승인되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '승인 실패');
      }
    } catch (error) {
      alert('승인 중 오류가 발생했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('이 충전 요청을 거부하시겠습니까?')) return;
    
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/charges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' })
      });

      if (res.ok) {
        await loadCharges();
        alert('충전이 거부되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '거부 실패');
      }
    } catch (error) {
      alert('거부 중 오류가 발생했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '대기':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 w-fit"><Clock className="w-3 h-3 mr-1" />대기</Badge>;
      case '완료':
        return <Badge variant="outline" className="border-green-500 text-green-600 w-fit"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>;
      case '거부':
        return <Badge variant="outline" className="border-red-500 text-red-600 w-fit"><XCircle className="w-3 h-3 mr-1" />거부</Badge>;
      default:
        return <Badge variant="outline" className="w-fit">{status}</Badge>;
    }
  };

  const filteredCharges = charges.filter(charge => 
    charge.user_name?.toLowerCase().includes(query.toLowerCase()) ||
    charge.user_id.toLowerCase().includes(query.toLowerCase()) ||
    charge.user_phone?.includes(query) ||
    charge.amount.toString().includes(query)
  );

  const pendingCharges = filteredCharges.filter(c => c.status === '대기');
  const totalAmount = pendingCharges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
            <span className="text-center sm:text-left">충전 승인 관리</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
            사용자의 충전 요청을 승인하거나 거부합니다
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">대기 중인 요청</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{pendingCharges.length}건</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">대기 중인 금액</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalAmount.toLocaleString()}원</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">전체 요청</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{filteredCharges.length}건</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg">충전 요청 목록</CardTitle>
                <CardDescription className="text-xs sm:text-sm">전체 {filteredCharges.length}건의 충전 요청</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={loadCharges}
                disabled={loading}
                className="gap-2 text-xs sm:text-sm"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                새로고침
              </Button>
            </div>
            <div className="pt-3 sm:pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="사용자명, ID, 전화번호, 금액으로 검색..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 sm:h-11 pl-10 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {filteredCharges.map((charge) => (
                <Card key={charge.id} className="border-2 hover:border-blue-500/50 transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                            {charge.amount.toLocaleString().charAt(0)}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <h3 className="font-semibold text-base sm:text-lg">{charge.amount.toLocaleString()}원</h3>
                              {getStatusBadge(charge.status)}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                {charge.user_name || '이름 없음'} ({charge.user_id})
                              </span>
                              {charge.user_phone && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {charge.user_phone}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {new Date(charge.created_at).toLocaleString('ko-KR')}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                                결제 방법: {charge.payment_method}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {charge.status === '대기' && (
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => handleApprove(charge.id)}
                            disabled={processing === charge.id}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4"
                            size="sm"
                          >
                            {processing === charge.id ? (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(charge.id)}
                            disabled={processing === charge.id}
                            className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4"
                            size="sm"
                          >
                            {processing === charge.id ? (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            거부
                          </Button>
                        </div>
                      )}

                      {charge.status !== '대기' && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          {charge.status === '완료' ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          )}
                          <span className="font-medium">
                            {charge.status === '완료' ? '승인 완료' : '거부됨'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCharges.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {query ? '검색 결과가 없습니다.' : '충전 요청이 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
