import { Guid } from "guid-typescript";

export class ContainerState {
    id: Guid;
    containerId: Guid;
    stateContainer: string;
    datestamp: Date
}