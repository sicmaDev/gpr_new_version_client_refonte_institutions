import axios from "axios";
import { HOST } from "../Utils/globals";
import { loadItemFromSessionStorage } from "../Utils/utils";

const SCHEDULED_REPORTS_API = HOST + "api/v1/config/scheduled-reports";

const config = () => ({
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + loadItemFromSessionStorage("token"),
    },
});

export const listScheduledReports = () => axios.get(SCHEDULED_REPORTS_API, config());

export const updateScheduledReport = (id, data) => axios.put(`${SCHEDULED_REPORTS_API}/${id}`, data, config());

export const testScheduledReport = (id, to) => axios.post(`${SCHEDULED_REPORTS_API}/${id}/test`, { to }, config());

export const updateScheduledReportsTimezone = (timezone) => axios.put(`${SCHEDULED_REPORTS_API}/timezone`, { timezone }, config());
