import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'household-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private matIconReg = inject(MatIconRegistry);

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }
}
