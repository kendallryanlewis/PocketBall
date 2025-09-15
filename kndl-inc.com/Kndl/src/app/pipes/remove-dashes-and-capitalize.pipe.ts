import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'RemoveDashesAndCapitalize'
})
export class RemoveDashesAndCapitalizePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        // Remove dashes, split into words, capitalize each word
        return value
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
