import { Guid } from "guid-typescript";

export interface IUser {
    id: Guid;
    name: string;
    email: string;
}