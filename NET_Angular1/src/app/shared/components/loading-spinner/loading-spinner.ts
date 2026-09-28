import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    templateUrl: './loading-spinner.html',
    styleUrl: './loading-spinner.scss'
})

export class LoadingSpinnerComponent {
    @Input() isLoading = false;
    @Input() message = 'Loading...';
    @Input() diameter = 40;
}