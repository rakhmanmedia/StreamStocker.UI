import { DriverCreate } from "../models/driver-create";
import { DriverRead } from "../models/driver-read";

export function mapToDriverCreate(driver: DriverRead): DriverCreate {
    return {
        name: driver.name
    }
}