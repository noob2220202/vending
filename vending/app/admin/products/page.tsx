"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Search, Edit2, Trash2, Loader2, Tag, DollarSign, Layers, FileText, Upload, Download, Image as ImageIcon, FolderArchive, CheckCircle, XCircle } from 'lucide-react';

type PlanRow = { day: string; price: number | string; stockText: string };

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  specification: string;
  status: string;
  plan: Array<{ day: string; price: number; stock: string[] }>;
  hasFile?: boolean;
  hasImage?: boolean;
  fileSize?: number;
};

type Category = { id: number; name: string };

export default function AdminProductsPage() {
  const [list, setList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  const [form, setForm] = useState<any>({ name: '', price: 0, category: '', description: '' });
  const [formSpec, setFormSpec] = useState('');
  const [formPlans, setFormPlans] = useState<PlanRow[]>([{ day: '', price: '', stockText: '' }]);

  const [query, setQuery] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);
  const [editPlans, setEditPlans] = useState<PlanRow[]>([]);

  const load = async () => {
    const [pr, cr] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/categories')
    ]);
    if (pr.ok) {
      const j = await pr.json();
      setList(j.data || []);
    }
    if (cr.ok) {
      const j = await cr.json();
      setCategories(j.data || j || []);
      setForm((prev: any) => ({ ...prev, category: (j.data?.[0]?.name ?? j?.[0]?.name ?? '') }));
    }
  };
  useEffect(() => { load(); }, []);

  const planRowsToPlan = (rows: PlanRow[]) => rows.map((r) => ({ day: String(r.day), price: Number(r.price || 0), stock: splitLines(r.stockText) }));

  const add = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
    const plan = planRowsToPlan(formPlans);
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        plan,
        specification: formSpec,
        status: '1'
      })
    });
    setForm({ name: '', price: 0, category: categories[0]?.name ?? '', description: '' });
    setFormSpec('');
    setFormPlans([{ day: '', price: '', stockText: '' }]);
    await load();
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (p: Product) => {
    setEdit(p);
    setEditPlans((p.plan || []).map((it) => ({ day: String(it.day), price: it.price, stockText: (it.stock || []).join('\n') })));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!edit) return;
    const plan = planRowsToPlan(editPlans);
    await fetch(`/api/admin/products/${edit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: edit.name,
        price: Number(edit.price),
        description: edit.description,
        category: edit.category,
        specification: edit.specification,
        plan,
        status: edit.status
      })
    });
    setEditOpen(false);
    setEdit(null);
    await load();
  };

  const removeItem = async (id: number) => {
    if (!confirm('이 제품을 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await load();
  };

  const handleFileUpload = async (productId: number, file: File) => {
    setUploadingFile(productId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', String(productId));

      const res = await fetch('/api/admin/filebox', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await load();
        alert('ZIP 파일이 업로드되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '업로드 실패');
      }
    } finally {
      setUploadingFile(null);
    }
  };

  const handleFileDelete = async (productId: number) => {
    if (!confirm('이 제품의 ZIP 파일을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/filebox?productId=${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await load();
        alert('ZIP 파일이 삭제되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '삭제 실패');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleImageUpload = async (productId: number, file: File) => {
    setUploadingImage(productId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', String(productId));

      const res = await fetch('/api/admin/products/image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await load();
        alert('이미지가 업로드되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '이미지 업로드 실패');
      }
    } finally {
      setUploadingImage(null);
    }
  };

  const handleImageDelete = async (productId: number) => {
    if (!confirm('이 제품의 이미지를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/products/image?productId=${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await load();
        alert('이미지가 삭제되었습니다');
      } else {
        const error = await res.json();
        alert(error.error || '이미지 삭제 실패');
      }
    } catch (err) {
      alert('이미지 삭제 중 오류가 발생했습니다');
    }
  };

  const handleDownloadAllFiles = async () => {
    try {
      const res = await fetch('/api/admin/filebox?downloadAll=true');
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.files && data.files.length > 0) {
          for (const file of data.files) {
            const link = document.createElement('a');
            link.href = file.downloadUrl;
            link.download = file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          alert(`${data.files.length}개의 파일 다운로드가 시작되었습니다.`);
        } else {
          alert('다운로드할 파일이 없습니다.');
        }
      } else {
        const error = await res.json();
        alert(error.error || '파일 목록 조회 실패');
      }
    } catch (err) {
      alert('파일 다운로드 중 오류가 발생했습니다');
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) =>
      String(p.name).toLowerCase().includes(q) ||
      String(p.category).toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  }, [list, query]);

  return (
    <main className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600" />
            <span className="text-center sm:text-left">제품 관리</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
            상품 정보, 플랜, 파일, 이미지를 관리합니다
          </p>
        </div>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">새 제품 추가</CardTitle>
                <CardDescription className="text-xs sm:text-sm">새로운 상품을 등록합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  제품명 <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="제품 이름을 입력하세요" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  기본 가격
                </label>
                <Input 
                  placeholder="0" 
                  type="number" 
                  value={form.price} 
                  onChange={(e) => setForm({ ...form, price: e.target.value })} 
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  카테고리
                </label>
                <select
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  간단 설명
                </label>
                <Input 
                  placeholder="제품에 대한 간단한 설명" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">상세 설명</label>
              <textarea
                placeholder="제품 상세 설명을 입력하세요"
                value={formSpec}
                onChange={(e) => setFormSpec(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">플랜 설정</label>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setFormPlans((prev) => [...prev, { day: '', price: '', stockText: '' }])}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  플랜 추가
                </Button>
              </div>
              <div className="space-y-3">
                {formPlans.map((row, idx) => (
                  <div key={idx} className="border-2 rounded-lg p-4 bg-muted/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input 
                        placeholder="일수 (예: 30일)" 
                        value={row.day} 
                        onChange={(e) => updatePlanRow(setFormPlans, idx, { day: e.target.value })} 
                        className="h-10"
                      />
                      <Input 
                        placeholder="가격 (원)" 
                        type="number" 
                        value={row.price} 
                        onChange={(e) => updatePlanRow(setFormPlans, idx, { price: e.target.value })} 
                        className="h-10"
                      />
                    </div>
                    <textarea
                      placeholder="재고 코드 (한 줄당 1개)"
                      value={row.stockText}
                      onChange={(e) => updatePlanRow(setFormPlans, idx, { stockText: e.target.value })}
                      className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                    {formPlans.length > 1 && (
                      <div className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removePlanRow(setFormPlans, idx)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={add} 
              disabled={loading || !form.name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  제품 추가
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg">제품 목록</CardTitle>
                <CardDescription className="text-xs sm:text-sm">전체 {filtered.length}개의 제품</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadAllFiles}
                className="gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 text-xs sm:text-sm"
                size="sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">모든 파일 다운로드</span>
                <span className="sm:hidden">전체 다운로드</span>
              </Button>
            </div>
            <div className="pt-3 sm:pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ID, 제품명, 카테고리로 검색..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 sm:h-11 pl-10 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
                  {filtered.map((p) => (
                <Card key={p.id} className="border-2 hover:border-teal-500/50 transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                            <img 
                              src={p.hasImage ? `/products/${p.id}.png` : '/default-product.png'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-product.png';
                              }}
                            />
                            <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-bl-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {p.id}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-base sm:text-lg">{p.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                                {p.category}
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {(p.price || 0).toLocaleString()}원
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                p.status === '1' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                              }`}>
                                {p.status === '1' ? '활성' : '비활성'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pl-0 sm:pl-[5.5rem]">
                          <div className="flex items-center gap-2">
                            {p.hasFile ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  ZIP 파일 {p.fileSize && `(${(p.fileSize / 1024 / 1024).toFixed(2)}MB)`}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                <span className="text-sm text-orange-600 dark:text-orange-400">
                                  ZIP 파일 없음
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {p.hasImage ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                  이미지 업로드됨
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  기본 이미지
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-col gap-2 w-full sm:min-w-[180px]">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEdit(p)}
                          className="w-full gap-2 text-xs sm:text-sm"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">제품 정보 수정</span>
                          <span className="sm:hidden">정보 수정</span>
                        </Button>

                        <div className="space-y-1">
                          {uploadingFile === p.id ? (
                            <Button disabled size="sm" className="w-full gap-2 text-xs">
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              업로드 중...
                            </Button>
                          ) : (
                            <>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept=".zip"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.name.endsWith('.zip')) {
                                        alert('ZIP 파일만 업로드 가능합니다');
                                        return;
                                      }
                                      handleFileUpload(p.id, file);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                <Button 
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="w-full gap-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-xs sm:text-sm"
                                  asChild
                                >
                                  <span>
                                    <FolderArchive className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{p.hasFile ? 'ZIP 교체' : 'ZIP 업로드'}</span>
                                    <span className="sm:hidden">{p.hasFile ? '교체' : '업로드'}</span>
                                  </span>
                                </Button>
                              </label>
                              {p.hasFile && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-1 text-xs"
                                    onClick={() => window.open(`/api/admin/filebox?action=download&productId=${p.id}`, '_blank')}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span className="hidden sm:inline">다운</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-1 text-xs"
                                    onClick={() => handleFileDelete(p.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span className="hidden sm:inline">삭제</span>
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="space-y-1">
                          {uploadingImage === p.id ? (
                            <Button disabled size="sm" className="w-full gap-2 text-xs">
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              업로드 중...
                            </Button>
                          ) : (
                            <>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/png"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.type.includes('png')) {
                                        alert('PNG 이미지만 업로드 가능합니다');
                                        return;
                                      }
                                      handleImageUpload(p.id, file);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                <Button 
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="w-full gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs sm:text-sm"
                                  asChild
                                >
                                  <span>
                                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{p.hasImage ? '이미지 교체' : '이미지 업로드'}</span>
                                    <span className="sm:hidden">{p.hasImage ? '교체' : '업로드'}</span>
                                  </span>
                                </Button>
                              </label>
                              {p.hasImage && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full gap-1 text-xs sm:text-sm"
                                  onClick={() => handleImageDelete(p.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="hidden sm:inline">이미지 삭제</span>
                                  <span className="sm:hidden">삭제</span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        {/* 제품 삭제 버튼 */}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeItem(p.id)}
                          className="w-full gap-2 text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">제품 삭제</span>
                          <span className="sm:hidden">삭제</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

                  {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {query ? '검색 결과가 없습니다.' : '등록된 제품이 없습니다. 새로운 제품을 추가해보세요.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              제품 정보 수정
            </DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">제품명</label>
                  <Input 
                    value={edit.name} 
                    onChange={(e) => setEdit({ ...edit, name: e.target.value } as Product)} 
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">가격</label>
                  <Input 
                    type="number" 
                    value={edit.price} 
                    onChange={(e) => setEdit({ ...edit, price: e.target.value as any } as Product)} 
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">카테고리</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={edit.category}
                    onChange={(e) => setEdit({ ...edit, category: e.target.value } as Product)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">간단 설명</label>
                  <Input 
                    value={edit.description} 
                    onChange={(e) => setEdit({ ...edit, description: e.target.value } as Product)} 
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">상세 설명</label>
              <textarea
                value={edit.specification}
                onChange={(e) => setEdit({ ...edit, specification: e.target.value } as Product)}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              </div>

              <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">플랜 설정</label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditPlans((prev) => [...prev, { day: '', price: '', stockText: '' }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    플랜 추가
                  </Button>
              </div>
              <div className="space-y-2">
                {editPlans.map((row, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input 
                          placeholder="일수" 
                          value={row.day} 
                          onChange={(e) => updatePlanRow(setEditPlans, idx, { day: e.target.value })} 
                          className="h-9"
                        />
                        <Input 
                          placeholder="가격" 
                          type="number" 
                          value={row.price} 
                          onChange={(e) => updatePlanRow(setEditPlans, idx, { price: e.target.value })} 
                          className="h-9"
                        />
                      </div>
                      <textarea
                        placeholder="재고(한 줄당 1개 코드)"
                        value={row.stockText}
                        onChange={(e) => updatePlanRow(setEditPlans, idx, { stockText: e.target.value })}
                        className="w-full min-h-[50px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      />
                      <div className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removePlanRow(setEditPlans, idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          삭제
                        </Button>
                    </div>
                    </div>
                  ))}
                  </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>취소</Button>
            <Button 
              onClick={saveEdit}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function splitLines(text: string): string[] {
  return (text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function updatePlanRow(setter: (fn: any) => void, index: number, partial: Partial<PlanRow>) {
  setter((prev: PlanRow[]) => prev.map((r, i) => (i === index ? { ...r, ...partial } : r)));
}

function removePlanRow(setter: (fn: any) => void, index: number) {
  setter((prev: PlanRow[]) => prev.filter((_, i) => i !== index));
}
