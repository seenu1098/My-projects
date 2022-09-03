import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  
  public responseCache = new Map();
  
  constructor() { }
}
