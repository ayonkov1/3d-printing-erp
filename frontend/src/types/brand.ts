// Base types
export interface Brand {
    id: string
    name: string
    created_at: string
    updated_at: string
}

export interface BrandCreate {
    name: string
}

export interface BrandNested {
    id: string
    name: string
}
