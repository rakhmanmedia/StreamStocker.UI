import { Guid } from "guid-typescript";
import { TypeContainer } from "./typeContainer";

export class Container {
    id: Guid;
    number: string;
    typeContainerId: Guid;
    typeContainer: TypeContainer;
}