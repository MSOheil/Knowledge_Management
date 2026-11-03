import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService, WorkspaceTab } from '../../core/services/layout.service';

@Component({
  selector: 'app-workspace-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workspace-tabs.component.html',
  styleUrl: './workspace-tabs.component.scss'
})
export class WorkspaceTabsComponent {
  public layout = inject(LayoutService);

  public selectTab(tab: WorkspaceTab): void {
    this.layout.selectTab(tab);
  }

  public closeTab(tabId: string, event: Event): void {
    this.layout.closeTab(tabId, event);
  }
}

