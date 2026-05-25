import { Directive, HostListener, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[sharedHoldableButton]',
})
export class HoldableButton implements OnDestroy {
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
    this.clearTimers();
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    clearTimeout(this.timeoutId);
    clearInterval(this.intervalId);
  }
}
