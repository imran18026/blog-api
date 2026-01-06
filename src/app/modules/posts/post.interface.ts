export type IPostCreateData = {
    title: string;
    content?: string;
    published?: boolean;
    authorId: string;
}

export type IPostUpdateData = {
    title?: string;
    content?: string;
    published?: boolean;
}

export type IPostFilterRequest = {
    searchTerm?: string | undefined;
    title?: string;
    published?: boolean;
    authorId?: string;
}
