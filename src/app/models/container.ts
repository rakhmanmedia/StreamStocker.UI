import { Guid } from "guid-typescript";
import { TypeContainer } from "./typeContainer";
import { ContainerState } from "./container-state";
import { ContainerDocument } from "./container-document";

export class Container {
    id: Guid;
    number: string;
    isValidControlDigit: boolean;
    typeContainerId: Guid;
    typeContainer: TypeContainer;
    containerStates: ContainerState[];
    currentStateId: Guid;
    currentState: ContainerState;
    containerDocuments: ContainerDocument[];
}