import { Guid } from "guid-typescript";
import { SessionContainer } from "./session-container";
import { TransportVehicleRead } from "./transport-vehicle-read";
import { DriverRead } from "./driver-read";

export class EmptyContainerRead {
    id: Guid;
    sessionContainerId: Guid;
    sessionContainer: SessionContainer;
    stockId: Guid;
    receiptActTerminalIn: string | null;
    acceptanceDate: string | null;
    acceptanceTime: string | null;
    transportVehicleId: string | null;
    transportVehicle: TransportVehicleRead | null;
    driverId: string | null;
    driver: DriverRead | null;
}