export interface TodoistEvent {
    id: string
    assigner_id: any
    assignee_id: any
    project_id: string
    section_id: any
    parent_id: any
    order: number
    content: string
    description: string
    is_completed: boolean
    labels: string[]
    priority: number
    comment_count: number
    creator_id: string
    created_at: string
    due: Due
    url: string
    duration: Duration
}

export interface Due {
    date: string
    timezone: string
    string: string
    lang: string
    is_recurring: boolean
    datetime: string
}

export interface Duration {
    amount: number
    unit: string
}
