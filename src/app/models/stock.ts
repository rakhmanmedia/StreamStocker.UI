import { Guid } from "guid-typescript";
import { ILocation } from "./location";
import { IKeeper } from "./keeper";
import { IAgent } from "./agent";
import { IShipOwner } from "./ship-owner";

export interface IStock {
    id: Guid,
    location: ILocation,
    keeper: IKeeper,
    agent: IAgent,
    shipOwner: IShipOwner,
    emptyCntrsCount: number,
    loadedCntrsCount: number
}