import { get } from "@/api/post/use-client";

export const getDictData = (type: string) => get('/api/app-api/system/dict-data/type', { type })
