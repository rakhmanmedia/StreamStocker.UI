import { Guid } from "guid-typescript";
import { Container } from "./container";

export class ContainerDocument {
    id: Guid;
    containerId: Guid;
    container: Container;
    documentId: Guid;
    document: Document;
}