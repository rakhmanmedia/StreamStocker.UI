import { Guid } from "guid-typescript";
import { Container } from "./container";
import { Docs } from "./document";
import { SessionContainerState } from "./session-container-state";

export class SessionContainer {
    id: Guid;
    containerId: Guid;
    container: Container;
    documents: Docs[];
    currentSessionContainerState: SessionContainerState;
}