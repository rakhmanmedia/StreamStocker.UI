import { Guid } from "guid-typescript";
import { TypeContainer } from "./typeContainer";
import { ContainerState } from "./container-state";

export class Container {
    id: Guid;
    number: string;
    typeContainerId: Guid;
    typeContainer: TypeContainer;
    containerStates: ContainerState[];
    currentStateId: Guid;
    currentState: ContainerState;
}