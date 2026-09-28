import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ZoneViewModel, ZoneStatus } from '../../models/conquest.model';

@Component({
  selector: 'app-conquest-node',
  templateUrl: './conquest-node.component.html',
  styleUrls: ['./conquest-node.component.scss']
})
export class ConquestNodeComponent {
  @Input({ required: true }) zone!: ZoneViewModel;

  @Output() zoneClick = new EventEmitter<ZoneViewModel>();

  readonly ZoneStatus = ZoneStatus;

  get isAvailable(): boolean {
    return this.zone.status === ZoneStatus.Available;
  }

  get isConquered(): boolean {
    return this.zone.status === ZoneStatus.Conquered;
  }

  get isLocked(): boolean {
    return this.zone.status === ZoneStatus.Locked;
  }

  onNodeClick(): void {
    if (this.isAvailable) {
      this.zoneClick.emit(this.zone);
    }
  }
}