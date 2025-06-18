import { Guid } from "guid-typescript";
import { SessionContainer } from "./session-container";

export class SessionContainerDocument {
    id: Guid;
    containerId: Guid;
    sessionContainer: SessionContainer;
    documentId: Guid;
    document: Document;
}