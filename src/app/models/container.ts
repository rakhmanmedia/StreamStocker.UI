import { Guid } from "guid-typescript";
import { ITypeContainer } from "./typeContainer";

export interface IContainer {
    id: Guid;
    number: string;
    typeContainer: ITypeContainer
}