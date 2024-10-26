import { Guid } from "guid-typescript";

export interface ITypeContainer {
    id: Guid
    name: string;
    description: string;
}