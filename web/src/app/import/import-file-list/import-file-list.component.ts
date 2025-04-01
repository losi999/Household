import { Component, Input } from '@angular/core';
import { File } from '@household/shared/types/types';

@Component({
  selector: 'household-import-file-list',
  standalone: false,
  templateUrl: './import-file-list.component.html',
  styleUrl: './import-file-list.component.scss',
})
export class ImportFileListComponent {
  @Input() files: File.Response[];

}
