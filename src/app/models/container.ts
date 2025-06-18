import { Guid } from "guid-typescript";
import { StateContainerEnum } from "./state-container-enum";

export class Container {
    id: Guid;
    number: string;
    typeContainerName: string;
    buildingYear: number;
    tareWeight: number;
    payload: number;
    /* currentStatusName: string;
    currentStateName: string;
    stateContainerEnum: StateContainerEnum;
    isCompetedStatus:boolean */
}