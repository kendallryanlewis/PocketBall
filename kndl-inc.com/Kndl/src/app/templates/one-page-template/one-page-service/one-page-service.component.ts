import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-one-page-service',
  templateUrl: './one-page-service.component.html',
  styleUrls: ['./one-page-service.component.scss']
})
export class OnePageServiceComponent implements AfterViewInit {
  @ViewChildren('optionVideo') optionVideos!: QueryList<ElementRef<HTMLVideoElement>>;
  plans = [
    { title: 'Starter', color: '#343a40' },
    { title: 'Growth', color: '#495057' },
    { title: 'Pro', color: '#212529' }
  ];

  optionList = [
    {
      video: 'assets/Video/foggy.mp4',
      icon: 'fas fa-walking',
      main: this.plans[0].title,
      sub: 'A great starting point for individuals or small teams.',
      title: this.plans[0].title,
      description: 'Perfect for individuals or small teams starting out.',
      color: this.plans[0].color
    },
    {
      video: 'assets/Video/office.mp4',
      icon: 'fas fa-snowflake',
      main: this.plans[1].title,
      sub: 'Scale up your business with more features.',
      title: this.plans[1].title,
      description: 'Ideal for growing businesses needing more features.',
      color: this.plans[1].color
    },
    {
      video: 'assets/Video/city.mp4',
      icon: 'fas fa-tree',
      main: this.plans[2].title,
      sub: 'Advanced tools for established teams and enterprises.',
      title: this.plans[2].title,
      description: 'Advanced solution for established teams and enterprises.',
      color: this.plans[2].color
    }
  ];
  activeIndex: number = 0;

  selectOption(index: number) {
    this.activeIndex = index;
    this.updateVideoPlayback();
  }

  ngAfterViewInit() {
    this.updateVideoPlayback();
    this.optionVideos.changes.subscribe(() => this.updateVideoPlayback());
  }

  updateVideoPlayback() {
    if (!this.optionVideos) return;
    this.optionVideos.forEach((videoRef, i) => {
      const video = videoRef.nativeElement;
      if (i === this.activeIndex) {
        video.play();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }
}


