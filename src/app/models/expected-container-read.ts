import { Guid } from "guid-typescript";
import { SessionContainer } from "./session-container";

export class ExpectedContainer {
    id: Guid;
    stockId: Guid;
    sessionContainer: SessionContainer;
    applicationDate: string = new Date().toISOString().slice(0, 10);
}