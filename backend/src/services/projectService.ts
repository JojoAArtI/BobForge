import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectsStorage,
  NotFoundError,
  ValidationError,
} from '../types';
import { readData, writeData } from '../utils/fileUtils';

const PROJECTS_FILE = 'projects.json';

/**
 * Project Service
 * Handles CRUD operations for projects
 */
class ProjectService {
  /**
   * Create a new project
   */
  async createProject(data: CreateProjectDTO): Promise<Project> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }
    if (!data.description || data.description.trim().length === 0) {
      throw new ValidationError('Project description is required');
    }
    if (!data.apiDocumentation || data.apiDocumentation.trim().length === 0) {
      throw new ValidationError('API documentation is required');
    }

    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);

    const project: Project = {
      id: uuidv4(),
      name: data.name.trim(),
      description: data.description.trim(),
      apiDocumentation: data.apiDocumentation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };

    storage.projects.push(project);
    await writeData(PROJECTS_FILE, storage);

    console.log(`[ProjectService] Created project: ${project.id} - ${project.name}`);
    return project;
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    const project = storage.projects.find((p) => p.id === id);

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    return project;
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<Project[]> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    // Sort by most recent first
    return storage.projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Update a project
   */
  async updateProject(id: string, updates: UpdateProjectDTO): Promise<Project> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    const projectIndex = storage.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundError('Project', id);
    }

    const project = storage.projects[projectIndex];

    // Apply updates
    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        throw new ValidationError('Project name cannot be empty');
      }
      project.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      if (updates.description.trim().length === 0) {
        throw new ValidationError('Project description cannot be empty');
      }
      project.description = updates.description.trim();
    }
    if (updates.apiDocumentation !== undefined) {
      project.apiDocumentation = updates.apiDocumentation;
    }
    if (updates.status !== undefined) {
      project.status = updates.status;
    }

    project.updatedAt = new Date().toISOString();

    storage.projects[projectIndex] = project;
    await writeData(PROJECTS_FILE, storage);

    console.log(`[ProjectService] Updated project: ${project.id}`);
    return project;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    const projectIndex = storage.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundError('Project', id);
    }

    storage.projects.splice(projectIndex, 1);
    await writeData(PROJECTS_FILE, storage);

    console.log(`[ProjectService] Deleted project: ${id}`);
  }

  /**
   * Check if a project exists
   */
  async projectExists(id: string): Promise<boolean> {
    try {
      await this.getProject(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    return storage.projects.filter((p) => p.status === status);
  }

  /**
   * Search projects by name
   */
  async searchProjects(query: string): Promise<Project[]> {
    const storage = await readData<ProjectsStorage>(PROJECTS_FILE);
    const lowerQuery = query.toLowerCase();
    return storage.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const projectService = new ProjectService();

// Made with Bob
