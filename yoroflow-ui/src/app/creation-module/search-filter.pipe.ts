import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchValue: string, fieldName: string): any[] {
    if(!items) return [];
    if(!searchValue) return items;
    searchValue = searchValue.toLowerCase();
    return items.filter( item => {
        if (item && item[fieldName]) {
        return item[fieldName].toLowerCase().includes(searchValue);
        }
        return false;
    });
   }
}