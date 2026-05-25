import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace', pure: true })
export class ReplacePipe implements PipeTransform {
    transform(value: string, from: string, to: string): string {
        return value?.split(from).join(to) ?? value;
    }
}

@Pipe({ name: 'titlecase', pure: true })
export class TitleCasePipe implements PipeTransform {
    transform(value: string): string {
        return value?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? value;
    }
}
