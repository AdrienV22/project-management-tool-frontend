import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusFilter',
  standalone: true
})
export class StatusFilterPipe implements PipeTransform {
  transform(tasks: any[], selectedStatus: string): any[] {
    if (!selectedStatus) return tasks;
    return tasks.filter(task => task.status === selectedStatus);
  }
}
