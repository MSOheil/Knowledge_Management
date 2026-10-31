import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeComponent, ITree } from '../../../shared/components/tree/tree.component';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-knowledge-tree',
  standalone: true,
  imports: [CommonModule, RouterModule, TreeComponent],
  templateUrl: './knowledge-tree.component.html',
  styleUrl: './knowledge-tree.component.scss'
})
export class KnowledgeTreeComponent implements OnInit {
  private seo = inject(SeoService);

  public treeConfig: ITree = {
    header: 'ساختار درخت دانش شهرداری اصفهان',
    loadURL: `${environment.apiUrl}/admin/knowledge-tree/tree`,
    saveURL: `${environment.apiUrl}/admin/knowledge-tree/save`,
    deleteURL: `${environment.apiUrl}/admin/knowledge-tree`,
    treeCrudButtons: true,
    filter: true,
    selectionMode: 'single'
  };

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'مدیریت درخت دانش',
      description: 'مدیریت سلسله‌مراتب و ساختار درخت دانش شهرداری اصفهان - شاخه‌های کلان، سازمانی و تخصصی',
      canonicalUrl: 'https://km.isfahan.ir/admin/knowledge-tree'
    });
  }
}
