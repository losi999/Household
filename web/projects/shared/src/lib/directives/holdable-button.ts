import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[sharedHoldableButton]',
})
export class HoldableButton {
  private timeoutId: number;
  private intervalId: number;

  hold = output();

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event) {
    event.preventDefault();
  }

  @HostListener('pointerdown')
  onPointerDown() {
    this.hold.emit();
    this.timeoutId = window.setTimeout(() => {
      this.intervalId = window.setInterval(() => {
        this.hold.emit();
      }, 250);
    }, 300);
  }

  @HostListener('pointerup')
  @HostListener('pointerleave')
  @HostListener('pointercancel')
  onPointerStop() {
    clearTimeout(this.timeoutId);
    clearInterval(this.intervalId);
    
  }
}
