import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreationCacheService {

  constructor() { }

  public responseCache = new Map();
}
