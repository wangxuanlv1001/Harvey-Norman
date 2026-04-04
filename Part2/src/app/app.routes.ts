import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { InventoryFormComponent } from './inventory-form/inventory-form';
import { InventoryListComponent } from './inventory-list/inventory-list';
import { SearchComponent } from './search/search';
import { PrivacySecurityComponent } from './privacy-security/privacy-security';
import { HelpComponent } from './help/help';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manage', component: InventoryFormComponent },
  { path: 'list', component: InventoryListComponent },
  { path: 'search', component: SearchComponent },
  { path: 'privacy', component: PrivacySecurityComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', redirectTo: '' }
];