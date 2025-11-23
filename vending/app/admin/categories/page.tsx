"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderTree, Plus, Search, Edit2, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (res.ok) setCategories(json.data || json);
  };

  useEffect(() => { load(); }, []);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '추가 실패');
      }
      setNewName('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName.trim() })
    });
    setEditingId(null);
    setEditingName('');
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    await load();
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((c) => String(c.name).toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-teal-600" />
            카테고리 관리
          </h1>
          <p className="text-muted-foreground">상품 카테고리를 추가, 수정, 삭제합니다</p>
        </div>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle>새 카테고리 추가</CardTitle>
                <CardDescription>새로운 상품 카테고리를 생성합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input 
                placeholder="카테고리명을 입력하세요" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                className="h-11 flex-1"
                disabled={loading}
              />
              <Button 
                onClick={addCategory} 
                disabled={loading || !newName.trim()} 
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    추가 중
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    추가
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>카테고리 목록</CardTitle>
                <CardDescription>전체 {categories.length}개의 카테고리</CardDescription>
              </div>
            </div>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="카테고리 검색..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.map((c, idx) => (
                <div 
                  key={c.id} 
                  className="group flex items-center justify-between border-2 rounded-lg px-4 py-3 gap-3 hover:border-teal-500/50 hover:bg-muted/30 transition-all"
                >
                  {editingId === c.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(c.id)}
                        className="h-10"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveEdit(c.id)} className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Check className="w-4 h-4 mr-1" />
                        저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-1" />
                        취소
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-base">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(c)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => remove(c.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <FolderTree className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {query ? '검색 결과가 없습니다.' : '카테고리가 없습니다. 새로운 카테고리를 추가해보세요.'}
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
