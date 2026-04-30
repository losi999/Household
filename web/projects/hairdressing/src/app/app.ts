import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hairdressing-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private matIconReg = inject(MatIconRegistry);

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }
}
