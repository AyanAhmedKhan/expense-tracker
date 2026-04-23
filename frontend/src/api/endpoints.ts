import client from './client';

const asArray = <T,>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value : [];

// ──────────────────────────────────────
// TYPES
// ──────────────────────────────────────

export interface CategoryOut {
    id: number;
    name: string;
    color: string;
    icon: string;
}

export interface Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    source: string;
    status: 'PENDING' | 'PARTIAL' | 'REIMBURSED';
    reimbursed_amount: number;
    transaction_hash: string;
    category_id: number | null;
    is_recurring: boolean;
    category: CategoryOut | null;
    created_at?: string;
}

export interface PaginatedExpenses {
    items: Expense[];
    total: number;
    page: number;
    pages: number;
    per_page: number;
}

export interface Reimbursement {
    id: number;
    date: string;
    amount: number;
    note: string;
}

export interface ReimbursedItem {
    id: number;
    date: string;
    description: string;
    amount: number;
    applied: number;
    source: string;
}

export interface UploadSummary {
    uploaded: number;
    existing: number;
    new_added: number;
    auto_tagged?: number;
}

export interface Summary {
    total_spent: number;
    total_reimbursed: number;
    total_pending: number;
    last_reimbursement_date: string | null;
}

export interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
    created_at: string;
}

export interface AutoTagRule {
    id: number;
    keyword: string;
    category_id: number;
    category: CategoryOut | null;
    created_at: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    google_id: string | null;
    created_at: string;
}

// ──────────────────────────────────────
// STATEMENTS
// ──────────────────────────────────────

export const uploadStatement = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post<UploadSummary>('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ──────────────────────────────────────
// EXPENSES
// ──────────────────────────────────────

export interface ExpenseFilters {
    page?: number;
    per_page?: number;
    q?: string;
    status?: 'PENDING' | 'PARTIAL' | 'REIMBURSED';
    source?: string;
    min_amount?: number;
    max_amount?: number;
    from_date?: string;
    to_date?: string;
    sort_by?: 'date' | 'amount' | 'created_at' | 'description';
    order?: 'asc' | 'desc';
    category_id?: number;
    is_recurring?: boolean;
}

export const getExpenses = async (params?: ExpenseFilters) => {
    const response = await client.get<PaginatedExpenses>('/expenses/', { params });
    return {
        ...response.data,
        items: asArray(response.data?.items),
    };
};

export const updateExpense = async (id: number, data: {
    description?: string;
    amount?: number;
    date?: string;
    category_id?: number | null;
    is_recurring?: boolean;
}) => {
    const response = await client.put<Expense>(`/expenses/${id}`, data);
    return response.data;
};

export const deleteExpense = async (id: number) => {
    const response = await client.delete(`/expenses/${id}`);
    return response.data;
};

export const bulkDeleteExpenses = async (expenseIds: number[]) => {
    const response = await client.post('/expenses/bulk-delete', { expense_ids: expenseIds });
    return response.data;
};

export const deleteAllExpenses = async () => {
    const response = await client.delete('/expenses/all');
    return response.data;
};

export const exportExpensesCSV = async (params?: ExpenseFilters) => {
    const response = await client.get('/expenses/export', {
        params,
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const detectRecurringExpenses = async () => {
    const response = await client.post('/expenses/detect-recurring');
    return response.data;
};

export const applyAutoTags = async () => {
    const response = await client.post('/expenses/apply-auto-tags');
    return response.data;
};

// ──────────────────────────────────────
// REIMBURSEMENTS
// ──────────────────────────────────────

export const createReimbursement = async (expenseIds: number[], note?: string) => {
    const response = await client.post<Reimbursement>('/reimbursements/', {
        expense_ids: expenseIds,
        note,
    });
    return response.data;
};

export const getReimbursements = async () => {
    const response = await client.get<Reimbursement[]>('/reimbursements/');
    return asArray(response.data);
};

export const getReimbursementItems = async (reimbursementId: number) => {
    const response = await client.get<ReimbursedItem[]>(`/reimbursements/${reimbursementId}/items`);
    return asArray(response.data);
};

// ──────────────────────────────────────
// SUMMARY
// ──────────────────────────────────────

export const getSummary = async () => {
    const response = await client.get<Summary>('/summary/');
    return response.data;
};

// ──────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────

export const getCategories = async () => {
    const response = await client.get<Category[]>('/categories/');
    return asArray(response.data);
};

export const createCategory = async (data: { name: string; color?: string; icon?: string }) => {
    const response = await client.post<Category>('/categories/', data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await client.delete(`/categories/${id}`);
    return response.data;
};

// ──────────────────────────────────────
// AUTO-TAG RULES
// ──────────────────────────────────────

export const getAutoTagRules = async () => {
    const response = await client.get<AutoTagRule[]>('/categories/auto-tag-rules');
    return asArray(response.data);
};

export const createAutoTagRule = async (data: { keyword: string; category_id: number }) => {
    const response = await client.post<AutoTagRule>('/categories/auto-tag-rules', data);
    return response.data;
};

export const deleteAutoTagRule = async (id: number) => {
    const response = await client.delete(`/categories/auto-tag-rules/${id}`);
    return response.data;
};

// ──────────────────────────────────────
// AUTH & PROFILE
// ──────────────────────────────────────

export const getMe = async () => {
    const response = await client.get<UserProfile>('/auth/me');
    return response.data;
};

export const updateProfile = async (data: { name?: string }) => {
    const response = await client.put<UserProfile>('/auth/profile', data);
    return response.data;
};

export const changePassword = async (data: { old_password: string; new_password: string }) => {
    const response = await client.put('/auth/password', data);
    return response.data;
};
