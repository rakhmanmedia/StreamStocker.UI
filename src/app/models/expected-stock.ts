import { Guid } from "guid-typescript";
import { IContainer } from "./container";

export interface IExpectedStock{
    id: Guid;
    stockId: Guid;
    container: IContainer,
    state: number,
    status: number,
    applicationDate: Date
}