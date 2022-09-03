import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorpickerService {
  colorList: any = [];
  constructor() { }
  getcolorlist() {
    return [
    { parent: '#F9F1F0', childs: ['#F79489', '#D48C70', '#391306', '#AA1945', '#E9EAE0', '#3B0918', '#B8390E', '#FFF3D9', '#ECC0B0', '#F9E4D0', '#821D30', '#FB6090', '#F7D6D0', '#FF0080', '#EC9EC0', '#EBE0D0','#5F093D','#EFD3B5','#D67BA8','#3D0610','#9F0840','#F264D0','#EE99D0','#A91B60','#FF0080','#EC9EC0','#EBE0D0'] },
    { parent: '#741AAC', childs: ['#DEBAD6', '#340744', '#005437', '#D103D1', '#6D8343', '#A3C14A', '#613659', '#211522', '#C197D2', '#D3B1C2', '#3D5B59', '#B5E5CF', '#FCB5AC', '#B99095', '#65463E', '#DCBAA9','#D2E5D0','#A1AFA0','#970C10','#710117','#EC8FD0','#D43790','#F2C5E0','#AE388B','#5DF15D','#5DF15D','#F9B4F6'] },
    { parent: '#FF2511', childs: ['#C6B79B', '#2F2440', '#BA0F30', '#FC3C80', '#A16AE8', '#B4FEE7', '#281C2D', '#8155BA', '#695E93', '#BEAFC2', '#9388A2', '#341948', '#170B3B', '#0E050F', '#4C3D40', '#BDB5C0','#C8B4D0','#F6EEF0','#323E42','#FD49A0','#A16AE8','#B4FEE7','#603F8B','#281C2D','#8155BA','#695E93','#BEAFC2'] },
    { parent: '#0A7029', childs: ['#FEDE00', '#C8DF52', '#DBE8D8', '#282120', '#FAD02C', '#F8EFE4', '#E6C2BF', '#FFAEBC', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#E1C340', '#4CD7D0', '#A4E8E0', '#F8EA8C', '#E151AF','#B2D7DA','#F2E34C','#ABEA7C','#325505','#ABA70C','#FFCC00','#F0EEDA','#DAD870','#FFCD58','#FF9636','#FF5C4D'] },
     { parent: '#0A48AC', childs: ['#13172B', '#0E7016', '#EC2551', '#59981A', '#E9EAE0', '#81B622', '#3D550C', '#31352E', '#EBEBE8', '#D1E2C4', '#778A35', '#18A558', '#A3EBB1', '#21B6A8', '#116530', '#94C973','#2F5233','#B1D8B7','#76B947','#1D741B','#88CA5E','#F1C0B9','#D2FBA4','#08313A','#5CD85A','#107869','#1A5653'] },
     ]
  }
}
