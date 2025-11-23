"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { PurchaseModal } from "@/components/purchase-modal";

interface Plan {
  day: string;
  price: number;
  stock: string[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  plan: Plan[];
  specification: string;
  image_url?: string;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlans, setSelectedPlans] = useState<{ [key: number]: string }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const router = useRouter();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = categoryFilter
          ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
          : "/api/products";
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          
          const defaultPlans: { [key: number]: string } = {};
          data.forEach((product: Product) => {
            if (product.plan && product.plan.length > 0) {
              defaultPlans[product.id] = product.plan[0].day;
            }
          });
          setSelectedPlans(defaultPlans);
        }
      } catch (error) {
        console.error("상품 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".relative")) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handlePlanChange = (productId: number, day: string) => {
    setSelectedPlans((prev) => ({
      ...prev,
      [productId]: day,
    }));
  };

  const getSelectedPrice = (product: Product) => {
    const selectedDay = selectedPlans[product.id];
    if (!selectedDay || !product.plan) return product.price;

    const selectedPlan = product.plan.find((p) => p.day === selectedDay);
    return selectedPlan ? selectedPlan.price : product.price;
  };

  const getProductImage = (productId: number) => {
    if (imageErrors[productId]) {
      return "/default-product.png";
    }
    return `/products/${productId}.png`;
  };

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  const handlePurchaseClick = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseModalOpen(true);
  };

  const getTotalStock = (product: Product) => {
    if (!product.plan || product.plan.length === 0) return 0;
    return product.plan.reduce((total, p) => total + (p.stock?.length || 0), 0);
  };

  const handlePurchaseSuccess = () => {
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
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-muted/50 border-border overflow-visible mt-5">
          <CardHeader>
            <CardTitle className="text-2xl">
                {categoryFilter}
            </CardTitle>

          </CardHeader>

          <CardContent>
            {products.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                {categoryFilter
                  ? "해당 카테고리에 등록된 상품이 없습니다."
                  : "등록된 상품이 없습니다."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-xl transition-shadow bg-muted border-border overflow-visible"
                  >
                    <div className="relative w-full h-48 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden rounded-t-2xl">
                    <Image
                        src={getProductImage(product.id)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(product.id)}
                        unoptimized
                      />
                    </div>

                    <CardContent className="p-6 overflow-visible">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-card-foreground">
                          {product.name}
                        </h3>
                        {getTotalStock(product) > 0 ? (
                          <span className="text-xs px-2 py-1 rounded bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">
                            재고 {getTotalStock(product)}개
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            품절
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {product.plan && product.plan.length > 0 && (
                        <div className="mb-4 relative overflow-visible">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === product.id ? null : product.id)
                            }
                            className="w-full bg-background text-foreground border border-input rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              {selectedPlans[product.id]
                                ? `${selectedPlans[product.id]}일 | ${
                                    product.plan.find(
                                      (p) => p.day === selectedPlans[product.id]
                                    )?.price.toLocaleString() ?? ""
                                  }원`
                                : `${product.plan[0].day}일 | ${product.plan[0].price.toLocaleString()}원`}
                            </span>
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                openDropdown === product.id ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {openDropdown === product.id && (
                            <div className="absolute z-10 w-full mt-2 bg-card border border-white rounded-lg shadow-lg overflow-hidden">
                                {product.plan.map((plan, index) => (
                                    <button
                                    key={`${product.id}-${index}`}
                                    onClick={() => {
                                        handlePlanChange(product.id, plan.day);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors
                                        ${index !== product.plan.length - 1 ? "border-b border-white/50" : ""}
                                        ${selectedPlans[product.id] === plan.day ? "bg-accent text-accent-foreground" : ""}
                                    `}
                                    >
                                    {plan.day}일 | {plan.price.toLocaleString()}원
                                    </button>
                                ))}
                            </div>

                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={() => router.push(`/products/${product.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                          소개
                        </Button>
                        <Button
                          onClick={() => handlePurchaseClick(product)}
                          disabled={Number(product.status) === 0 || getTotalStock(product) === 0}
                          className={`flex-1 font-medium text-white 
                            ${Number(product.status) === 0 || getTotalStock(product) === 0
                              ? "bg-red-600 disabled:hover:bg-red-600 hover:bg-red-700 opacity-50 cursor-not-allowed"
                              : "bg-teal-600 hover:bg-teal-700"}
                          `}
                        >
                          {Number(product.status) === 0 || getTotalStock(product) === 0 ? "품절" : "구매"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        product={selectedProduct}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </main>
  );
}
