import type { Spool } from './spool'
import type { StatusNested } from './status'

// Create schema (what user sends to add a spool to inventory)
export interface InventoryCreate {
    spool_id: string // ID of the spool type from catalog
    weight?: number // Current weight. If not provided, uses spool's base_weight
    is_in_use?: boolean // Is it currently loaded in a printer?
    status_name?: string // Status name (e.g., in_stock, in_use, depleted, ordered)
    custom_properties?: string | null // Per-item notes/metadata
}

// Update schema (optional fields for PATCH)
export interface InventoryUpdate {
    weight?: number
    is_in_use?: boolean
    status_name?: string
    custom_properties?: string | null
}

// Response schema (what API returns)
export interface Inventory {
    id: string
    weight: number
    is_in_use: boolean
    custom_properties: string | null

    // Nested relationships
    spool: Spool
    status: StatusNested

    created_at: string
    updated_at: string
}

// Count response
export interface InventoryCount {
    spool_id: string
    count: number
}
