import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ZoneViewModel, ZoneStatus, TreasureViewModel } from '../../models/conquest.model';
import { ConquestNodeComponent } from '../conquest-node/conquest-node.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-conquest-map',
    standalone: true,
    imports: [CommonModule, ConquestNodeComponent],
    templateUrl: './conquest-map.component.html',
    styleUrls: ['./conquest-map.component.scss']
})
export class ConquestMapComponent {
    @Input() zones: ZoneViewModel[] = [];
    @Input() treasures: TreasureViewModel[] = []; 

    @Output() zoneSelected = new EventEmitter<ZoneViewModel>();
    @Output() treasureSelected = new EventEmitter<TreasureViewModel>();

    readonly ZoneStatus = ZoneStatus;

    get serpentineRows(): ZoneViewModel[][] {
        const rowSize = 3;
        const rows: ZoneViewModel[][] = [];
        const currentZones = this.zones;
        for (let i = 0; i < currentZones.length; i += rowSize) {
            const rowIndex = Math.floor(i / rowSize);
            let chunk = currentZones.slice(i, i + rowSize);
            if (rowIndex % 2 === 1) {
                chunk = chunk.reverse();
            }
            rows.push(chunk);
        }
        return rows;
    }

    onZoneClick(zone: ZoneViewModel): void {
        this.zoneSelected.emit(zone);
    }

    onTreasureClick(treasure: TreasureViewModel, event: Event): void {
        event.stopPropagation();
        this.treasureSelected.emit(treasure);
    }

    getTreasureForIndex(index: number): TreasureViewModel | undefined {
        return this.treasures[index];
    }
}