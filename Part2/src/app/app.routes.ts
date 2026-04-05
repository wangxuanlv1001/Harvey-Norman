import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { SearchComponent } from './search/search.component';
import { PrivacySecurityComponent } from './privacy-security/privacy-security.component';
import { HelpComponent } from './help/help.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manage', component: InventoryFormComponent },
  { path: 'list', component: InventoryListComponent },
  { path: 'search', component: SearchComponent },
  { path: 'privacy', component: PrivacySecurityComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', redirectTo: '' }
];
