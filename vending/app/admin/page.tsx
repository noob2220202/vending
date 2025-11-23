"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree, Package, Users, Bell, TrendingUp, Activity, CreditCard } from 'lucide-react';

const menuCards = [
  {
    href: '/admin/categories',
    title: '카테고리 관리',
    description: '상품 카테고리를 추가, 수정, 삭제할 수 있습니다',
    icon: FolderTree,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    href: '/admin/products',
    title: '제품 관리',
    description: '상품 정보, 플랜, 파일, 이미지를 관리할 수 있습니다',
    icon: Package,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    href: '/admin/users',
    title: '유저 관리',
    description: '회원 정보와 통계를 확인할 수 있습니다',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    href: '/admin/charges',
    title: '충전 승인',
    description: '사용자의 충전 요청을 승인하거나 거부할 수 있습니다',
    icon: CreditCard,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  {
    href: '/admin/announcements',
    title: '공지 관리',
    description: '일반 공지 및 긴급 공지를 작성할 수 있습니다',
    icon: Bell,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
];

export default function AdminHome() {
  return (
    <main className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center sm:text-left">
            관리자 대시보드
          </h1>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-center sm:text-left">
            관리 메뉴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {menuCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <Card className="h-full hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-teal-500/50 group">
                    <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-md sm:rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-base sm:text-lg lg:text-xl group-hover:text-teal-600 transition-colors text-center sm:text-left">
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
