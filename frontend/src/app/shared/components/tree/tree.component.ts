import { Component, Input, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

export interface ITree {
  header?: string;
  loadURL: string;
  saveURL: string;
  deleteURL?: string;
  treeCrudButtons?: boolean;
  filter?: boolean;
  selectionMode?: 'single' | 'multiple' | 'checkbox';
}

export interface TreeDataNode {
  id?: string;
  title: string;
  code?: string;
  description?: string;
  nodeOrder?: number;
  isActive?: boolean;
  parent?: { id?: string; title?: string } | null;
  children?: TreeDataNode[];
}

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss'
})
export class TreeComponent implements OnInit {
  @Input({ required: true }) config!: ITree;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  public nodes = signal<TreeDataNode[]>([]);
  public filteredNodes = signal<TreeDataNode[]>([]);
  public selectedNode = signal<TreeDataNode | null>(null);
  public expandedNodeIds = signal<Set<string>>(new Set());
  public isLoading = signal<boolean>(false);
  public searchQuery = signal<string>('');

  // Dialog State
  public showModal = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public parentForNewChild = signal<TreeDataNode | null>(null);
  public isSaving = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public nodeForm = this.fb.group({
    id: [''],
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    code: [''],
    description: [''],
    nodeOrder: [0, [Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTree();
    }
  }

  public loadTree(): void {
    if (!this.config?.loadURL) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<TreeDataNode[]>(this.config.loadURL).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.nodes.set(data || []);
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در بارگذاری درخت دانش');
      }
    });
  }

  public toggleExpand(nodeId: string, event: MouseEvent): void {
    event.stopPropagation();
    const set = new Set(this.expandedNodeIds());
    if (set.has(nodeId)) {
      set.delete(nodeId);
    } else {
      set.add(nodeId);
    }
    this.expandedNodeIds.set(set);
  }

  public isExpanded(nodeId: string): boolean {
    return this.expandedNodeIds().has(nodeId);
  }

  public selectNode(node: TreeDataNode): void {
    if (this.selectedNode()?.id === node.id) {
      this.selectedNode.set(null);
    } else {
      this.selectedNode.set(node);
    }
  }

  public onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.filteredNodes.set(this.nodes());
      return;
    }

    const filterRecursively = (items: TreeDataNode[]): TreeDataNode[] => {
      const result: TreeDataNode[] = [];
      for (const item of items) {
        const matchesSelf = item.title?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q);
        const filteredChildren = item.children ? filterRecursively(item.children) : [];

        if (matchesSelf || filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren
          });
          if (item.id) {
            this.expandedNodeIds.update(s => new Set(s).add(item.id!));
          }
        }
      }
      return result;
    };

    this.filteredNodes.set(filterRecursively(this.nodes()));
  }

  // CRUD Actions
  public openAddRoot(): void {
    this.isEditMode.set(false);
    this.parentForNewChild.set(null);
    this.nodeForm.reset({
      id: '',
      title: '',
      code: '',
      description: '',
      nodeOrder: 0,
      isActive: true
    });
    this.showModal.set(true);
  }

  public openAddChild(): void {
    const selected = this.selectedNode();
    if (!selected) return;

    this.isEditMode.set(false);
    this.parentForNewChild.set(selected);
    this.nodeForm.reset({
      id: '',
      title: '',
      code: '',
      description: '',
      nodeOrder: 0,
      isActive: true
    });
    this.showModal.set(true);
  }

  public openEditNode(): void {
    const selected = this.selectedNode();
    if (!selected) return;

    this.isEditMode.set(true);
    this.parentForNewChild.set(null);
    this.nodeForm.patchValue({
      id: selected.id,
      title: selected.title,
      code: selected.code || '',
      description: selected.description || '',
      nodeOrder: selected.nodeOrder || 0,
      isActive: selected.isActive !== false
    });
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
    this.errorMessage.set(null);
  }

  public saveNode(): void {
    if (this.nodeForm.invalid) {
      this.nodeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const val = this.nodeForm.value;
    const payload: any = {
      title: val.title,
      code: val.code || null,
      description: val.description || null,
      nodeOrder: val.nodeOrder ?? 0,
      isActive: val.isActive ?? true
    };

    if (this.isEditMode() && val.id) {
      payload.id = val.id;
    } else if (this.parentForNewChild()?.id) {
      payload.parent = { id: this.parentForNewChild()!.id };
    }

    this.http.post<TreeDataNode>(this.config.saveURL, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadTree();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در ذخیره‌سازی شاخه درخت دانش');
      }
    });
  }

  public deleteSelectedNode(): void {
    const selected = this.selectedNode();
    if (!selected?.id) return;

    const confirmed = confirm(`آیا از حذف شاخه دانش «${selected.title}» و تمامی زیرشاخه‌های آن اطمینان دارید؟`);
    if (!confirmed) return;

    const deleteUrl = this.config.deleteURL
      ? `${this.config.deleteURL}/${selected.id}`
      : `${this.config.saveURL.replace('/save', '')}/${selected.id}`;

    this.isLoading.set(true);
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.selectedNode.set(null);
        this.loadTree();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در حذف شاخه درخت دانش');
      }
    });
  }
}
