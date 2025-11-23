"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [amount, setAmount] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState<string>("");
  const [roleChanged, setRoleChanged] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const product = json?.data;
        setData(product);
        if (product?.plan?.length) setSelectedDay(product.plan[0].day);
      })
      .catch(() => !cancelled && setError("불러오기에 실패했습니다."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const imgSrc = imageError ? "/default-product.png" : `/products/${id}.png`;

  const handlePurchase = async () => {
    if (!selectedDay) {
      setPurchaseError("플랜을 선택해주세요");
      return;
    }

    setPurchaseError(null);
    setPurchaseSuccess(null);
    setPurchasing(true);

    try {
      const res = await fetch(`/api/products/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planDay: selectedDay, amount })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '구매에 실패했습니다');
      }

      setPurchaseCode(json.data.code);
      setRoleChanged(json.data.roleChanged || false);
      setNewRole(json.data.userRole || "");
      setShowSuccessModal(true);

    } catch (e: any) {
      setPurchaseError(e.message || '오류가 발생했습니다');
    } finally {
      setPurchasing(false);
    }
  };

  const selectedPlan = data?.plan?.find((p: any) => p.day === selectedDay);
  const totalPrice = selectedPlan ? selectedPlan.price * amount : 0;
  const availableStock = selectedPlan?.stock?.length || 0;

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/purchase-history');
  };

  return (
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>제품 소개</CardTitle>
            <Button variant="outline" onClick={() => router.push(`/products?category=${data.category}`)}>목록으로</Button>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-gray-500">불러오는 중...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <Image src={imgSrc} alt={data.name} fill className="object-cover" onError={() => setImageError(true)} />
                </div>
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{data.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{data.description}</p>
                  </div>

                  <div className="p-3 rounded bg-gray-50 dark:bg-[#252932] text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {data.specification}
                  </div>

                  {data.plan && data.plan.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">플랜 선택</label>
                      <div className="grid grid-cols-2 gap-2">
                        {data.plan.map((p: any) => {
                          const stock = p.stock?.length || 0;
                          const isOutOfStock = stock === 0;
                          return (
                            <button
                              key={p.day}
                              onClick={() => !isOutOfStock && setSelectedDay(p.day)}
                              disabled={isOutOfStock}
                              className={`p-3 rounded border-2 text-sm transition-colors relative ${
                                isOutOfStock
                                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                  : selectedDay === p.day
                                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-teal-400'
                              }`}
                            >
                              <div className="font-semibold">{p.day}</div>
                              <div className="text-xs">{p.price.toLocaleString()}원</div>
                              <div className={`text-xs mt-1 ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                                {isOutOfStock ? '품절' : `재고 ${stock}개`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">수량</label>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        min="1" 
                        max={availableStock}
                        value={amount} 
                        onChange={(e) => setAmount(Math.max(1, Math.min(availableStock, Number(e.target.value))))}
                        className="w-24"
                        disabled={availableStock === 0}
                      />
                      {availableStock > 0 && (
                        <span className="text-sm text-muted-foreground">
                          (최대 {availableStock}개)
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedPlan && (
                    <div className="p-4 rounded bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">총 결제 금액</span>
                        <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                          {totalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  )}

                  {purchaseError && (
                    <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                      {purchaseError}
                    </div>
                  )}
                  {purchaseSuccess && (
                    <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                      {purchaseSuccess}
                    </div>
                  )}

                  <Button 
                    onClick={handlePurchase}
                    disabled={!selectedDay || purchasing || availableStock === 0}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
                  >
                    {purchasing ? '구매 처리 중...' : availableStock === 0 ? '품절' : '구매하기'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">구매 완료</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-green-600 dark:text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                구매가 완료되었습니다!
              </p>
              {roleChanged && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    축하합니다! <span className="text-orange-600 dark:text-orange-400">{newRole}</span> 등급으로 승급!
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                구매 내역에서 확인하실 수 있습니다.
              </p>
            </div>
            
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSuccessConfirm}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


