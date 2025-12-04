// Status types for inventory status lookup table
export interface Status {
    id: string
    name: string
    created_at: string
    updated_at: string
}

export interface StatusCreate {
    name: string
}

export interface StatusNested {
    id: string
    name: string
}

// Common status values
export type StatusName = 'in_stock' | 'in_use' | 'depleted' | 'ordered' | string
