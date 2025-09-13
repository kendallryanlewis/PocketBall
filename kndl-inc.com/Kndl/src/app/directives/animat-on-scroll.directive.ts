import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]'
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationClass = 'fade-up'; // e.g. 'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'blur-in', 'rotate-in'
  @Input() threshold: number = 0.2;          // how much must be visible to trigger
  @Input() rootMargin: string = '0px 0px -10% 0px'; // start a bit before it's fully in view

  private observer?: IntersectionObserver;
  private hasAnimated = false; // Track if animation has already run

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;

    // base classes
    this.renderer.addClass(node, 'animate');
    this.renderer.addClass(node, this.animationClass);

    // observe and toggle 'in-view' on enter/leave
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.renderer.addClass(node, 'in-view');   // enter view → animate
            this.hasAnimated = true; // Mark as animated
            this.observer?.unobserve(node); // Stop observing since animation only runs once
          }
        });
      },
      { threshold: this.threshold, root: null, rootMargin: this.rootMargin }
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
