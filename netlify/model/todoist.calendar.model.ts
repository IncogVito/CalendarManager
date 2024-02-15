export interface TodoistEvent {
    id: string
    assignerId?: any
    assigneeId?: any
    projectId?: string
    sectionId?: any
    parentId?: any
    order: number
    content: string
    description: string
    isCompleted: boolean
    labels: string[]
    priority: number
    commentCount: number
    creatorId: string
    createdAt: string
    due?: Due
    url: string
    duration?: Duration
}

export interface Due {
    date: string
    timezone?: string
    string: string
    lang?: string
    isRecurring: boolean
    datetime?: string
}

export interface Duration {
    amount: number
    unit: string
}
