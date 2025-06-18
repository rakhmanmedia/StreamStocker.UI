import { Guid } from "guid-typescript";
import { StatusImportContainer } from "./status-import-container.enum";

export class ContainerCheckResponse {
    sessionContainerId: Guid;
    description: string;
    status: StatusImportContainer;
}