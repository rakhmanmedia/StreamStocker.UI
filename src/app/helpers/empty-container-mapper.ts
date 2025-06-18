import { EmptyContainerRead } from "../models/empty-container-read";
import { EmptyContainerUpdate } from "../models/empty-container-update";

export function mapToEmptyContainerUpdate(emptyContainerRead: EmptyContainerRead): EmptyContainerUpdate {
    console.log(emptyContainerRead.acceptanceDate);
    const time = new Date();
    time.setHours(12, 0, 0, 0);
    const formattedTime = time.toTimeString().slice(0, 8);
    return {
        id: emptyContainerRead.id.toString(),
        acceptanceDate: emptyContainerRead.acceptanceDate,
        acceptanceTime: emptyContainerRead.acceptanceTime ?? formattedTime,
        receiptActTerminalIn: emptyContainerRead.receiptActTerminalIn,
        payload: emptyContainerRead.sessionContainer.container.payload,
        tareWeight: emptyContainerRead.sessionContainer.container.tareWeight,
        buildingYear: emptyContainerRead.sessionContainer.container.buildingYear,
        transportVehicleId: emptyContainerRead.transportVehicleId,
        driverId: emptyContainerRead.driverId
    };
}