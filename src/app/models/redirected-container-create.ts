import { Guid } from "guid-typescript";
import { SessionContainerCreate } from "./session-container-create";

export class RedirectedContainerCreate {
    stockId: Guid;
    comments: string;
    redirectionDate: string = new Date().toISOString().slice(0, 10);
    sessionContainerId: Guid;
    sessionContainer: SessionContainerCreate;
}