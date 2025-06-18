import { Guid } from "guid-typescript";
import { Container } from "./container";
import { SessionContainer } from "./session-container";

export class ExpectedStock{
    id: Guid;
    stockId: Guid;
    containerId: Guid;
    container: Container = new Container();
    state: number;
    status: number;
    applicationDate: string = new Date().toISOString().slice(0, 10);
    sessionContainerId: Guid;
    sessionContainer: SessionContainer;
}