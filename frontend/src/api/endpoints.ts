import client from './client';

export interface Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    source: string;
    status: 'PENDING' | 'PARTIAL' | 'REIMBURSED';
    reimbursed_amount: number;
    transaction_hash: string;
    created_at?: string;
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
}

export interface Summary {
    total_spent: number;
    total_reimbursed: number;
    total_pending: number;
    last_reimbursement_date: string | null;
}

export const uploadStatement = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post<UploadSummary>('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getExpenses = async (params?: {
    skip?: number;
    limit?: number;
    q?: string;
    status?: 'PENDING' | 'PARTIAL' | 'REIMBURSED';
    source?: string;
    min_amount?: number;
    max_amount?: number;
    from_date?: string; // YYYY-MM-DD
    to_date?: string;   // YYYY-MM-DD
    sort_by?: 'date' | 'amount' | 'created_at' | 'description';
    order?: 'asc' | 'desc';
}) => {
    const response = await client.get<Expense[]>('/expenses/', { params });
    return response.data;
};

export const createReimbursement = async (expenseIds: number[], note?: string) => {
    const response = await client.post<Reimbursement>('/reimbursements/', {
        expense_ids: expenseIds,
        note,
    });
    return response.data;
};

export const getReimbursements = async () => {
    const response = await client.get<Reimbursement[]>('/reimbursements/');
    return response.data;
};

export const getReimbursementItems = async (reimbursementId: number) => {
    const response = await client.get<ReimbursedItem[]>(`/reimbursements/${reimbursementId}/items`);
    return response.data;
};

export const getSummary = async () => {
    const response = await client.get<Summary>('/summary/');
    return response.data;
}
