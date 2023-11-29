import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Project, Recipient } from '@household/shared/types/types';

@Component({
  selector: 'app-report-home',
  templateUrl: './report-home.component.html',
  styleUrl: './report-home.component.scss',
})
export class ReportHomeComponent implements OnInit {
  accounts: Account.Response[];
  projects: Project.Response[];
  recipients: Recipient.Response[];
  categories: Category.Response[];
  form: FormGroup<{
    accountIds: FormControl<Account.Id[]>;
    categoryIds: FormControl<Category.Id[]>;
    projectIds: FormControl<Project.Id[]>;
    recipientIds: FormControl<Recipient.Id[]>;
  }>;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.projects = this.activatedRoute.snapshot.data.projects;
    this.recipients = this.activatedRoute.snapshot.data.recipients;
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.form = new FormGroup({
      accountIds: new FormControl(),
      categoryIds: new FormControl(),
      projectIds: new FormControl(),
      recipientIds: new FormControl(),
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
