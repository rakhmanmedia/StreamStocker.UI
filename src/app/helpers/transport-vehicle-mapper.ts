import { TransportVehicleCreate } from "../models/transport-vehicle-create";
import { TransportVehicleRead } from "../models/transport-vehicle-read";

export function mapToTransportVehicleCreate(transportVehicleRead: TransportVehicleRead): TransportVehicleCreate {
    return {
        number: transportVehicleRead.number
    }
}