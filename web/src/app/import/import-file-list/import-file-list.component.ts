import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { File } from '@household/shared/types/types';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'household-import-file-list',
  imports: [
    NgxSkeletonLoaderModule,
    MatListModule,
  ],
  templateUrl: './import-file-list.component.html',
  styleUrl: './import-file-list.component.scss',
})
export class ImportFileListComponent {
  @Input() files: File.Response[];

}
