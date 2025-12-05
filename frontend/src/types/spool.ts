import type { ColorNested } from './color'
import type { BrandNested } from './brand'
import type { MaterialNested } from './material'

// Nested types for new lookup tables
export interface TradeNameNested {
    id: string
    name: string
}

export interface CategoryNested {
    id: string
    name: string
}

// Create schema (what user sends to create a spool catalog entry)
export interface SpoolCreate {
    barcode?: string // Optional - backend will auto-generate if not provided
    base_weight: number // Standard weight when full (e.g., 1000g)
    is_box?: boolean
    thickness?: number | null
    spool_return?: boolean

    // Lookup table data (names, not IDs!)
    color_name: string
    color_hex_code?: string
    brand_name: string
    material_name: string
    trade_name?: string | null
    category_name?: string | null
}

// Response schema (spool catalog entry from API)
export interface Spool {
    id: string
    barcode: string
    base_weight: number
    is_box: boolean
    thickness: number | null
    spool_return: boolean

    // Nested relationships (full objects, not just IDs!)
    color: ColorNested
    brand: BrandNested
    material: MaterialNested
    trade_name: TradeNameNested | null
    category: CategoryNested | null

    created_at: string
    updated_at: string
}

// Update schema (optional fields for PATCH)
export interface SpoolUpdate {
    barcode?: string
    base_weight?: number
    is_box?: boolean
    thickness?: number | null
    spool_return?: boolean
    color_name?: string
    color_hex_code?: string
    brand_name?: string
    material_name?: string
    trade_name?: string | null
    category_name?: string | null
}
