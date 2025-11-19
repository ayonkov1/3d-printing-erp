import type { ColorNested } from './color'
import type { BrandNested } from './brand'
import type { MaterialNested } from './material'

export type SpoolStatus = 'in_stock' | 'in_use' | 'depleted' | 'ordered'

// Create schema (what user sends)
export interface SpoolCreate {
    barcode: string
    quantity?: number
    is_box?: boolean
    weight: number
    thickness?: number | null
    spool_return?: boolean
    status?: SpoolStatus
    custom_properties?: string | null

    // Lookup table data (names, not IDs!)
    color_name: string
    color_hex_code?: string
    brand_name: string
    material_name: string
}

// Response schema (what API returns)
export interface Spool {
    id: string
    barcode: string
    quantity: number
    is_box: boolean
    weight: number
    thickness: number | null
    spool_return: boolean
    is_in_use: boolean
    status: SpoolStatus
    custom_properties: string | null

    // Nested relationships (full objects, not just IDs!)
    color: ColorNested
    brand: BrandNested
    material: MaterialNested

    created_at: string
    updated_at: string
}

// Update schema (optional fields for PATCH)
export interface SpoolUpdate {
    barcode?: string
    quantity?: number
    is_box?: boolean
    weight?: number
    thickness?: number | null
    spool_return?: boolean
    status?: SpoolStatus
    custom_properties?: string | null
    color_name?: string
    color_hex_code?: string
    brand_name?: string
    material_name?: string
}
