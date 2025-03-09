export interface ImageInfo {
    id: number
    model: string
    arrayBuffer: ArrayBuffer
    prompt: string
    date: Date
    taskId: string
    style: string
    shareId?: string
}