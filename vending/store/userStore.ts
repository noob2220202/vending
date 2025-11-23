import { create } from 'zustand';
import { user as UserType } from '@/types/types';

export interface UserData extends UserType {
  name?: string;
  username?: string;
  tag?: string;
}

export interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface Category {
  name: string;
}

interface UserStore {
  user: UserData | null;
  visitorStats: VisitorStats;
  categories: Category[];
  setUser: (user: UserData) => void;
  login: (id: string, password: string) => Promise<void>;
  updateBalance: (balance: number) => void;
  setVisitorStats: (stats: VisitorStats) => void;
  setCategories: (categories: Category[]) => void;
  fetchUser: () => Promise<void>;
  fetchVisitorStats: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  logout: () => void;
  isFetchingUser?: boolean;
  isFetchingVisitor?: boolean;
  isFetchingCategories?: boolean;
  userFetchedAt?: number | null;
  visitorFetchedAt?: number | null;
  categoriesFetchedAt?: number | null;
}

export const useUserStore = create<UserStore>()((set : any) => ({
  user: {
    id: "비회원",
    money: 0,
    used_money: 0,
    role: "비구매자",
    lastip: "",
    phone: "",
    birth: "",
    email: ""
  },
  visitorStats: {
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  },
  categories: [],

  isFetchingUser: false,
  isFetchingVisitor: false,
  isFetchingCategories: false,
  userFetchedAt: null,
  visitorFetchedAt: null,
  categoriesFetchedAt: null,
  setUser: (user: UserData) => set({ user }),
  login: async (id: string, password: string) => {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '로그인 실패');
      }
      set({ 
        user: {
          ...result.data,
          username: result.data.name + '님',
          tag: result.data.role
        }
      });
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },
  updateBalance: (balance: number) => set((state: UserStore) => ({
    user: state.user ? { ...state.user, money: balance } : null
  })),
  setVisitorStats: (stats: VisitorStats) => set({ visitorStats: stats }),
  setCategories: (categories: Category[]) => set({ categories }),
  
  fetchUser: async () => {
    try {
      const now = Date.now();
      const state = (useUserStore.getState() as UserStore);
      if (state.isFetchingUser) return;
      if (state.userFetchedAt && now - state.userFetchedAt < 3000) return;
      set({ isFetchingUser: true });
      const response = await fetch('/api/user');
      const result = await response.json();
      
      if (result.success) {
        set({ 
          user: {
            ...result.data,
            username: result.data.name + "님",
            tag: result.data.role
          }
        });
      }
      set({ userFetchedAt: Date.now() });
    } catch (error) {
      console.error('유저 정보 가져오기 실패:', error);
    }
    finally {
      set({ isFetchingUser: false });
    }
  },
  
  fetchVisitorStats: async () => {
    try {
      const now = Date.now();
      const state = (useUserStore.getState() as UserStore);
      if (state.isFetchingVisitor) return;
      if (state.visitorFetchedAt && now - state.visitorFetchedAt < 30000) return;
      set({ isFetchingVisitor: true });
      const response = await fetch('/api/visitor');
      const result = await response.json();
      
      if (result.success) {
        set({ visitorStats: result.data });
      }
      set({ visitorFetchedAt: Date.now() });
    } catch (error) {
      console.error('방문자 통계 가져오기 실패:', error);
    }
    finally {
      set({ isFetchingVisitor: false });
    }
  },
  
  fetchCategories: async () => {
    try {
      const now = Date.now();
      const state = (useUserStore.getState() as UserStore);
      if (state.isFetchingCategories) return;
      if (state.categoriesFetchedAt && now - state.categoriesFetchedAt < 30000) return;
      set({ isFetchingCategories: true });
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        set({ categories: result.data });
      }
      set({ categoriesFetchedAt: Date.now() });
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
    }
    finally {
      set({ isFetchingCategories: false });
    }
  },
  
  logout: () => {
    fetch('/api/user/logout', { method: 'POST' }).catch(() => {});
    set({ user: {
      id: "비회원",
      money: 0,
      used_money: 0,
      role: "비구매자",
      lastip: "",
      phone: "",
      birth: "",
      email: "",
      username: undefined,
      tag: undefined
    } as any });
  }
}));

