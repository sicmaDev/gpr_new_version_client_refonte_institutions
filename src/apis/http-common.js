import axios from "axios";
import {HOST} from "../Utils/globals";
export default axios.create({
    baseURL: HOST+"api/v1/",
    headers: {
        "Content-type": "application/json"
    }
});