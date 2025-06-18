import { Guid } from "guid-typescript";
import { ILocation } from "./location";
import { IKeeper } from "./keeper";
import { IAgent } from "./agent";
import { IShipOwner } from "./ship-owner";
import { EmptyContainerCount } from "./empty-container-count";

export class Stock {
    id: Guid;
    location: ILocation;
    keeper: IKeeper;
    agent: IAgent;
    shipOwner: IShipOwner;
    emptyCntrsCount: number = 0;
    loadedCntrsCount: number = 0;
    emptyContainersCount: EmptyContainerCount;
}