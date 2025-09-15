import { Component, EventEmitter, HostListener, Output } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  assignee: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  category: string;
  createdDate: string;
}

@Component({
  selector: 'app-admin-task',
  templateUrl: './admin-task.component.html',
  styleUrls: ['./admin-task.component.scss']
})
export class AdminTaskComponent {
  @Output() sectionIds = new EventEmitter<string[]>();

  // Kanban columns
  columns = ['To Do', 'In Progress', 'Review', 'Done'];

  // Show new task modal
  showNewTaskModal = false;

  // Dropdown state
  dropdownOpen: string | null = null;

  // Drag and drop state
  draggedTask: Task | null = null;
  isDragOver: string | null = null;

  // New task form
  newTask: Partial<Task> = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    category: '',
    status: 'To Do'
  };

  // Sample tasks data
  tasks: Task[] = [
    {
      id: 'TASK-001',
      title: 'Website Redesign Project',
      description: 'Complete redesign of company website with modern UI/UX',
      priority: 'High',
      dueDate: '2025-09-15',
      assignee: 'Sarah Johnson',
      status: 'In Progress',
      category: 'Design',
      createdDate: '2025-08-20'
    },
    {
      id: 'TASK-002',
      title: 'Update Client Contracts',
      description: 'Review and update all client contracts for Q4',
      priority: 'Critical',
      dueDate: '2025-09-10',
      assignee: 'Mike Wilson',
      status: 'To Do',
      category: 'Legal',
      createdDate: '2025-08-25'
    },
    {
      id: 'TASK-003',
      title: 'Marketing Campaign Launch',
      description: 'Launch new marketing campaign for fall products',
      priority: 'Medium',
      dueDate: '2025-09-20',
      assignee: 'Lisa Chen',
      status: 'Review',
      category: 'Marketing',
      createdDate: '2025-08-15'
    },
    {
      id: 'TASK-004',
      title: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      priority: 'High',
      dueDate: '2025-09-12',
      assignee: 'John Smith',
      status: 'In Progress',
      category: 'Development',
      createdDate: '2025-08-18'
    },
    {
      id: 'TASK-005',
      title: 'Employee Training Sessions',
      description: 'Conduct quarterly training sessions for all departments',
      priority: 'Medium',
      dueDate: '2025-09-25',
      assignee: 'Emily Davis',
      status: 'Done',
      category: 'HR',
      createdDate: '2025-08-10'
    },
    {
      id: 'TASK-006',
      title: 'Security Audit',
      description: 'Perform comprehensive security audit of all systems',
      priority: 'Critical',
      dueDate: '2025-09-08',
      assignee: 'Alex Brown',
      status: 'To Do',
      category: 'Security',
      createdDate: '2025-08-30'
    }
  ];

  ngAfterViewInit() {
    // Collect all section IDs in the rendered view
    const ids = Array.from(document.querySelectorAll('section[id],div[id]')).map(
      (el: Element) => el.id
    );
    this.sectionIds.emit(ids);
  }

  // Get tasks by status for Kanban columns
  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  // Get priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  }

  // Get priority icon
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'Critical': return 'fa-exclamation-triangle';
      case 'High': return 'fa-arrow-up';
      case 'Medium': return 'fa-minus';
      case 'Low': return 'fa-arrow-down';
      default: return 'fa-circle';
    }
  }

  // Check if task is overdue
  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  // Get days until due
  getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Open new task modal
  openNewTaskModal(): void {
    this.showNewTaskModal = true;
    this.resetNewTask();
  }

  // Close new task modal
  closeNewTaskModal(): void {
    this.showNewTaskModal = false;
    this.resetNewTask();
  }

  // Reset new task form
  resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      assignee: '',
      category: '',
      status: 'To Do'
    };
  }

  // Add new task
  addTask(): void {
    if (this.newTask.title && this.newTask.description) {
      const task: Task = {
        id: 'TASK-' + String(this.tasks.length + 1).padStart(3, '0'),
        title: this.newTask.title!,
        description: this.newTask.description!,
        priority: this.newTask.priority as 'Low' | 'Medium' | 'High' | 'Critical',
        dueDate: this.newTask.dueDate!,
        assignee: this.newTask.assignee!,
        status: this.newTask.status as 'To Do' | 'In Progress' | 'Review' | 'Done',
        category: this.newTask.category!,
        createdDate: new Date().toISOString().split('T')[0]
      };

      this.tasks.push(task);
      this.closeNewTaskModal();
    }
  }

  // Move task to different status
  moveTask(taskId: string, newStatus: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus as 'To Do' | 'In Progress' | 'Review' | 'Done';
    }
  }

  // Delete task
  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  }

  // Toggle dropdown for task
  toggleDropdown(taskId: string): void {
    this.dropdownOpen = this.dropdownOpen === taskId ? null : taskId;
  }

  // Close dropdown
  closeDropdown(): void {
    this.dropdownOpen = null;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeDropdown();
    }
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', task.id);
    }

    // Add visual feedback to the dragged element
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent): void {
    // Reset visual feedback
    const target = event.target as HTMLElement;
    target.style.opacity = '1';

    // Clear dragged task
    this.draggedTask = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent, column: string): void {
    event.preventDefault();
    if (this.draggedTask && this.draggedTask.status !== column) {
      this.isDragOver = column;
    }
  }

  onDragLeave(event: DragEvent): void {
    // Only clear if we're actually leaving the drop zone
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.isDragOver = null;
    }
  }

  onDrop(event: DragEvent, targetColumn: string): void {
    event.preventDefault();

    // Clear drag over state
    this.isDragOver = null;

    if (this.draggedTask && this.draggedTask.status !== targetColumn) {
      // Update task status
      this.draggedTask.status = targetColumn as 'To Do' | 'In Progress' | 'Review' | 'Done';

      // Find and update the task in the tasks array
      const taskIndex = this.tasks.findIndex(t => t.id === this.draggedTask!.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...this.draggedTask };
      }
    }

    // Clear dragged task
    this.draggedTask = null;
  }
}
