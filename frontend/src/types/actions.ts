import React from 'react'

export type ActionType = 'use' | 'topup' | 'addnew' | 'remove' | 'data'

export interface ActionButton {
    id: ActionType
    label: string
    icon: React.ReactNode
    color: string
    bgColor: string
    disabled?: boolean
}
