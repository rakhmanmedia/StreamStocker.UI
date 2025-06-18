import { Guid } from "guid-typescript";
import { ContainerStateCreate } from "./container-state-create";

export class ContainerCreate  {
    id: Guid;
    number: string;
    typeContainerId: Guid;
    currentStateId: Guid;
    currentState: ContainerStateCreate;
    containerStates: ContainerStateCreate[];
}