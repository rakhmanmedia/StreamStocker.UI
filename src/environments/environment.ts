import { HttpHeaders } from "@angular/common/http";
import { ACCESS_TOKEN_KEY } from "../app/services/auth.service";

export const environment = {
    stockerApi: 'https://localhost:7164',
    whiteListedDomains: ['https://localhost:7164'],
    stokerAuthHeaderOpt : { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_KEY) }) }
};
