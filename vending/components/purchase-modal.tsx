"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Plan {
  day: string;
  price: number;
  stock: string[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  plan: Plan[];
  status: string;
}

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  onPurchaseSuccess?: () => void;
}

export function PurchaseModal({ open, onOpenChange, product, onPurchaseSuccess }: PurchaseModalProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState<string>("");
  const [roleChanged, setRoleChanged] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (open && product) {
      setSelectedDay(product.plan?.[0]?.day || null);
      setAmount(1);
      setError(null);
      setSuccess(null);
      setImageError(false);
      setShowSuccessModal(false);
      setPurchaseCode("");
      setRoleChanged(false);
      setNewRole("");
    }
  }, [open, product]);

  if (!product) return null;

  const selectedPlan: Plan | undefined = product.plan?.find((p) => p.day === selectedDay);
  const totalPrice = selectedPlan ? selectedPlan.price * amount : 0;
  const availableStock: number = selectedPlan?.stock?.length || 0;

  const imgSrc = imageError ? "/default-product.png" : `/products/${product.id}.png`;

  const handlePurchase = async () => {
    if (!selectedDay) {
      setError("플랜을 선택해주세요");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${product.id}/purchase`, {
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
      onOpenChange(false);
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }

    } catch (e: any) {
      setError(e.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/purchase-history');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>제품 구매</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              <Image 
                src={imgSrc} 
                alt={product.name} 
                fill 
                className="object-cover" 
                onError={() => setImageError(true)}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
            </div>
          </div>

          {product.plan && product.plan.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">플랜 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {product.plan.map((p: Plan) => {
                  const stock: number = p.stock?.length || 0;
                  const isOutOfStock: boolean = stock === 0;
                  return (
                    <button
                      key={p.day}
                      onClick={() => !isOutOfStock && setSelectedDay(p.day)}
                      disabled={isOutOfStock}
                      className={`p-3 rounded border-2 text-sm transition-colors ${
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
                className="w-32"
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

          {error && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedDay || loading || availableStock === 0}
            className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 mb-3"
          >
            {loading ? '구매 처리 중...' : availableStock === 0 ? '품절' : '구매하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
              구매 내역에서 제품을 확인하실 수 있습니다.
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
    </>
  );
}

