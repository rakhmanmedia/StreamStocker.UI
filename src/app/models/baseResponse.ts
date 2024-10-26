export interface IBaseResponse<T> {
    description: string,
    statusCode: any,
    data: T
}