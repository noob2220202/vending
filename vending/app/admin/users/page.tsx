"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, User, Mail, Phone, CreditCard, TrendingUp, MapPin, Calendar, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/users').then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      setUsers(j.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      String(u.id).toLowerCase().includes(q) ||
      String(u.name).toLowerCase().includes(q) ||
      String(u.role).toLowerCase().includes(q) ||
      String(u.phone).toLowerCase().includes(q) ||
      String(u.email).toLowerCase().includes(q)
    );
  }, [users, query]);

  const totalBalance = users.reduce((sum, u) => sum + (Number(u.money) || 0), 0);
  const totalUsed = users.reduce((sum, u) => sum + (Number(u.used_money) || 0), 0);

  return (
    <main className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600" />
            <span className="text-center sm:text-left">유저 관리</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
            회원 정보와 통계를 확인합니다
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">전체 회원</p>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{users.length.toLocaleString()}명</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">총 잔액</p>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{totalBalance.toLocaleString()}원</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">총 사용금액</p>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{totalUsed.toLocaleString()}원</h3>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>회원 목록</CardTitle>
                <CardDescription>전체 {filteredUsers.length}명의 회원</CardDescription>
              </div>
            </div>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ID, 이름, 역할, 전화번호, 이메일로 검색..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2">
                      <th className="py-3 px-4 text-center font-semibold">ID</th>
                      <th className="py-3 px-4 text-center font-semibold">PW</th>
                      <th className="py-3 px-4 text-center font-semibold">역할</th>
                      <th className="py-3 px-4 text-center font-semibold">잔액</th>
                      <th className="py-3 px-4 text-center font-semibold">사용금액</th>
                      <th className="py-3 px-4 text-center font-semibold">마지막 IP</th>
                      <th className="py-3 px-4 text-center font-semibold">이름</th>
                      <th className="py-3 px-4 text-center font-semibold">전화</th>
                      <th className="py-3 px-4 text-center font-semibold">통신사</th>
                      <th className="py-3 px-4 text-center font-semibold">생년월일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <span className="font-medium">{u.id}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">{u.password || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-green-600" />
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {(u.money || 0).toLocaleString()}원
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {(u.used_money || 0).toLocaleString()}원
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-mono text-xs">{u.lastip || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{u.name || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{u.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{u.isp || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{u.birth || '-'}</span>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {query ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
