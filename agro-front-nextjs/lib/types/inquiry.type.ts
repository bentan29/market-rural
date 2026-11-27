type Page<T> = { items: T[]; total: number; page: number; totalPages: number }

export type SentInquiry = {
    id: string
    message: string
    createdAt: string
    listing: { title: string; slug: string; status: string }
    seller: { displayName: string; slug: string }
}

export type ReceivedInquiry = {
    id: string
    name: string
    email: string
    phone: string | null
    message: string
    createdAt: string
    readAt: string | null
    listing: { title: string; slug: string }
}

export type SentPage = Page<SentInquiry>
export type ReceivedPage = Page<ReceivedInquiry> & { unread: number }