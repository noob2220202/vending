"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  count: number;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const sex = async () => {
      try {
        const noticesRes = await fetch('/api/announcements?limit=5');
        if (noticesRes.ok) {
          const noticesData = await noticesRes.json();
          setNotices(noticesData);
        }

        const productsRes = await fetch('/api/stats/top-products?limit=5');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setTopProducts(productsData);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    sex();
  }, []);

  return (
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        <Card className="bg-gradient-to-r bg-gray-800/50 border-gray-700 text-white mt-5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">핵스팟에 오신 것을 환영합니다</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              대충 소개 작성하는곳임.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm opacity-90">등록된 상품</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">5000+</div>
                <div className="text-sm opacity-90">누적 구매</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-90">고객 지원</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/20">
              <a
                href="https://discord.gg/exe-cheat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="font-medium">디스코드</span>
              </a>
              <a
                href="https://t.me/exe-cheater"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0088CC] hover:bg-[#006BA1] px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="font-medium">텔레그램</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">공지사항</CardTitle>
                <Link href="/announcements" className="text-sm text-gray-400 hover:text-white transition-colors">
                  더보기
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : notices.length === 0 ? (
                <div className="text-center text-gray-400 py-8">공지사항이 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer"
                      onClick={() => router.push(`/announcements/${notice.id}`)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {notice.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(notice.created_at).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </div>
                      </div>
                      <div className="text-gray-400">›</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">구매 제품 순위</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : topProducts.length === 0 ? (
                <div className="text-center text-gray-400 py-8">구매 내역이 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-orange-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {product.category}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-400">
                        {product.count}회
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

