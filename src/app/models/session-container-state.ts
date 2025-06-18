import { Guid } from "guid-typescript";

export class SessionContainerState {
    id: Guid;
    statusContainerId: Guid;
    statusContainerName: string;
    isCompletedStatus: boolean
    stateContainer: string;
    stateContainerDescription: string;
    datestamp: string = new Date().toISOString().slice(0, 10);
}