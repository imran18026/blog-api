export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
    };
}

export interface IRefreshTokenRequest {
    refreshToken: string;
}

export interface IRefreshTokenResponse {
    accessToken: string;
}
