import { Guid } from "guid-typescript";
import { ContainerCreate } from "./container-create";
import { SessionContainerCreate } from "./session-container-create";

export class ExpectedContainerCreate {
    stockId: Guid;
    sessionContainer: SessionContainerCreate = new SessionContainerCreate();
    applicationDate: string = new Date().toISOString().slice(0, 10);
}