import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }
  url = environment.serverUrl;


/*  getData(key = 'opt') {
    return this
      .http
      .get<any>(`${this.url}/${key}`)
      .pipe(map(ddd => {
        console.log(ddd);
        return ddd;
      }));
  }*/
  sendData(key = 'opt', sendObject = {}) {
    const options = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
    };
    return this
      .http
      .post<any>(`${this.url}/${key}`, sendObject, options)
      .pipe(map(ddd => {
        console.log(ddd);
        return ddd;
      }));
  }
}
