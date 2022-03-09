import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account } from '@household/shared/types/types';

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss']
})
export class AccountHomeComponent implements OnInit {
  accounts: Account.Response[];
  openAccounts: Account.Response[];
  onlyOpenAccounts: boolean;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.onlyOpenAccounts = false;
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.openAccounts = this.accounts.filter(a => a.isOpen);
  }

}
