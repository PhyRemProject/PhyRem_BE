import Physicians from "../schemas/PhysicianSchema";

//TODO : This class


export default class PhysicianController {

    constructor() {

    }


    public listUsers() {
        return new Promise((resolve, reject) => {
            Physicians.find((err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public listWithRole(searchRole: string) {
        return new Promise((resolve, reject) => {
            Physicians.find({ role: searchRole }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public profileInfo(username: string) {
        return new Promise((resolve, reject) => {
            Physicians.find({ username: username }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };

}