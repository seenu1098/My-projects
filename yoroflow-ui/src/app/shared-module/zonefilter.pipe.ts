import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zonefilter'
})
export class ZonefilterPipe implements PipeTransform {

  transform(items: any[], searchValue: string, fieldName: string): any[] {
    if (!items) return [];
    if (!searchValue) return items;
    searchValue = searchValue.toLowerCase();
    return items.filter(item => {
      if (item && item.text) {
        return item.text.toLowerCase().includes(searchValue);
      } else if (item && item.name) {
        return item.name.toLowerCase().includes(searchValue);
      }
      return false;
    });
  }

}
