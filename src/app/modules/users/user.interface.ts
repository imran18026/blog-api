export type IUserCreateData = {
    email: string;
    password: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
}

export type IUserUpdateData = {
    email?: string;
    password?: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
}

export type IUserFilterRequest = {
    searchTerm?: string | undefined;
    email?: string;
    role?: 'ADMIN' | 'USER';
}
