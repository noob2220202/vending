export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    plan: plan[];
    specification: string;
    status: string;
}

export interface plan {
    day: string;
    price: number;
    stock: string[];
}



export interface user {
    id: string;
    money: number;
    used_money: number;
    role: string;
    lastip: string;
    phone: string;
    birth: string;
    email: string;
}

export interface BuyLog {
    id: number;
    user_id: string;
    product_id: number;
    product_name: string;
    plan_day: string;
    amount: number;
    price: number;
    code: string;
    created_at: string;
}

export interface ChargeLog {
    id: number;
    user_id: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
}