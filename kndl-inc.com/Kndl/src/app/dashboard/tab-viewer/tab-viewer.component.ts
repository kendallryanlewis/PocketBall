import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tab-viewer',
  templateUrl: './tab-viewer.component.html'
})
export class TabViewerComponent implements AfterViewInit, OnChanges {
  @Input() selectedTab: string = '';
  @Input() subTab: string = '';
  @Output() sectionIds = new EventEmitter<string[]>();
  @Output() selectedTabChange = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedTab']) {
      setTimeout(() => {
        const ids = Array.from(document.querySelectorAll('section[id],div[id]')).map(
          (el: Element) => el.id
        );
        this.sectionIds.emit(ids);
      }, 100); // Small delay to ensure DOM is updated
    }
    if (changes['selectedTabChange']) {
      this.selectedTabChange.emit(this.subTab);
      console.log('selectedTabChange emitted:', this.subTab);
    }
  }

  onSetSubTab(id: string) {
    this.subTab = id;
    this.selectedTabChange.emit(this.subTab);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.retrieveSectionIds();
  }

  retrieveSectionIds() {
    setTimeout(() => {
      const ids = Array.from(document.querySelectorAll('section[id],div[id]')).map(
        (el: Element) => el.id
      );
      this.sectionIds.emit(ids);
    }, 100);
  }
}
