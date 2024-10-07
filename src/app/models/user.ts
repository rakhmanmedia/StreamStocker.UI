import { Guid } from "guid-typescript";

export interface User {
    id: Guid;
    name: string;
    email: string;
}