import { Project } from '@household/shared/types/types';
import { createFeatureSelector } from '@ngrx/store';

export const selectProjects = createFeatureSelector<Project.Response[]>('projects');
