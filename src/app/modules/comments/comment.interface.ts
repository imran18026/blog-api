export type ICommentCreateData = {
    text: string;
    postId: string;
    parentCommentId?: string;
}

export type ICommentUpdateData = {
    text?: string;
}

export type ICommentFilterRequest = {
    searchTerm?: string | undefined;
    postId?: string;
    parentCommentId?: string;
}
